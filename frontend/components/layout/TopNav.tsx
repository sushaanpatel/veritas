/**
 * TopNav Component - Carbon Design System
 * Main navigation bar with logo, nav items, and dark mode toggle
 * Height: 48px, Background: canvas (white), 1px bottom hairline
 */

'use client';

import { useState, useEffect } from 'react';

export function TopNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize dark mode from localStorage after mount
  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  // Don't render toggle until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <nav className="bg-canvas border-b border-hairline sticky top-0 z-50">
        <div className="max-w-[1584px] mx-auto px-md h-[48px] flex items-center justify-between">
          <div className="flex items-center gap-sm">
            <div className="w-8 h-8 bg-primary flex items-center justify-center">
              <span className="text-on-primary font-semibold text-body">R</span>
            </div>
            <span className="text-body-sm font-semibold text-ink hidden tablet:block">
              Multi-Agent Research
            </span>
          </div>
          <div className="hidden tablet:flex items-center gap-lg">
            <a href="/" className="text-body-sm text-ink hover:text-primary transition-colors px-sm py-xs">
              Research
            </a>
            <a href="/history" className="text-body-sm text-ink-muted hover:text-primary transition-colors px-sm py-xs">
              History
            </a>
            <a href="/settings" className="text-body-sm text-ink-muted hover:text-primary transition-colors px-sm py-xs">
              Settings
            </a>
          </div>
          <div className="flex items-center gap-sm">
            <div className="w-8 h-8" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-canvas border-b border-hairline sticky top-0 z-50">
      <div className="max-w-[1584px] mx-auto px-md h-[48px] flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-sm">
          <div className="w-8 h-8 bg-primary flex items-center justify-center">
            <span className="text-on-primary font-semibold text-body">R</span>
          </div>
          <span className="text-body-sm font-semibold text-ink hidden tablet:block">
            Multi-Agent Research
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden tablet:flex items-center gap-lg">
          <a
            href="/"
            className="text-body-sm text-ink hover:text-primary transition-colors px-sm py-xs"
          >
            Research
          </a>
          <a
            href="/history"
            className="text-body-sm text-ink-muted hover:text-primary transition-colors px-sm py-xs"
          >
            History
          </a>
          <a
            href="/settings"
            className="text-body-sm text-ink-muted hover:text-primary transition-colors px-sm py-xs"
          >
            Settings
          </a>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-sm">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="flex items-center justify-center w-8 h-8 text-ink hover:text-primary transition-colors"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              // Sun icon for light mode
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              // Moon icon for dark mode
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Search icon (desktop) */}
          <button
            className="hidden tablet:flex items-center justify-center w-8 h-8 text-ink-muted hover:text-primary transition-colors"
            aria-label="Search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="tablet:hidden flex items-center justify-center w-8 h-8 text-ink hover:text-primary transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="tablet:hidden bg-canvas border-t border-hairline">
          <div className="px-md py-md space-y-xs">
            <a
              href="/"
              className="block text-body-sm text-ink hover:text-primary transition-colors py-sm px-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Research
            </a>
            <a
              href="/history"
              className="block text-body-sm text-ink-muted hover:text-primary transition-colors py-sm px-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              History
            </a>
            <a
              href="/settings"
              className="block text-body-sm text-ink-muted hover:text-primary transition-colors py-sm px-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Settings
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}