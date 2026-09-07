/**
 * ProgressBar Component
 * Displays research progress with current agent and status message
 */

interface ProgressBarProps {
  progress: number;
  currentAgent?: string | null;
  statusMessage?: string;
  isComplete?: boolean;
}

export function ProgressBar({
  progress,
  currentAgent,
  statusMessage,
  isComplete = false,
}: ProgressBarProps) {
  return (
    <div 
      style={{
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-active) 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-xl)',
        boxShadow: '0 4px 20px rgba(204, 120, 92, 0.25)',
        border: '2px solid var(--color-primary-active)',
      }}
    >
      <div className="space-y-lg">
        {/* Progress Info */}
        <div className="flex items-center justify-between">
          <div>
            <h3 
              className="text-title-lg" 
              style={{ 
                color: 'white',
                fontWeight: 600,
                marginBottom: 'var(--space-xs)',
              }}
            >
              Research Progress
            </h3>
            {currentAgent && (
              <p 
                className="text-body-sm" 
                style={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-xs)',
                }}
              >
                <span style={{ opacity: 0.8 }}>Current Agent:</span>
                <span 
                  style={{ 
                    fontWeight: 600,
                    background: 'rgba(255, 255, 255, 0.2)',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-pill)',
                  }}
                >
                  {currentAgent}
                </span>
              </p>
            )}
          </div>
          <div className="text-right">
            <div 
              style={{ 
                fontSize: '48px',
                fontWeight: 600,
                color: 'white',
                lineHeight: 1,
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              }}
            >
              {progress}%
            </div>
            {isComplete && (
              <span
                className="badge"
                style={{
                  marginTop: 'var(--space-xs)',
                  background: 'var(--color-success)',
                  color: 'white',
                  fontWeight: 600,
                  padding: '6px 14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Complete
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div 
          style={{
            width: '100%',
            height: '12px',
            background: 'rgba(255, 255, 255, 0.25)',
            borderRadius: 'var(--radius-pill)',
            overflow: 'hidden',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div
            style={{ 
              width: `${progress}%`,
              height: '100%',
              background: 'white',
              borderRadius: 'var(--radius-pill)',
              transition: 'width var(--transition-slow)',
              boxShadow: '0 0 12px rgba(255, 255, 255, 0.6)',
            }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              padding: 'var(--space-md)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <p 
              className="text-body-sm" 
              style={{ 
                color: 'rgba(255, 255, 255, 0.95)',
                lineHeight: 'var(--leading-body)',
              }}
            >
              {statusMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}