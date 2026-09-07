/**
 * AgentCard Component
 * Displays individual agent status and progress
 */

import React from 'react';
import type { AgentState } from '@/types/research';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface AgentCardProps {
  agent: AgentState;
}

const agentDisplayNames: Record<string, string> = {
  coordinator: 'Coordinator',
  web_search: 'Web Search',
  analysis: 'Analysis',
  synthesis: 'Synthesis',
  fact_checker: 'Fact Checker',
  report_writer: 'Report Writer',
};

const agentIcons: Record<string, React.ReactNode> = {
  coordinator: (
    <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  web_search: (
    <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  analysis: (
    <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  synthesis: (
    <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  fact_checker: (
    <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  report_writer: (
    <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
};

export function AgentCard({ agent }: AgentCardProps) {
  const displayName = agentDisplayNames[agent.name] || agent.name;
  const icon = agentIcons[agent.name] || agentIcons.coordinator;
  const isActive = agent.status === 'active';
  const isCompleted = agent.status === 'completed';
  const isFailed = agent.status === 'failed';

  return (
    <div
      className={`card transition-all`}
      style={{
        background: isActive
          ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-active) 100%)'
          : 'var(--color-surface-card)',
        border: isActive
          ? '2px solid var(--color-primary-active)'
          : isCompleted
          ? '2px solid var(--color-success)'
          : isFailed
          ? '2px solid var(--color-error)'
          : '2px solid var(--color-hairline)',
        padding: 'var(--space-lg)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: isActive
          ? '0 4px 16px rgba(204, 120, 92, 0.3)'
          : '0 1px 3px rgba(20, 20, 19, 0.04)',
      }}
    >
      <div className="space-y-sm">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-sm">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                color: isActive ? 'white' : 'var(--color-primary)',
              }}
            >
              {icon}
            </div>
            <div>
              <h3
                className="text-title-md"
                style={{
                  color: isActive ? 'var(--color-on-primary)' : 'var(--color-ink)',
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {displayName}
              </h3>
              {agent.timestamp && (
                <p
                  className="text-caption"
                  style={{
                    marginTop: '2px',
                    color: isActive
                      ? 'rgba(255, 255, 255, 0.8)'
                      : 'var(--color-muted)',
                    fontSize: '12px',
                  }}
                >
                  {new Date(agent.timestamp).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          <StatusBadge status={agent.status} />
        </div>

        {/* Progress Bar (only for active agents) */}
        {isActive && agent.progress > 0 && (
          <div>
            <div 
              className="progress-bar"
              style={{
                background: 'rgba(255, 255, 255, 0.3)',
                height: '6px',
              }}
            >
              <div
                className="progress-bar-fill"
                style={{ 
                  width: `${agent.progress}%`,
                  background: 'white',
                  boxShadow: '0 0 8px rgba(255, 255, 255, 0.5)',
                }}
              />
            </div>
            <p
              className="text-caption mt-xs text-right"
              style={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 500,
              }}
            >
              {agent.progress}%
            </p>
          </div>
        )}

        {/* Message */}
        {agent.message && (
          <p
            className="text-body-sm"
            style={{
              color: isActive ? 'rgba(255, 255, 255, 0.95)' : 'var(--color-body)',
              lineHeight: 'var(--leading-body)',
            }}
          >
            {agent.message}
          </p>
        )}

        {/* Error */}
        {agent.error && (
          <div
            style={{
              background: isActive 
                ? 'rgba(255, 255, 255, 0.2)'
                : 'rgba(198, 69, 69, 0.1)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-sm)',
              border: '1.5px solid var(--color-error)',
            }}
          >
            <p 
              className="text-body-sm" 
              style={{ 
                color: isActive ? 'white' : 'var(--color-error)',
                fontWeight: 500,
              }}
            >
              {agent.error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}