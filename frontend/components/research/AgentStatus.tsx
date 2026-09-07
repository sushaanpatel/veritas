/**
 * AgentStatus Component - Carbon Design System
 * Displays status of individual agents using Carbon feature-card style
 */

'use client';

import { AgentName, AgentState } from '@/types/research';

interface AgentStatusProps {
  agentStates: Map<AgentName, AgentState>;
}

const agentConfig: Record<AgentName, {
  label: string;
  icon: React.ReactNode;
  description: string;
}> = {
  coordinator: {
    label: 'Coordinator',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    description: 'Analyzing query and planning strategy',
  },
  web_search: {
    label: 'Web Search',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    description: 'Gathering sources from the web',
  },
  analysis: {
    label: 'Analysis',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    description: 'Extracting facts and insights',
  },
  synthesis: {
    label: 'Synthesis',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    description: 'Combining information',
  },
  fact_checker: {
    label: 'Fact Checker',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    description: 'Verifying claims',
  },
  report_writer: {
    label: 'Report Writer',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    description: 'Generating final report',
  },
};

export function AgentStatus({ agentStates }: AgentStatusProps) {
  const agents: AgentName[] = [
    'coordinator',
    'web_search',
    'analysis',
    'synthesis',
    'fact_checker',
    'report_writer',
  ];

  const getStatusColor = (status: AgentState['status']) => {
    switch (status) {
      case 'idle':
        return 'bg-canvas border-hairline';
      case 'working':
        return 'bg-surface-1 border-primary border-2';
      case 'complete':
        return 'bg-canvas border-semantic-success border-2';
      case 'error':
        return 'bg-canvas border-semantic-error border-2';
      default:
        return 'bg-canvas border-hairline';
    }
  };

  const getStatusIcon = (status: AgentState['status']) => {
    switch (status) {
      case 'idle':
        return (
          <div className="w-3 h-3 bg-ink-subtle" />
        );
      case 'working':
        return (
          <div className="w-3 h-3 bg-primary" />
        );
      case 'complete':
        return (
          <svg className="w-5 h-5 text-semantic-success" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-semantic-error" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h3 className="text-subhead text-ink mb-lg">
        Agent Status
      </h3>
      
      <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-md">
        {agents.map((agentName) => {
          const state = agentStates.get(agentName);
          if (!state) return null;

          const config = agentConfig[agentName];
          const statusColor = getStatusColor(state.status);

          return (
            <div
              key={agentName}
              className={`carbon-card carbon-card-feature transition-all duration-300 ${statusColor}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-xs">
                <div className="flex items-center gap-sm">
                  <div style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center' }}>
                    {config.icon}
                  </div>
                  <h4 className="text-body-emphasis text-ink">
                    {config.label}
                  </h4>
                </div>
                {getStatusIcon(state.status)}
              </div>

              {/* Description */}
              <p className="text-body-sm text-ink-muted mb-sm">
                {config.description}
              </p>

              {/* Status Message */}
              {state.message && (
                <p className="text-caption text-ink mb-xs italic">
                  {state.message}
                </p>
              )}

              {/* Progress Bar (for working agents) - Carbon flat design */}
              {state.status === 'working' && state.progress !== undefined && (
                <div className="mt-xs">
                  <div className="flex justify-between text-caption text-ink-muted mb-xxs">
                    <span>Progress</span>
                    <span>{Math.round(state.progress)}%</span>
                  </div>
                  <div className="w-full bg-surface-2 h-1">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${state.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Metrics (for completed agents) */}
              {state.status === 'complete' && state.metrics && (
                <div className="mt-xs pt-xs border-t border-hairline">
                  <div className="grid grid-cols-2 gap-xs text-caption">
                    {Object.entries(state.metrics).slice(0, 4).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-ink-muted">
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <span className="ml-xxs font-semibold text-ink">
                          {typeof value === 'number' ? value.toFixed(0) : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Badge - Carbon flat design */}
              <div className="mt-sm">
                <span
                  className={`inline-flex items-center px-xs py-xxs text-caption font-semibold ${
                    state.status === 'idle'
                      ? 'bg-surface-2 text-ink-muted'
                      : state.status === 'working'
                      ? 'bg-primary text-on-primary'
                      : state.status === 'complete'
                      ? 'bg-semantic-success text-canvas'
                      : 'bg-semantic-error text-canvas'
                  }`}
                >
                  {state.status.charAt(0).toUpperCase() + state.status.slice(1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}