'use client';

import * as React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useToast } from '../ui/toast';

// ============================================
// GAME CODE DISPLAY COMPONENT
// ============================================

interface GameCodeDisplayProps {
  gameCode: string;
  showTitle?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GameCodeDisplay: React.FC<GameCodeDisplayProps> = ({
  gameCode,
  showTitle = true,
  size = 'md',
  className = '',
}) => {
  const { success } = useToast();
  const [copied, setCopied] = React.useState(false);

  const sizeStyles = {
    sm: {
      code: 'text-xl',
      container: 'p-3',
      button: 'sm' as const,
    },
    md: {
      code: 'text-3xl',
      container: 'p-4',
      button: 'md' as const,
    },
    lg: {
      code: 'text-4xl',
      container: 'p-6',
      button: 'lg' as const,
    },
  };

  const styles = sizeStyles[size];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(gameCode);
      setCopied(true);
      success('Game code copied to clipboard!');
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Join my Farkle game!',
      text: `Join my Farkle game using code: ${gameCode}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or share failed
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className={styles.container}>
        <div className="space-y-4">
          {/* Title */}
          {showTitle && (
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                Game Code
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Share this code with your friend to join
              </p>
            </div>
          )}

          {/* Code Display */}
          <div className="relative">
            <div className="bg-gradient-to-br from-purple-50 via-white to-amber-50 dark:from-purple-900/20 dark:via-gray-800 dark:to-amber-900/20 border-2 border-purple-500 rounded-lg p-6 text-center">
              <div className="font-mono font-bold tracking-widest text-purple-600 dark:text-purple-400" style={{ fontSize: styles.code }}>
                {gameCode}
              </div>
            </div>

            {/* Animated Border */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-20 blur-xl animate-pulse pointer-events-none" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="primary"
              size={styles.button}
              onClick={handleCopy}
              className="flex-1"
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Code
                </>
              )}
            </Button>

            {typeof navigator.share === 'function' && (
              <Button
                variant="secondary"
                size={styles.button}
                onClick={handleShare}
                className="flex-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </Button>
            )}
          </div>

          {/* Helper Text */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Waiting for second player to join...
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// COMPACT GAME CODE (for in-game display)
// ============================================

interface CompactGameCodeProps {
  gameCode: string;
  className?: string;
}

export const CompactGameCode: React.FC<CompactGameCodeProps> = ({
  gameCode,
  className = '',
}) => {
  const { success } = useToast();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(gameCode);
      setCopied(true);
      success('Game code copied!');
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700 rounded-lg">
        <span className="text-sm font-mono font-bold text-purple-700 dark:text-purple-300 tracking-wider">
          {gameCode}
        </span>
      </div>
      <button
        onClick={handleCopy}
        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        title="Copy game code"
      >
        {copied ? (
          <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
    </div>
  );
};

// ============================================
// EXPORTS
// ============================================

export default GameCodeDisplay;