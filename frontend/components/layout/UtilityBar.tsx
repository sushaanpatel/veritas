/**
 * UtilityBar Component - Carbon Design System
 * Slim gray ribbon above top nav with meta information
 * Height: 32px, Background: surface-1
 */

'use client';

export function UtilityBar() {
  return (
    <div className="bg-surface-1 border-b border-hairline">
      <div className="max-w-[1584px] mx-auto px-md h-[32px] flex items-center justify-between">
        {/* Left side - Location/Context */}
        <div className="flex items-center gap-xs">
          <span className="text-caption text-ink-muted">
            Multi-Agent Research System
          </span>
        </div>

        {/* Right side - Quick actions */}
        <div className="flex items-center gap-md">
          <a
            href="https://github.com/yourusername/research"
            target="_blank"
            rel="noopener noreferrer"
            className="text-caption text-ink-muted hover:text-primary transition-colors"
          >
            GitHub
          </a>
          <a
            href="/docs"
            className="text-caption text-ink-muted hover:text-primary transition-colors"
          >
            Documentation
          </a>
          <a
            href="/api/health"
            className="text-caption text-ink-muted hover:text-primary transition-colors"
          >
            API Status
          </a>
        </div>
      </div>
    </div>
  );
}
