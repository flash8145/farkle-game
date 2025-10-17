'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';

// ==============================================================================
// NEXT.JS ERROR PAGE
// ==============================================================================
// Catches errors at the route level
// Automatically shown when a page component throws an error
// ==============================================================================

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  React.useEffect(() => {
    // Log error to console
    console.error('🔴 Page Error:', error);
    
    // TODO: Log to error reporting service
    // logErrorToService(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card rounded-3xl p-8 max-w-2xl w-full space-y-6 animate-fade-in">
        {/* Error Icon */}
        <div className="text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-in">
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

          <h1 className="text-4xl font-black text-white mb-3">
            Something Went Wrong
          </h1>
          <p className="text-gray-400 text-lg">
            Don't worry, we're on it! Try refreshing the page.
          </p>
        </div>

        {/* Error Message */}
        {error.message && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-red-400 font-mono text-sm break-words flex-1">
                {error.message}
              </p>
            </div>
          </div>
        )}

        {/* Error Digest (for tracking) */}
        {error.digest && (
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Error ID: <span className="font-mono">{error.digest}</span>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={reset}
            className="w-full"
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
            onClick={() => (window.location.href = '/')}
            className="w-full"
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

        {/* Technical Details Toggle */}
        <div className="text-center">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2"
          >
            <span>{showDetails ? '▼' : '▶'}</span>
            {showDetails ? 'Hide' : 'Show'} Technical Details
          </button>
        </div>

        {/* Technical Details */}
        {showDetails && (
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 space-y-3 animate-fade-in">
            <div>
              <p className="text-xs text-gray-400 mb-2 font-semibold">
                Error Details:
              </p>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-500">Name:</span>
                  <p className="text-sm text-white font-mono">{error.name}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Message:</span>
                  <p className="text-sm text-white font-mono break-words">
                    {error.message}
                  </p>
                </div>
                {error.digest && (
                  <div>
                    <span className="text-xs text-gray-500">Digest:</span>
                    <p className="text-sm text-white font-mono">{error.digest}</p>
                  </div>
                )}
              </div>
            </div>

            {error.stack && (
              <div>
                <p className="text-xs text-gray-400 mb-2 font-semibold">
                  Stack Trace:
                </p>
                <pre className="text-xs text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap bg-black/30 rounded p-3 max-h-60 overflow-y-auto">
                  {error.stack}
                </pre>
              </div>
            )}

            <div className="pt-3 border-t border-slate-700">
              <p className="text-xs text-gray-500">
                💡 <strong>Developer Tip:</strong> Check the browser console for more details.
              </p>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">
            If this problem persists, try these steps:
          </p>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Refresh the page</li>
            <li>• Clear your browser cache</li>
            <li>• Check your internet connection</li>
            <li>• Verify the API server is running</li>
          </ul>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-center gap-2 pt-4 border-t border-slate-700">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-500">Error detected</span>
        </div>
      </div>
    </div>
  );
}