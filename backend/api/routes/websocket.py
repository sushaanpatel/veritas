"""WebSocket route for real-time research updates."""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict
import asyncio
import json

from api.services.research_service import research_service

router = APIRouter(tags=["websocket"])

# Store active WebSocket connections
active_connections: Dict[str, WebSocket] = {}


@router.websocket("/ws/{task_id}")
async def websocket_endpoint(websocket: WebSocket, task_id: str):
    """WebSocket endpoint for streaming research progress.
    
    Args:
        websocket: WebSocket connection
        task_id: Research task ID
    """
    await websocket.accept()
    active_connections[task_id] = websocket
    
    try:
        # Send initial connection message
        await websocket.send_json({
            "type": "connected",
            "task_id": task_id,
            "message": "WebSocket connection established"
        })
        
        # Define callback for sending updates
        async def send_update(data: dict):
            """Send update through WebSocket."""
            try:
                await websocket.send_json(data)
            except Exception as e:
                print(f"Error sending WebSocket update: {e}")
        
        # Check if task exists
        status = research_service.get_task_status(task_id)
        if not status:
            await websocket.send_json({
                "type": "error",
                "error": "Task not found"
            })
            await websocket.close()
            return
        
        # If task is already completed, send the report
        if status.get("status") == "completed":
            await websocket.send_json({
                "type": "research_complete",
                "report": status.get("report", ""),
                "metadata": {
                    "duration": status.get("duration"),
                    "quality_metrics": status.get("quality_metrics"),
                    "sources_count": status.get("sources_count"),
                    "facts_count": status.get("facts_count")
                }
            })
        
        # If task is pending or in progress, execute it with WebSocket updates
        elif status.get("status") in ["pending", "in_progress"]:
            try:
                await research_service.execute_research(
                    task_id=task_id,
                    websocket_callback=send_update
                )
            except Exception as e:
                await websocket.send_json({
                    "type": "error",
                    "error": str(e)
                })
        
        # Keep connection alive and listen for client messages
        while True:
            try:
                # Wait for messages from client (e.g., cancel request)
                data = await websocket.receive_text()
                message = json.loads(data)
                
                if message.get("type") == "cancel":
                    await research_service.cancel_task(task_id)
                    await websocket.send_json({
                        "type": "cancelled",
                        "message": "Research task cancelled"
                    })
                    break
                    
            except WebSocketDisconnect:
                break
            except Exception as e:
                print(f"Error processing WebSocket message: {e}")
                break
    
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for task {task_id}")
    except Exception as e:
        print(f"WebSocket error for task {task_id}: {e}")
        try:
            await websocket.send_json({
                "type": "error",
                "error": str(e)
            })
        except:
            pass
    finally:
        # Clean up connection
        if task_id in active_connections:
            del active_connections[task_id]
        try:
            await websocket.close()
        except:
            pass
