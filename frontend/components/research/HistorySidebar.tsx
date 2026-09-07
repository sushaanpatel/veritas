/**
 * HistorySidebar Component
 * Modal for viewing and managing research history
 */

'use client';

import React from 'react';
import { useHistory } from '@/hooks/useHistory';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { useState } from 'react';
import type { HistoryItem } from '@/types/research';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTask?: (taskId: string) => void;
}

export function HistorySidebar({ isOpen, onClose, onSelectTask }: HistorySidebarProps) {
  const {
    history,
    isLoading,
    error,
    page,
    totalPages,
    deleteItem,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage,
  } = useHistory();

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (taskId: string) => {
    setIsDeleting(true);
    const success = await deleteItem(taskId);
    setIsDeleting(false);
    if (success) {
      setDeleteConfirm(null);
    }
  };

  const handleSelectTask = (taskId: string) => {
    onSelectTask?.(taskId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
          animation: 'fadeIn 0.2s ease',
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '800px',
          maxHeight: '85vh',
          background: 'var(--color-canvas)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
          animation: 'slideUp 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-xl)',
            borderBottom: '2px solid var(--color-hairline)',
          }}
        >
          <h2 className="text-display-sm text-ink" style={{ fontWeight: 600 }}>
            Research History
          </h2>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              border: '2px solid var(--color-hairline)',
              borderRadius: 'var(--radius-lg)',
              background: 'transparent',
              color: 'var(--color-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.color = 'var(--color-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-hairline)';
              e.currentTarget.style.color = 'var(--color-muted)';
            }}
            aria-label="Close"
          >
            <svg
              style={{ width: '20px', height: '20px' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--space-xl)',
          }}
        >
          {isLoading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-xxxl)',
            }}>
              <LoadingSpinner size="lg" />
              <p className="text-body-md text-muted" style={{ marginTop: 'var(--space-lg)' }}>
                Loading history...
              </p>
            </div>
          ) : error ? (
            <div style={{
              padding: 'var(--space-lg)',
              background: 'rgba(198, 69, 69, 0.1)',
              border: '1px solid var(--color-error)',
              borderRadius: 'var(--radius-lg)',
            }}>
              <p className="text-body-sm" style={{ color: 'var(--color-error)' }}>
                {error}
              </p>
            </div>
          ) : history.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 'var(--space-xxxl)',
            }}>
              <svg
                style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto var(--space-lg)',
                  color: 'var(--color-muted-soft)',
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-body-lg text-muted">
                No research history yet
              </p>
              <p className="text-body-sm text-muted-soft" style={{ marginTop: 'var(--space-sm)' }}>
                Your completed research will appear here
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {history.map((item) => (
                <HistoryCard
                  key={item.task_id}
                  item={item}
                  onSelect={() => handleSelectTask(item.task_id)}
                  onDelete={() => setDeleteConfirm(item.task_id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-lg)',
              borderTop: '2px solid var(--color-hairline)',
            }}
          >
            <button
              onClick={prevPage}
              disabled={!hasPrevPage}
              className="btn-secondary btn-sm"
              style={{
                opacity: !hasPrevPage ? 0.5 : 1,
                cursor: !hasPrevPage ? 'not-allowed' : 'pointer',
              }}
            >
              <svg
                style={{ width: '16px', height: '16px' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Previous
            </button>
            <span className="text-body-sm text-muted">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={!hasNextPage}
              className="btn-secondary btn-sm"
              style={{
                opacity: !hasNextPage ? 0.5 : 1,
                cursor: !hasNextPage ? 'not-allowed' : 'pointer',
              }}
            >
              Next
              <svg
                style={{ width: '16px', height: '16px' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            style={{
              width: '90%',
              maxWidth: '400px',
              background: 'var(--color-canvas)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-xl)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-title-lg text-ink" style={{ marginBottom: 'var(--space-md)' }}>
              Delete Research
            </h3>
            <p className="text-body-md text-body" style={{ marginBottom: 'var(--space-xl)' }}>
              Are you sure you want to delete this research? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="btn-primary"
                disabled={isDeleting}
                style={{ background: 'var(--color-error)' }}
              >
                {isDeleting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -45%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </>
  );
}

interface HistoryCardProps {
  item: HistoryItem;
  onSelect: () => void;
  onDelete: () => void;
}

function HistoryCard({ item, onSelect, onDelete }: HistoryCardProps) {
  return (
    <div
      style={{
        padding: 'var(--space-lg)',
        background: 'var(--color-surface-card)',
        borderRadius: 'var(--radius-lg)',
        border: '2px solid var(--color-hairline)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-primary)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(204, 120, 92, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-hairline)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      onClick={onSelect}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
          <p
            className="text-body-md text-ink"
            style={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              fontWeight: 500,
            }}
          >
            {item.query}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              color: 'var(--color-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(198, 69, 69, 0.1)';
              e.currentTarget.style.color = 'var(--color-error)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--color-muted)';
            }}
            aria-label="Delete"
          >
            <svg
              style={{ width: '16px', height: '16px' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>

        {/* Metadata */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
          <StatusBadge status={item.status} />
          <span style={{
            display: 'inline-block',
            padding: '4px 10px',
            background: 'var(--color-surface-soft)',
            borderRadius: 'var(--radius-pill)',
            fontSize: '12px',
            color: 'var(--color-muted)',
            fontWeight: 500,
            textTransform: 'capitalize',
          }}>
            {item.mode}
          </span>
          {item.quality_score !== undefined && (
            <span style={{
              display: 'inline-block',
              padding: '4px 10px',
              background: 'var(--color-surface-soft)',
              borderRadius: 'var(--radius-pill)',
              fontSize: '12px',
              color: 'var(--color-muted)',
              fontWeight: 500,
            }}>
              {Math.round(item.quality_score * 100)}% quality
            </span>
          )}
        </div>

        {/* Timestamp */}
        <p className="text-caption text-muted-soft">
          {new Date(item.timestamp).toLocaleString()}
        </p>

        {/* Preview */}
        {item.preview && (
          <p
            className="text-body-sm text-muted"
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {item.preview}
          </p>
        )}
      </div>
    </div>
  );
}
