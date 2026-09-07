/**
 * LoadingSpinner Component
 * Animated loading spinner with size variants
 */

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  onDark?: boolean;
  className?: string;
}

export function LoadingSpinner({ size = 'md', onDark = false, className = '' }: LoadingSpinnerProps) {
  const sizeClass = size === 'sm' ? 'spinner-sm' : size === 'lg' ? 'spinner-lg' : '';
  const darkClass = onDark ? 'spinner-on-dark' : '';

  return (
    <div
      className={`spinner ${sizeClass} ${darkClass} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
