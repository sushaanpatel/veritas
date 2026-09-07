/**
 * ErrorBanner Component
 * Error message display with dismiss functionality
 */

'use client';

import { useState } from 'react';

interface ErrorBannerProps {
  message: string;
  detail?: string;
  onDismiss?: () => void;
  dismissible?: boolean;
}

export function ErrorBanner({
  message,
  detail,
  onDismiss,
  dismissible = true,
}: ErrorBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div className="alert alert-error animate-slideDown">
      <svg
        className="w-5 h-5 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
      <div className="flex-1">
        <p className="text-title-sm" style={{ color: 'var(--color-error)' }}>
          {message}
        </p>
        {detail && (
          <p className="text-body-sm mt-xxs" style={{ color: 'var(--color-error)' }}>
            {detail}
          </p>
        )}
      </div>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="btn-icon"
          aria-label="Dismiss error"
          style={{ flexShrink: 0 }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
