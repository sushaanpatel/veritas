/**
 * useWebSocket Hook
 * React hook for WebSocket connection and real-time updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ResearchWebSocket } from '@/lib/websocket/client';
import type {
  WebSocketMessage,
  AgentState,
  QualityMetrics,
  AgentName,
  ActivityLogEntry,
} from '@/types/research';

interface UseWebSocketOptions {
  taskId: string;
  autoConnect?: boolean;
  onMessage?: (message: WebSocketMessage) => void;
}

export function useWebSocket({
  taskId,
  autoConnect = true,
  onMessage: onMessageCallback,
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentStates, setAgentStates] = useState<AgentState[]>([
    { name: 'web_search', status: 'pending', progress: 0 },
    { name: 'analysis', status: 'pending', progress: 0 },
    { name: 'synthesis', status: 'pending', progress: 0 },
    { name: 'fact_checker', status: 'pending', progress: 0 },
    { name: 'report_writer', status: 'pending', progress: 0 },
  ]);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);
  const [currentAgent, setCurrentAgent] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [reportData, setReportData] = useState<{ report: string; metadata: any } | null>(null);

  const wsRef = useRef<ResearchWebSocket | null>(null);

  const updateAgentState = useCallback((agentName: AgentName, updates: Partial<AgentState>) => {
    setAgentStates((prev) =>
      prev.map((agent) =>
        agent.name === agentName ? { ...agent, ...updates } : agent
      )
    );
  }, []);

  const addActivityLogEntry = useCallback((message: WebSocketMessage) => {
    const entry: ActivityLogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      type: message.type,
      agent: message.agent,
      message: message.message || '',
      timestamp: message.timestamp || new Date().toISOString(),
      level: message.type.includes('error')
        ? 'error'
        : message.type.includes('warning')
        ? 'warning'
        : message.type.includes('success') || message.type.includes('complete')
        ? 'success'
        : 'info',
    };

    setActivityLog((prev) => [...prev, entry].slice(-50)); // Keep last 50 entries
  }, []);

  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      console.log('[useWebSocket] Received message:', JSON.stringify(message, null, 2));
      
      // Call external callback if provided
      onMessageCallback?.(message);

      // Add to activity log
      if (message.message) {
        addActivityLogEntry(message);
      }

      // Handle different message types
      switch (message.type) {
        case 'connected':
          setIsConnected(true);
          setError(null);
          break;

        case 'agent_start':
          if (message.agent) {
            console.log('[useWebSocket] Agent started:', message.agent, 'Progress:', message.progress);
            updateAgentState(message.agent, {
              status: 'active',
              message: message.message,
              timestamp: message.timestamp,
              progress: message.progress || 0,
            });
            setCurrentAgent(message.agent);
            // Update overall progress from agent start message
            if (message.progress !== undefined) {
              console.log('[useWebSocket] Setting progress to:', message.progress);
              setProgress(message.progress);
            }
          }
          break;

        case 'agent_progress':
          if (message.agent) {
            updateAgentState(message.agent, {
              status: 'active',
              progress: message.progress || 0,
              message: message.message,
              timestamp: message.timestamp,
            });
          }
          if (message.progress !== undefined) {
            console.log('[useWebSocket] Setting progress to:', message.progress);
            setProgress(message.progress);
          }
          break;

        case 'agent_success':
        case 'agent_info':
        case 'agent_complete':
          if (message.agent) {
            console.log('[useWebSocket] Agent completed:', message.agent);
            updateAgentState(message.agent, {
              status: 'completed',
              progress: 100,
              message: message.message,
              timestamp: message.timestamp,
            });
            // Update overall progress if provided
            if (message.progress !== undefined) {
              console.log('[useWebSocket] Setting progress to:', message.progress);
              setProgress(message.progress);
            }
          }
          break;

        case 'agent_error':
        case 'agent_warning':
          if (message.agent) {
            updateAgentState(message.agent, {
              status: message.type === 'agent_error' ? 'failed' : 'active',
              error: message.error || message.message,
              timestamp: message.timestamp,
            });
          }
          if (message.type === 'agent_error') {
            setError(message.error || message.message || 'Agent error occurred');
          }
          break;

        case 'quality_update':
          if (message.quality_metrics || message.metrics) {
            const metrics = message.quality_metrics || message.metrics;
            console.log('[useWebSocket] Quality metrics:', metrics);
            setQualityMetrics(metrics);
          }
          break;

        case 'status_update':
          if (message.progress !== undefined) {
            console.log('[useWebSocket] Status update - Progress:', message.progress);
            setProgress(message.progress);
          }
          break;

        case 'research_complete':
          console.log('[useWebSocket] Research complete! Message:', message);
          console.log('[useWebSocket] Report exists:', !!message.report);
          console.log('[useWebSocket] Metadata exists:', !!message.metadata);
          console.log('[useWebSocket] Report length:', message.report?.length);
          
          setProgress(100);
          
          if (message.report) {
            const reportDataToSet = {
              report: message.report,
              metadata: message.metadata || {
                query: 'Research Query',
                mode: 'basic',
                duration: 0,
                sources_count: 0,
                facts_count: 0,
              },
            };
            console.log('[useWebSocket] Setting report data:', reportDataToSet);
            setReportData(reportDataToSet);
          } else {
            console.error('[useWebSocket] Research complete but no report in message!');
          }
          break;

        case 'error':
          setError(message.error || 'An error occurred');
          break;

        case 'cancelled':
          setError('Research was cancelled');
          break;

        default:
          console.log('[useWebSocket] Unhandled message type:', message.type);
      }
    },
    [onMessageCallback, addActivityLogEntry, updateAgentState]
  );

  useEffect(() => {
    if (!taskId || !autoConnect) return;

    console.log('[useWebSocket] Connecting to WebSocket for task:', taskId);

    const ws = new ResearchWebSocket(taskId, {
      onMessage: handleMessage,
      onError: (err) => {
        console.error('[useWebSocket] Error:', err);
        setError(err.message);
        setIsConnected(false);
      },
      onOpen: () => {
        console.log('[useWebSocket] Connected');
        setIsConnected(true);
        setError(null);
      },
      onClose: () => {
        console.log('[useWebSocket] Disconnected');
        setIsConnected(false);
      },
    });

    ws.connect();
    wsRef.current = ws;

    return () => {
      console.log('[useWebSocket] Cleaning up connection');
      ws.disconnect();
      wsRef.current = null;
    };
  }, [taskId, autoConnect, handleMessage]);

  const cancel = useCallback(() => {
    wsRef.current?.cancel();
  }, []);

  const disconnect = useCallback(() => {
    wsRef.current?.disconnect();
  }, []);

  console.log('[useWebSocket] Current state - reportData:', !!reportData, 'progress:', progress);

  return {
    isConnected,
    error,
    agentStates,
    qualityMetrics,
    currentAgent,
    progress,
    activityLog,
    reportData,
    cancel,
    disconnect,
  };
}
