/**
 * ActivityLog Component
 * Scrollable log of all agent activities and messages
 */

'use client';

import { useEffect, useRef } from 'react';
import type { ActivityLogEntry } from '@/types/research';

interface ActivityLogProps {
  entries: ActivityLogEntry[];
  maxHeight?: string;
  autoScroll?: boolean;
}

const levelColors = {
  info: 'var(--color-muted)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
};

const levelIcons = {
  info: (
    <svg style={{ width: '16px', height: '16px' }} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  ),
  success: (
    <svg style={{ width: '16px', height: '16px' }} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg style={{ width: '16px', height: '16px' }} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg style={{ width: '16px', height: '16px' }} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
};

export function ActivityLog({
  entries,
  maxHeight = '400px',
  autoScroll = true,
}: ActivityLogProps) {
  const logRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    if (autoScroll && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [entries, autoScroll]);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div style={{
      background: 'var(--color-surface-card)',
      border: '1px solid var(--color-hairline)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-lg)',
    }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-md)' }}>
        <h3 className="text-title-md text-ink">
          Activity Log
        </h3>
        <span style={{
          display: 'inline-block',
          padding: '4px 12px',
          background: 'var(--color-surface-soft)',
          borderRadius: 'var(--radius-pill)',
          fontSize: '13px',
          color: 'var(--color-muted)',
          fontWeight: 500,
        }}>
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      <div
        ref={logRef}
        style={{
          maxHeight,
          overflowY: 'auto',
          fontSize: '14px',
          lineHeight: '1.5',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
          {entries.map((entry) => (
            <div
              key={entry.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-sm)',
                padding: 'var(--space-sm)',
                background: 'var(--color-canvas)',
                borderRadius: 'var(--radius-sm)',
                borderLeft: `3px solid ${levelColors[entry.level]}`,
              }}
            >
              {/* Icon */}
              <div style={{
                flexShrink: 0,
                marginTop: '2px',
                color: levelColors[entry.level],
                display: 'flex',
                alignItems: 'center',
              }}>
                {levelIcons[entry.level]}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-xs)',
                  marginBottom: '4px',
                }}>
                  {entry.agent && (
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      background: 'var(--color-surface-soft)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      color: 'var(--color-muted)',
                      fontWeight: 500,
                    }}>
                      {entry.agent}
                    </span>
                  )}
                  <span style={{
                    fontSize: '12px',
                    color: 'var(--color-muted)',
                  }}>
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p style={{
                  fontSize: '14px',
                  color: 'var(--color-body)',
                  wordBreak: 'break-word',
                }}>
                  {entry.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}