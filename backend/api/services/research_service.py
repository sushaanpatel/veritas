"""Research service for orchestrating LangGraph workflows."""

import uuid
import asyncio
from typing import Dict, Any, Optional, AsyncGenerator
from datetime import datetime
import sys
import os

# Add parent directory to path to import from src
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../"))

from src.graph.workflow import create_research_workflow
from src.graph.enhanced_workflow import create_enhanced_research_workflow
from src.state.schema import ResearchState
from src.state.enhanced_schema import EnhancedResearchState
from database.models import ResearchTask
from database.connection import get_db_context


class ResearchService:
    """Service for managing research tasks."""
    
    def __init__(self):
        self.active_tasks: Dict[str, Dict[str, Any]] = {}
        self.last_agent: Dict[str, str] = {}  # Track last agent per task
    
    async def start_research(
        self,
        query: str,
        mode: str = "enhanced",
        options: Optional[Dict[str, Any]] = None
    ) -> str:
        """Start a new research task.
        
        Args:
            query: Research query
            mode: "basic" or "enhanced"
            options: Optional research configuration
            
        Returns:
            Task ID
        """
        task_id = str(uuid.uuid4())
        
        # Create database entry
        with get_db_context() as db:
            task = ResearchTask(
                task_id=task_id,
                query=query,
                mode=mode,
                status="pending",
                options=options,
                created_at=datetime.utcnow()
            )
            db.add(task)
        
        # Store in active tasks
        self.active_tasks[task_id] = {
            "query": query,
            "mode": mode,
            "options": options or {},
            "status": "pending",
            "progress": 0,
            "current_agent": None,
            "start_time": datetime.utcnow()
        }
        
        return task_id
    
    async def execute_research(
        self,
        task_id: str,
        websocket_callback: Optional[callable] = None
    ) -> Dict[str, Any]:
        """Execute research task with optional WebSocket updates.
        
        Args:
            task_id: Task ID
            websocket_callback: Optional callback for sending WebSocket messages
            
        Returns:
            Research results
        """
        if task_id not in self.active_tasks:
            raise ValueError(f"Task {task_id} not found")
        
        task_info = self.active_tasks[task_id]
        query = task_info["query"]
        mode = task_info["mode"]
        options = task_info["options"]
        
        # Update status
        task_info["status"] = "in_progress"
        self._update_db_status(task_id, "in_progress", started_at=datetime.utcnow())
        
        if websocket_callback:
            await websocket_callback({
                "type": "status_update",
                "status": "in_progress",
                "message": "Research started",
                "progress": 0
            })
        
        try:
            # Create workflow based on mode
            if mode == "enhanced":
                app = create_enhanced_research_workflow()
                initial_state = self._create_enhanced_state(query, options)
            else:
                app = create_research_workflow()
                initial_state = self._create_basic_state(query, options)
            
            # Execute workflow with streaming in thread pool
            result = await self._execute_workflow_async(
                app, initial_state, task_id, websocket_callback
            )

            # result is accumulated state from all LangGraph nodes
            report = result.get("final_report") or ""
            quality_metrics = result.get("quality_metrics") or {}
            sources_count = len(result.get("sources") or [])
            facts_count = len(result.get("verified_facts") or [])
            
            # Calculate duration
            duration = int((datetime.utcnow() - task_info["start_time"]).total_seconds())
            
            # Update task info
            task_info["status"] = "completed"
            task_info["progress"] = 100
            task_info["report"] = report
            task_info["quality_metrics"] = quality_metrics
            
            # Update database
            self._update_db_completion(
                task_id,
                report=report,
                quality_metrics=quality_metrics,
                sources_count=sources_count,
                facts_count=facts_count,
                duration=duration
            )
            
            if websocket_callback:
                await websocket_callback({
                    "type": "research_complete",
                    "report": report,
                    "progress": 100,
                    "metadata": {
                        "query": query,
                        "mode": mode,
                        "duration": duration,
                        "quality_score": quality_metrics.get("overall_quality") if quality_metrics else None,
                        "sources_count": sources_count,
                        "facts_count": facts_count,
                        "timestamp": datetime.utcnow().isoformat(),
                    }
                })
            
            return {
                "task_id": task_id,
                "report": report,
                "metadata": {
                    "query": query,
                    "mode": mode,
                    "duration": duration,
                    "quality_score": quality_metrics.get("overall_quality"),
                    "sources_count": sources_count,
                    "facts_count": facts_count
                }
            }
            
        except Exception as e:
            # Handle errors
            task_info["status"] = "failed"
            error_msg = str(e)
            
            self._update_db_status(
                task_id,
                "failed",
                error_message=error_msg,
                completed_at=datetime.utcnow()
            )
            
            if websocket_callback:
                await websocket_callback({
                    "type": "error",
                    "error": error_msg
                })
            
            raise
    
    async def _execute_workflow_async(
        self,
        app,
        initial_state: Dict[str, Any],
        task_id: str,
        websocket_callback: Optional[callable]
    ) -> Dict[str, Any]:
        """Execute workflow in thread pool to avoid blocking."""
        task_info = self.active_tasks[task_id]
        
        # Agent progress mapping
        agent_progress = {
            "coordinator": 10,
            "web_search": 30,
            "analysis": 50,
            "synthesis": 70,
            "fact_checker": 85,
            "report_writer": 95
        }
        
        # Agent display names
        agent_names = {
            "coordinator": "Coordinator",
            "web_search": "Web Search",
            "analysis": "Analysis",
            "synthesis": "Synthesis",
            "fact_checker": "Fact Checker",
            "report_writer": "Report Writer"
        }
        
        accumulated_state: Dict[str, Any] = {}
        sent_messages = set()  # Track sent message IDs to avoid duplicates

        # Run synchronous stream in thread pool
        loop = asyncio.get_event_loop()

        def sync_stream():
            """Synchronous streaming function with detailed message extraction."""
            print(f"[ResearchService] Starting workflow stream for task {task_id}")

            for event in app.stream(initial_state):
                # Each event is {node_name: node_output_state}.
                # Merge every node's output into accumulated_state so callers
                # can do accumulated_state.get("final_report") directly.
                for node_name, node_state in event.items():
                    if isinstance(node_state, dict):
                        accumulated_state.update(node_state)

                    current_agent = node_state.get("current_agent") if isinstance(node_state, dict) else None

                    if current_agent and current_agent != self.last_agent.get(task_id):
                        # New agent started
                        print(f"[ResearchService] Agent transition: {self.last_agent.get(task_id)} -> {current_agent}")
                        self.last_agent[task_id] = current_agent
                        task_info["current_agent"] = current_agent
                        progress = agent_progress.get(current_agent, task_info["progress"])
                        task_info["progress"] = progress

                        self._update_db_progress(task_id, current_agent=current_agent, progress=progress)

                        if websocket_callback:
                            asyncio.run_coroutine_threadsafe(
                                websocket_callback({
                                    "type": "agent_start",
                                    "agent": current_agent,
                                    "progress": progress,
                                    "message": f"{agent_names.get(current_agent, current_agent)} started"
                                }),
                                loop
                            )

                    if current_agent and websocket_callback and isinstance(node_state, dict):
                        messages = node_state.get("messages", [])
                        for idx, msg in enumerate(messages):
                            message_content = ""
                            try:
                                if hasattr(msg, 'content'):
                                    message_content = str(msg.content)
                                elif isinstance(msg, dict):
                                    message_content = str(msg.get('content', msg))
                                else:
                                    message_content = str(msg)
                            except Exception as e:
                                print(f"[ResearchService] Error extracting message content: {e}")
                                continue

                            if not message_content or message_content.strip() == "":
                                continue

                            msg_id = f"{current_agent}:{idx}:{hash(message_content)}"
                            if msg_id not in sent_messages:
                                sent_messages.add(msg_id)
                                msg_type = "agent_info"
                                content_lower = message_content.lower()
                                if any(w in content_lower for w in ["complete", "found", "generated", "extracted", "verified", "success"]):
                                    msg_type = "agent_success"
                                elif any(w in content_lower for w in ["error", "failed", "warning"]):
                                    msg_type = "agent_warning"

                                asyncio.run_coroutine_threadsafe(
                                    websocket_callback({
                                        "type": msg_type,
                                        "agent": current_agent,
                                        "progress": agent_progress.get(current_agent, task_info["progress"]),
                                        "message": message_content
                                    }),
                                    loop
                                )

                    if isinstance(node_state, dict):
                        quality_metrics = node_state.get("quality_metrics")
                        if quality_metrics and websocket_callback:
                            if quality_metrics.get("overall_quality", 0) > 0:
                                asyncio.run_coroutine_threadsafe(
                                    websocket_callback({
                                        "type": "quality_update",
                                        "metrics": quality_metrics
                                    }),
                                    loop
                                )

            return accumulated_state

        await loop.run_in_executor(None, sync_stream)
        return accumulated_state
    
    def _create_basic_state(self, query: str, options: Dict[str, Any]) -> ResearchState:
        """Create initial state for basic workflow.

        Basic mode is intentionally lightweight: fewer sources, shallower analysis,
        no fact-checking by default, no iterative refinement.
        """
        strategy = {
            "type": "overview",
            "max_sources": options.get("max_sources", 15),
            "search_depth": options.get("search_depth", "basic"),
            "analysis_depth": options.get("analysis_depth", "medium"),
            "requires_fact_check": options.get("requires_fact_check", False),
            "requires_iteration": False,
        }
        return {
            "query": query,
            "research_goals": [],
            "subtasks": [],
            "sources": [],
            "extracted_facts": [],
            "key_insights": [],
            "synthesized_content": "",
            "verified_facts": [],
            "final_report": None,
            "messages": [],
            "current_agent": "",
            "timestamp": datetime.now().isoformat(),
            "agent_history": [],
            "strategy": strategy,
            "user_options": options,
        }

    def _create_enhanced_state(self, query: str, options: Dict[str, Any]) -> EnhancedResearchState:
        """Create initial state for enhanced workflow.

        Enhanced mode defaults to deep, comprehensive research. The coordinator
        will refine the strategy based on query analysis, but user-specified options
        are stored in user_options and will be merged as hard overrides by the coordinator.
        """
        strategy = {
            "type": "overview",
            "max_sources": options.get("max_sources", 30),
            "search_depth": options.get("search_depth", "advanced"),
            "analysis_depth": options.get("analysis_depth", "deep"),
            "requires_fact_check": options.get("requires_fact_check", True),
            "requires_iteration": options.get("requires_iteration", True),
        }
        return {
            "query": query,
            "research_goals": [],
            "subtasks": [],
            "sources": [],
            "extracted_facts": [],
            "key_insights": [],
            "synthesized_content": "",
            "verified_facts": [],
            "final_report": None,
            "messages": [],
            "current_agent": "",
            "timestamp": datetime.now().isoformat(),
            "agent_history": [],
            "quality_metrics": {},
            "strategy": strategy,
            "user_options": options,
            "iteration": 0,
            "needs_refinement": False,
        }
    
    def _update_db_status(
        self,
        task_id: str,
        status: str,
        error_message: Optional[str] = None,
        started_at: Optional[datetime] = None,
        completed_at: Optional[datetime] = None
    ):
        """Update task status in database."""
        with get_db_context() as db:
            task = db.query(ResearchTask).filter_by(task_id=task_id).first()
            if task:
                task.status = status
                if error_message:
                    task.error_message = error_message
                if started_at:
                    task.started_at = started_at
                if completed_at:
                    task.completed_at = completed_at
    
    def _update_db_progress(
        self,
        task_id: str,
        current_agent: str,
        progress: int
    ):
        """Update task progress in database."""
        with get_db_context() as db:
            task = db.query(ResearchTask).filter_by(task_id=task_id).first()
            if task:
                task.current_agent = current_agent
                task.progress = progress
    
    def _update_db_completion(
        self,
        task_id: str,
        report: str,
        quality_metrics: Dict[str, Any],
        sources_count: int,
        facts_count: int,
        duration: int
    ):
        """Update task completion in database."""
        with get_db_context() as db:
            task = db.query(ResearchTask).filter_by(task_id=task_id).first()
            if task:
                task.status = "completed"
                task.report = report
                task.quality_metrics = quality_metrics
                task.sources_count = sources_count
                task.facts_count = facts_count
                task.duration = duration
                task.completed_at = datetime.utcnow()
    
    def get_task_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Get task status.
        
        Args:
            task_id: Task ID
            
        Returns:
            Task status dictionary or None if not found
        """
        # Check active tasks first
        if task_id in self.active_tasks:
            return self.active_tasks[task_id]
        
        # Check database
        with get_db_context() as db:
            task = db.query(ResearchTask).filter_by(task_id=task_id).first()
            if task:
                return {
                    "task_id": task.task_id,
                    "query": task.query,
                    "mode": task.mode,
                    "status": task.status,
                    "progress": task.progress,
                    "current_agent": task.current_agent,
                    "report": task.report,
                    "quality_metrics": task.quality_metrics,
                    "sources_count": task.sources_count,
                    "facts_count": task.facts_count,
                    "duration": task.duration,
                    "error_message": task.error_message,
                    "created_at": task.created_at.isoformat() if task.created_at else None,
                    "started_at": task.started_at.isoformat() if task.started_at else None,
                    "completed_at": task.completed_at.isoformat() if task.completed_at else None
                }
        
        return None
    
    async def cancel_task(self, task_id: str):
        """Cancel a running task.
        
        Args:
            task_id: Task ID
        """
        if task_id in self.active_tasks:
            self.active_tasks[task_id]["status"] = "cancelled"
            self._update_db_status(
                task_id,
                "cancelled",
                completed_at=datetime.utcnow()
            )


# Global service instance
research_service = ResearchService()
