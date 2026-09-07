/**
 * StatusBadge Component
 * Colored status badges for research task states
 */

import type { ResearchStatus, AgentStatus } from '@/types/research';

interface StatusBadgeProps {
  status: ResearchStatus | AgentStatus;
  className?: string;
}

const statusConfig: Record<
  ResearchStatus | AgentStatus,
  { label: string; className: string; style?: React.CSSProperties }
> = {
  pending: {
    label: 'Pending',
    className: 'badge',
    style: {
      background: 'var(--color-surface-card)',
      color: 'var(--color-muted)',
      border: '1.5px solid var(--color-hairline)',
    },
  },
  in_progress: {
    label: 'In Progress',
    className: 'badge',
    style: {
      background: 'var(--color-primary)',
      color: 'var(--color-on-primary)',
      fontWeight: 600,
      boxShadow: '0 2px 8px rgba(204, 120, 92, 0.3)',
    },
  },
  active: {
    label: 'Active',
    className: 'badge',
    style: {
      background: 'var(--color-primary)',
      color: 'var(--color-on-primary)',
      fontWeight: 600,
      boxShadow: '0 2px 8px rgba(204, 120, 92, 0.3)',
    },
  },
  completed: {
    label: 'Completed',
    className: 'badge',
    style: {
      background: 'var(--color-success)',
      color: 'white',
      fontWeight: 600,
    },
  },
  failed: {
    label: 'Failed',
    className: 'badge',
    style: {
      background: 'var(--color-error)',
      color: 'white',
      fontWeight: 600,
    },
  },
  cancelled: {
    label: 'Cancelled',
    className: 'badge',
    style: {
      background: 'var(--color-surface-card)',
      color: 'var(--color-muted)',
      border: '1.5px solid var(--color-hairline)',
    },
  },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span 
      className={`${config.className} ${className}`}
      style={config.style}
    >
      {config.label}
    </span>
  );
}