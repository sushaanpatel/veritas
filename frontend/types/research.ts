/**
 * Research API Types
 * Type definitions for research requests and responses
 */

export type ResearchMode = 'basic' | 'enhanced';

export type ResearchStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

export type AgentName = 
  | 'coordinator'
  | 'web_search'
  | 'analysis'
  | 'synthesis'
  | 'fact_checker'
  | 'report_writer';

export type AgentStatus = 'pending' | 'active' | 'completed' | 'failed';

export interface ResearchOptions {
  max_sources?: number;
  search_depth?: 'basic' | 'advanced';
  analysis_depth?: 'shallow' | 'medium' | 'deep';
  requires_fact_check?: boolean;
  requires_iteration?: boolean;
}

export interface ResearchRequest {
  query: string;
  mode: ResearchMode;
  options?: ResearchOptions;
}

export interface QualityMetrics {
  source_diversity: number;
  content_depth: number;
  fact_confidence: number;
  citation_coverage: number;
  overall_quality: number;
}

export interface ResearchMetadata {
  query: string;
  mode: ResearchMode;
  duration?: number;
  quality_score?: number;
  sources_count?: number;
  facts_count?: number;
  timestamp: string;
}

export interface ResearchStartResponse {
  task_id: string;
  status: 'started';
  websocket_url: string;
  message: string;
}

export interface ResearchStatusResponse {
  task_id: string;
  status: ResearchStatus;
  current_agent?: string;
  progress: number;
  quality_metrics?: QualityMetrics;
  estimated_time_remaining?: number;
  error?: string;
}

export interface ResearchReportResponse {
  task_id: string;
  report: string;
  metadata: ResearchMetadata;
}

export interface HistoryItem {
  task_id: string;
  query: string;
  mode: ResearchMode;
  status: 'completed' | 'failed' | 'cancelled';
  quality_score?: number;
  duration?: number;
  timestamp: string;
  preview?: string;
}

export interface HistoryListResponse {
  items: HistoryItem[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface ErrorResponse {
  error: string;
  detail?: string;
  task_id?: string;
}

export interface SuccessResponse {
  success: boolean;
  message: string;
  data?: Record<string, any>;
}

// WebSocket message types
export type WebSocketMessageType =
  | 'connected'
  | 'agent_start'
  | 'agent_progress'
  | 'agent_complete'
  | 'agent_info'
  | 'agent_success'
  | 'agent_warning'
  | 'agent_error'
  | 'quality_update'
  | 'status_update'
  | 'research_complete'
  | 'error'
  | 'cancelled';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  task_id?: string;
  agent?: AgentName;
  message?: string;
  progress?: number;
  quality_metrics?: QualityMetrics;
  report?: string;
  metadata?: ResearchMetadata;
  error?: string;
  timestamp?: string;
}

export interface AgentState {
  name: AgentName;
  status: AgentStatus;
  progress: number;
  message?: string;
  timestamp?: string;
  error?: string;
}

export interface ActivityLogEntry {
  id: string;
  type: WebSocketMessageType;
  agent?: AgentName;
  message: string;
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
}