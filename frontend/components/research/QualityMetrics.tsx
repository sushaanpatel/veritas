/**
 * QualityMetrics Component
 * Displays research quality metrics with visual indicators
 */

import type { QualityMetrics as QualityMetricsType } from '@/types/research';

interface QualityMetricsProps {
  metrics: QualityMetricsType;
}

interface MetricCardProps {
  label: string;
  value: number;
  description: string;
}

function MetricCard({ label, value, description }: MetricCardProps) {
  const percentage = Math.round(value * 100);
  const color =
    value >= 0.8
      ? 'var(--color-success)'
      : value >= 0.6
      ? 'var(--color-warning)'
      : 'var(--color-error)';

  return (
    <div className="space-y-sm">
      <div className="flex items-center justify-between">
        <span className="text-title-sm" style={{ color: 'var(--color-on-dark)' }}>
          {label}
        </span>
        <span className="text-title-lg" style={{ color }}>
          {percentage}%
        </span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${percentage}%`, background: color }}
        />
      </div>
      <p className="text-body-sm" style={{ color: 'var(--color-on-dark-soft)' }}>
        {description}
      </p>
    </div>
  );
}

export function QualityMetrics({ metrics }: QualityMetricsProps) {
  const overallPercentage = Math.round(metrics.overall_quality * 100);
  const overallColor =
    metrics.overall_quality >= 0.8
      ? 'var(--color-success)'
      : metrics.overall_quality >= 0.6
      ? 'var(--color-warning)'
      : 'var(--color-error)';

  return (
    <div className="card-dark">
      <div className="space-y-xl">
        {/* Overall Quality */}
        <div className="text-center pb-lg" style={{ borderBottom: '1px solid var(--color-surface-dark-elevated)' }}>
          <h2 className="text-display-sm mb-xs" style={{ color: 'var(--color-on-dark)' }}>
            Quality Score
          </h2>
          <div className="text-display-xl" style={{ color: overallColor }}>
            {overallPercentage}%
          </div>
          <p className="text-body-sm mt-xs" style={{ color: 'var(--color-on-dark-soft)' }}>
            Overall research quality
          </p>
        </div>

        {/* Individual Metrics */}
        <div className="grid grid-cols-2 gap-xl">
          <MetricCard
            label="Source Diversity"
            value={metrics.source_diversity}
            description="Variety of information sources"
          />
          <MetricCard
            label="Content Depth"
            value={metrics.content_depth}
            description="Thoroughness of analysis"
          />
          <MetricCard
            label="Fact Confidence"
            value={metrics.fact_confidence}
            description="Reliability of claims"
          />
          <MetricCard
            label="Citation Coverage"
            value={metrics.citation_coverage}
            description="Facts with sources"
          />
        </div>
      </div>
    </div>
  );
}
