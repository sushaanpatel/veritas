/**
 * ReportViewer Component
 * Displays the final research report with markdown rendering
 */

'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ResearchMetadata } from '@/types/research';

interface ReportViewerProps {
  report: string;
  metadata: ResearchMetadata;
}

export function ReportViewer({ report, metadata }: ReportViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research-${metadata.query.slice(0, 30).replace(/[^a-z0-9]/gi, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-lg">
      {/* Metadata Card */}
      <div className="card-feature">
        <div className="space-y-md">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-display-sm text-ink mb-sm">Research Report</h2>
              <p className="text-body-md text-muted">{metadata.query}</p>
            </div>
            <div className="flex items-center gap-xs no-print">
              <button
                onClick={handleCopy}
                className="btn-icon"
                title="Copy to clipboard"
                aria-label="Copy report"
              >
                {copied ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="btn-icon"
                title="Download as markdown"
                aria-label="Download report"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>
              <button
                onClick={handlePrint}
                className="btn-icon"
                title="Print report"
                aria-label="Print report"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-4 gap-md pt-md" style={{ borderTop: '1px solid var(--color-hairline)' }}>
            <div>
              <p className="text-caption text-muted mb-xxs">Mode</p>
              <p className="text-body-md text-ink capitalize">{metadata.mode}</p>
            </div>
            {metadata.duration && (
              <div>
                <p className="text-caption text-muted mb-xxs">Duration</p>
                <p className="text-body-md text-ink">
                  {Math.floor(metadata.duration / 60)}m {metadata.duration % 60}s
                </p>
              </div>
            )}
            {metadata.quality_score !== undefined && (
              <div>
                <p className="text-caption text-muted mb-xxs">Quality Score</p>
                <p className="text-body-md text-ink">
                  {Math.round(metadata.quality_score * 100)}%
                </p>
              </div>
            )}
            {metadata.sources_count !== undefined && (
              <div>
                <p className="text-caption text-muted mb-xxs">Sources</p>
                <p className="text-body-md text-ink">{metadata.sources_count}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="card-feature">
        <div className="markdown-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {report}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
