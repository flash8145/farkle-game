'use client';

import * as React from 'react';
import { Button } from './button';

// ==============================================================================
// ERROR BOUNDARY COMPONENT
// ==============================================================================
// Catches React errors and displays a user-friendly fallback UI
// ==============================================================================

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  resetError: () => void;
}

/**
 * Error Boundary Component
 * Wraps components to catch and handle errors gracefully
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console
    console.error('🔴 Error Boundary Caught:', error);
    console.error('Error Info:', errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // TODO: Log to error reporting service (Sentry, LogRocket, etc.)
    // logErrorToService(error, errorInfo);
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            resetError={this.resetError}
          />
        );
      }

      // Default fallback UI
      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

// ==============================================================================
// DEFAULT ERROR FALLBACK
// ==============================================================================

function DefaultErrorFallback({ error, errorInfo, resetError }: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-950 via-slate-950 to-slate-950">
      <div className="glass-card rounded-3xl p-8 max-w-2xl w-full space-y-6">
        {/* Error Icon */}
        <div className="text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-black text-white mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-400">
            We&apos;re sorry for the inconvenience. The application encountered an unexpected error.
          </p>
        </div>

        {/* Error Message */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400 font-mono text-sm break-words">
            {error?.message || 'Unknown error occurred'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={resetError}
            className="flex-1"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => window.location.href = '/'}
            className="flex-1"
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Go Home
          </Button>
        </div>

        {/* Show Details Toggle */}
        <div className="text-center">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {showDetails ? '▼' : '▶'} {showDetails ? 'Hide' : 'Show'} Technical Details
          </button>
        </div>

        {/* Technical Details */}
        {showDetails && (
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">Error Message:</p>
              <p className="text-sm text-white font-mono break-words">
                {error?.message || 'No message'}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1">Stack Trace:</p>
              <pre className="text-xs text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap">
                {error?.stack || 'No stack trace'}
              </pre>
            </div>

            {errorInfo?.componentStack && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Component Stack:</p>
                <pre className="text-xs text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap">
                  {errorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Help Text */}
        <div className="text-center text-sm text-gray-500">
          <p>If this problem persists, please refresh the page or contact support.</p>
        </div>
      </div>
    </div>
  );
}

// ==============================================================================
// HOOK FOR ERROR BOUNDARIES
// ==============================================================================

/**
 * Hook to manually trigger error boundary
 * Useful for async errors that React doesn't catch
 */
export function useErrorHandler() {
  const [, setError] = React.useState<Error>();

  return React.useCallback((error: Error) => {
    console.error('Error caught by useErrorHandler:', error);
    setError(() => {
      throw error;
    });
  }, []);
}

// ==============================================================================
// EXPORTS
// ==============================================================================

export default ErrorBoundary;