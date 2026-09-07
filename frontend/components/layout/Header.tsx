/**
 * Header Component
 * Top navigation bar with Claude design system styling
 */

'use client';

import { useState } from 'react';

interface HeaderProps {
  onNewResearch?: () => void;
  onToggleHistory?: () => void;
}

export function Header({ onNewResearch, onToggleHistory }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-sticky"
      style={{
        background: 'var(--color-canvas)',
        borderBottom: '2px solid var(--color-hairline)',
        boxShadow: '0 2px 8px rgba(20, 20, 19, 0.04)',
      }}
    >
      <div className="container">
        <div 
          className="flex items-center justify-between" 
          style={{ 
            height: '80px',
            padding: '0 var(--space-md)',
          }}
        >
          {/* Logo / Brand */}
          <div className="flex items-center gap-md">
            <div
              className="flex items-center justify-center"
              style={{
                width: '44px',
                height: '44px',
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-active) 100%)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 2px 8px rgba(204, 120, 92, 0.25)',
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h1 
                className="text-title-lg text-ink" 
                style={{ 
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  lineHeight: 1,
                }}
              >
                Research Assistant
              </h1>
              <p 
                className="text-caption text-muted" 
                style={{ 
                  marginTop: '2px',
                  fontSize: '12px',
                }}
              >
                Powered by AI
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden-mobile flex items-center gap-lg">
            {onToggleHistory && (
              <button
                onClick={onToggleHistory}
                className="btn-text"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-xs)',
                  padding: '10px 18px',
                  color: 'var(--color-primary)',
                  fontWeight: 500,
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 6V10L13 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                History
              </button>
            )}

            {onNewResearch && (
              <button 
                onClick={onNewResearch} 
                className="btn-primary"
                style={{
                  padding: '12px 24px',
                  fontSize: '15px',
                  fontWeight: 500,
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 4V16M4 10H16"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
                New Research
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="hidden-desktop btn-icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            style={{
              width: '44px',
              height: '44px',
              border: '2px solid var(--color-primary)',
              color: 'var(--color-primary)',
            }}
          >
            {isMobileMenuOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 12H20M4 6H20M4 18H20"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            className="hidden-desktop py-lg space-y-sm animate-slideDown"
            style={{ 
              borderTop: '2px solid var(--color-hairline)',
              paddingBottom: 'var(--space-xl)',
            }}
          >
            {onToggleHistory && (
              <button
                onClick={() => {
                  onToggleHistory();
                  setIsMobileMenuOpen(false);
                }}
                className="btn-secondary w-full"
                style={{
                  justifyContent: 'flex-start',
                  padding: '14px 20px',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 6V10L13 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                History
              </button>
            )}

            {onNewResearch && (
              <button
                onClick={() => {
                  onNewResearch();
                  setIsMobileMenuOpen(false);
                }}
                className="btn-primary w-full"
                style={{
                  justifyContent: 'flex-start',
                  padding: '14px 20px',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 4V16M4 10H16"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
                New Research
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}