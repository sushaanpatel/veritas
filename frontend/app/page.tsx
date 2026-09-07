'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { QueryInput } from '@/components/research/QueryInput';
import { ProgressBar } from '@/components/research/ProgressBar';
import { AgentGrid } from '@/components/research/AgentGrid';
import { ActivityLog } from '@/components/research/ActivityLog';
import { HistorySidebar } from '@/components/research/HistorySidebar';
import { ReportViewer } from '@/components/research/ReportViewer';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { useResearch } from '@/hooks/useResearch';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { ResearchMode, ResearchOptions } from '@/types/research';

/** 4-spoke radial spike mark — Anthropic brand glyph */
function SpikeMark({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <line x1="10" y1="1.5" x2="10" y2="18.5" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
      <line x1="1.5" y1="10" x2="18.5" y2="10" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
      <line x1="3.5" y1="3.5" x2="16.5" y2="16.5" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
      <line x1="16.5" y1="3.5" x2="3.5" y2="16.5" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

const SUGGESTED_TOPICS = [
  'How does CRISPR gene editing work and what are its current medical applications?',
  'What is the current state of nuclear fusion energy development?',
  'How do large language models learn, and what are their key architectural differences?',
];

export default function Home() {
  const router = useRouter();
  const [taskId, setTaskId] = useState<string | null>(null);
  const [isResearching, setIsResearching] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [fallbackReport, setFallbackReport] = useState<{ report: string; metadata: any } | null>(null);

  const { startResearch, isLoading, error: apiError, getReport } = useResearch();

  const {
    isConnected,
    agentStates,
    currentAgent,
    progress,
    activityLog,
    reportData,
    error: wsError,
    cancel,
  } = useWebSocket({
    taskId: taskId || '',
    autoConnect: !!taskId && isResearching,
  });

  // Fetch report via REST if WebSocket research_complete had an empty report
  useEffect(() => {
    if (!taskId || !isResearching) return;
    if (progress === 100 && !reportData) {
      getReport(taskId).then((data) => {
        if (data?.report) {
          setFallbackReport({ report: data.report, metadata: data.metadata });
        }
      });
    }
  }, [progress, taskId, reportData, isResearching, getReport]);

  // Auto-scroll to report when it becomes available
  useEffect(() => {
    if ((reportData || fallbackReport) && taskId) {
      setTimeout(() => {
        document.getElementById('report-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [reportData, fallbackReport, taskId]);

  const handleStartResearch = async (
    query: string,
    mode: ResearchMode,
    options?: ResearchOptions
  ) => {
    const response = await startResearch({ query, mode, options });
    if (response) {
      setTaskId(response.task_id);
      setIsResearching(true);
    }
  };

  const handleNewResearch = () => {
    setTaskId(null);
    setIsResearching(false);
    setFallbackReport(null);
  };

  const handleSelectHistoryTask = (historyTaskId: string) => {
    router.push(`/report/${historyTaskId}`);
  };

  const handleCancelResearch = () => {
    cancel();
    setIsResearching(false);
  };

  const activeReport = reportData || fallbackReport;
  const isComplete = !!activeReport || progress === 100;
  const error = apiError || wsError;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-canvas)' }}>

      {/* ── History button — top right ───────────────────────────────── */}
      <button
        onClick={() => setShowHistory(true)}
        className="btn btn-secondary btn-sm"
        aria-label="Research history"
        style={{
          position: 'fixed',
          top: 'var(--space-lg)',
          right: 'var(--space-lg)',
          zIndex: 1100,
          gap: 'var(--space-xs)',
          paddingLeft: 12,
          paddingRight: 16,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor"
          strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="10" r="8" />
          <path d="M10 6v4l2.5 2.5" />
        </svg>
        History
      </button>

      {/* ── Page body ───────────────────────────────────────────────────── */}
      <Container>
        {/* Error banner */}
        {error && (
          <div style={{ paddingTop: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}>
            <ErrorBanner message="An error occurred" detail={error} onDismiss={() => {}} />
          </div>
        )}

        {/* ── Initial state: hero + query input ─────────────────────────── */}
        {!isResearching && (
          <div style={{
            maxWidth: '760px',
            margin: '0 auto',
            paddingTop: 'var(--space-section)',
            paddingBottom: 'var(--space-section)',
          }}>
            {/* Spike mark accent */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-lg)' }}>
              <SpikeMark size={28} color="var(--color-primary)" />
            </div>

            {/* Display headline — serif weight 400, negative tracking (set by CSS class) */}
            <h1
              className="text-display-lg text-ink text-center"
              style={{ marginBottom: 'var(--space-xxxl)' }}
            >
              What are you curious about today?
            </h1>


            {/* Query Input */}
            <QueryInput
              onSubmit={handleStartResearch}
              isLoading={isLoading}
              disabled={isLoading}
            />

            {/* Suggested topics */}
            <div style={{ marginTop: 'var(--space-xxl)' }}>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-caption)',
                fontWeight: 500,
                color: 'var(--color-muted-soft)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                textAlign: 'center',
                marginBottom: 'var(--space-md)',
              }}>
                Try a suggested topic
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                {SUGGESTED_TOPICS.map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => handleStartResearch(topic, 'enhanced')}
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: 'var(--space-md) var(--space-lg)',
                      background: 'var(--color-surface-card)',
                      border: '1px solid var(--color-hairline-soft)',
                      borderRadius: 'var(--radius-lg)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-body-sm)',
                      color: 'var(--color-body)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-base)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 'var(--space-md)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--color-surface-cream-strong)';
                      e.currentTarget.style.borderColor = 'var(--color-hairline)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'var(--color-surface-card)';
                      e.currentTarget.style.borderColor = 'var(--color-hairline-soft)';
                    }}
                  >
                    <span>{topic}</span>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor"
                      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                      style={{ flexShrink: 0, color: 'var(--color-muted-soft)' }}>
                      <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Research in progress / complete ───────────────────────────── */}
        {isResearching && (
          <div style={{
            maxWidth: '1100px',
            margin: '0 auto',
            paddingTop: 'var(--space-xxl)',
            paddingBottom: 'var(--space-section)',
          }}>

            {/* Status row */}
            <div
              className="flex items-center justify-between"
              style={{ marginBottom: 'var(--space-xl)' }}
            >
              <div className="flex items-center" style={{ gap: 'var(--space-xs)' }}>
                <div style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: isConnected ? 'var(--color-success)' : 'var(--color-warning)',
                  boxShadow: isConnected
                    ? '0 0 6px rgba(93, 184, 114, 0.5)'
                    : '0 0 6px rgba(212, 160, 23, 0.5)',
                }} />
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-body-sm)',
                  color: 'var(--color-muted)',
                }}>
                  {isConnected ? 'Live' : 'Connecting…'}
                </span>
              </div>

              {!isComplete ? (
                <button onClick={handleCancelResearch} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
              ) : (
                <button onClick={handleNewResearch} className="btn btn-primary btn-sm">
                  New Research
                </button>
              )}
            </div>

            {/* Progress */}
            <div style={{ marginBottom: 'var(--space-xxl)' }}>
              <ProgressBar
                progress={progress}
                currentAgent={currentAgent}
                statusMessage={activityLog[activityLog.length - 1]?.message}
                isComplete={isComplete}
              />
            </div>

            {/* Agent grid */}
            <div style={{ marginBottom: 'var(--space-xxl)' }}>
              <AgentGrid agents={agentStates} />
            </div>

            {/* Report */}
            {activeReport && (
              <div id="report-section" style={{ marginBottom: 'var(--space-xxl)' }}>
                <div style={{
                  borderTop: '1px solid var(--color-hairline)',
                  paddingTop: 'var(--space-xxl)',
                  marginTop: 'var(--space-xxl)',
                }}>
                  <h2
                    className="text-display-sm text-ink"
                    style={{ marginBottom: 'var(--space-xl)' }}
                  >
                    Research Complete
                  </h2>
                  <ReportViewer report={activeReport.report} metadata={activeReport.metadata} />
                </div>
              </div>
            )}

            {/* Activity Log */}
            {activityLog.length > 0 && (
              <details style={{
                background: 'var(--color-surface-card)',
                border: '1px solid var(--color-hairline-soft)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
              }}>
                <summary style={{
                  padding: 'var(--space-md) var(--space-lg)',
                  listStyle: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-body-sm)',
                  fontWeight: 500,
                  color: 'var(--color-ink)',
                  userSelect: 'none',
                }}>
                  <span>Activity Log</span>
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-caption)',
                    color: 'var(--color-muted-soft)',
                    background: 'var(--color-surface-cream-strong)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-pill)',
                  }}>
                    {activityLog.length}
                  </span>
                </summary>
                <div style={{
                  padding: 'var(--space-md) var(--space-lg)',
                  borderTop: '1px solid var(--color-hairline-soft)',
                }}>
                  <ActivityLog entries={activityLog.slice(-10)} />
                </div>
              </details>
            )}
          </div>
        )}
      </Container>

      {/* History Sidebar */}
      <HistorySidebar
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onSelectTask={handleSelectHistoryTask}
      />
    </div>
  );
}
