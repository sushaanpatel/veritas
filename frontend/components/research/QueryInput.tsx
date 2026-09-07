/**
 * QueryInput — Claude Design System
 * Research query input with segmented mode tabs and collapsible advanced options.
 * Card: surface-card background, hairline-soft border, radius-xl.
 * Textarea: canvas background, hairline border (via .input class).
 * Mode tabs: category-tab / category-tab-active pattern.
 */

'use client';

import { useState } from 'react';
import type { ResearchMode, ResearchOptions } from '@/types/research';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface QueryInputProps {
  onSubmit: (query: string, mode: ResearchMode, options?: ResearchOptions) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

/** Each mode carries its own depth profile. Selecting a mode resets the
 *  advanced options to that profile; the user can still fine-tune afterwards. */
const MODE_PRESETS: Record<ResearchMode, ResearchOptions> = {
  basic: {
    max_sources: 15,
    search_depth: 'basic',
    analysis_depth: 'medium',
    requires_fact_check: false,
  },
  enhanced: {
    max_sources: 30,
    search_depth: 'advanced',
    analysis_depth: 'deep',
    requires_fact_check: true,
  },
};

export function QueryInput({ onSubmit, isLoading = false, disabled = false }: QueryInputProps) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<ResearchMode>('enhanced');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [options, setOptions] = useState<ResearchOptions>(MODE_PRESETS.enhanced);

  /** Switching mode applies that mode's depth profile. */
  const handleModeChange = (newMode: ResearchMode) => {
    setMode(newMode);
    setOptions(MODE_PRESETS[newMode]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 3 && !isLoading && !disabled) {
      onSubmit(query.trim(), mode, options);
    }
  };

  const isValid = query.trim().length >= 3 && query.trim().length <= 500;
  const charCount = query.length;

  return (
    /* ── Feature card ────────────────────────────────────────────────── */
    <div style={{
      background: 'var(--color-surface-card)',
      border: '1px solid var(--color-hairline-soft)',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-xxl)',
    }}>
      <form onSubmit={handleSubmit}>

        {/* ── Textarea ───────────────────────────────────────────────── */}
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <label htmlFor="query" className="sr-only">Research query</label>
          <textarea
            id="query"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ask anything — a topic, a question, a research brief…"
            className="input textarea"
            rows={4}
            disabled={isLoading || disabled}
            maxLength={500}
          />
          <div
            className="flex items-center justify-between"
            style={{ marginTop: 'var(--space-xs)' }}
          >
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-caption)',
              color: 'var(--color-muted-soft)',
            }}>
              {charCount} / 500
            </span>
            {!isValid && charCount > 0 && (
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-caption)',
                color: 'var(--color-error)',
              }}>
                {charCount < 3 ? 'Minimum 3 characters' : 'Maximum 500 characters'}
              </span>
            )}
          </div>
        </div>

        {/* ── Mode tabs — category-tab pattern ──────────────────────── */}
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="category-tab-group">
            {/* Basic */}
            <label className={`category-tab${mode === 'basic' ? ' category-tab-active' : ''}`}>
              <input
                type="radio"
                name="mode"
                value="basic"
                checked={mode === 'basic'}
                onChange={e => handleModeChange(e.target.value as ResearchMode)}
                disabled={isLoading || disabled}
                className="sr-only"
              />
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-body-sm)',
                fontWeight: 500,
                color: mode === 'basic' ? 'var(--color-ink)' : 'var(--color-muted)',
              }}>
                Basic
              </span>
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-caption)',
                color: mode === 'basic' ? 'var(--color-muted)' : 'var(--color-muted-soft)',
              }}>
                Fast · 2–3 min
              </span>
            </label>

            {/* Enhanced */}
            <label className={`category-tab${mode === 'enhanced' ? ' category-tab-active' : ''}`}>
              <input
                type="radio"
                name="mode"
                value="enhanced"
                checked={mode === 'enhanced'}
                onChange={e => handleModeChange(e.target.value as ResearchMode)}
                disabled={isLoading || disabled}
                className="sr-only"
              />
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-body-sm)',
                fontWeight: 500,
                color: mode === 'enhanced' ? 'var(--color-ink)' : 'var(--color-muted)',
              }}>
                Enhanced
              </span>
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-caption)',
                color: mode === 'enhanced' ? 'var(--color-muted)' : 'var(--color-muted-soft)',
              }}>
                Deep · 3–5 min
              </span>
            </label>
          </div>
        </div>

        {/* ── Advanced options toggle ────────────────────────────────── */}
        <div style={{ marginBottom: showAdvanced ? 'var(--space-lg)' : 0 }}>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="btn-text"
            disabled={isLoading || disabled}
            style={{
              fontSize: 'var(--text-body-sm)',
              color: 'var(--color-muted)',
              padding: '6px 0',
              minWidth: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-xs)',
            }}
          >
            <svg
              width="14" height="14" fill="none" stroke="currentColor"
              viewBox="0 0 24 24" strokeWidth={2}
              style={{
                transition: 'transform var(--transition-base)',
                transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            Advanced options
          </button>
        </div>

        {/* ── Advanced options panel ─────────────────────────────────── */}
        {showAdvanced && (
          <div style={{
            background: 'var(--color-surface-soft)',
            border: '1px solid var(--color-hairline)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-xl)',
            marginBottom: 'var(--space-xl)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-lg)',
          }}>

            {/* Max sources */}
            <div>
              <label
                htmlFor="max-sources"
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-body-sm)',
                  fontWeight: 500,
                  color: 'var(--color-ink)',
                  marginBottom: 'var(--space-sm)',
                }}
              >
                Max sources
                <span style={{
                  marginLeft: 'var(--space-xs)',
                  fontWeight: 400,
                  color: 'var(--color-primary)',
                }}>
                  {options.max_sources}
                </span>
              </label>
              <input
                id="max-sources"
                type="range"
                min="5" max="50" step="5"
                value={options.max_sources}
                onChange={e => setOptions({ ...options, max_sources: parseInt(e.target.value) })}
                disabled={isLoading || disabled}
                className="w-full"
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <div
                className="flex justify-between"
                style={{ marginTop: 'var(--space-xs)' }}
              >
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-caption)', color: 'var(--color-muted-soft)' }}>5</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-caption)', color: 'var(--color-muted-soft)' }}>50</span>
              </div>
            </div>

            {/* Search depth */}
            <div>
              <label
                htmlFor="search-depth"
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-body-sm)',
                  fontWeight: 500,
                  color: 'var(--color-ink)',
                  marginBottom: 'var(--space-sm)',
                }}
              >
                Search depth
              </label>
              <select
                id="search-depth"
                value={options.search_depth}
                onChange={e => setOptions({ ...options, search_depth: e.target.value as 'basic' | 'advanced' })}
                disabled={isLoading || disabled}
                className="input"
                style={{ height: 40 }}
              >
                <option value="basic">Basic</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Analysis depth */}
            <div>
              <label
                htmlFor="analysis-depth"
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-body-sm)',
                  fontWeight: 500,
                  color: 'var(--color-ink)',
                  marginBottom: 'var(--space-sm)',
                }}
              >
                Analysis depth
              </label>
              <select
                id="analysis-depth"
                value={options.analysis_depth}
                onChange={e => setOptions({ ...options, analysis_depth: e.target.value as 'shallow' | 'medium' | 'deep' })}
                disabled={isLoading || disabled}
                className="input"
                style={{ height: 40 }}
              >
                <option value="shallow">Shallow</option>
                <option value="medium">Medium</option>
                <option value="deep">Deep</option>
              </select>
            </div>

            {/* Fact checking */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={options.requires_fact_check}
                onChange={e => setOptions({ ...options, requires_fact_check: e.target.checked })}
                disabled={isLoading || disabled}
                style={{ accentColor: 'var(--color-primary)', width: 16, height: 16 }}
              />
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-ink)',
              }}>
                Enable fact-checking
              </span>
            </label>
          </div>
        )}

        {/* ── Submit button ──────────────────────────────────────────── */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={!isValid || isLoading || disabled}
            className="btn btn-primary btn-lg"
            style={{ minWidth: 200 }}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                Starting…
              </>
            ) : (
              'Start Research'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
