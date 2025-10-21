'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlayerNameInput } from '@/components/ui/input';
import { FormField } from '@/components/ui/label';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/components/ui/toast';

// ============================================
// CREATE GAME PAGE
// ============================================

export default function CreateGamePage() {
  const router = useRouter();
  const { createGame, isLoading, error } = useGame();
  const { success, error: showError } = useToast();

  const [playerName, setPlayerName] = React.useState('');
  const [validationError, setValidationError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validate player name
    if (!playerName.trim()) {
      setValidationError('Please enter your name');
      return;
    }

    if (playerName.trim().length < 2) {
      setValidationError('Name must be at least 2 characters');
      return;
    }

    if (playerName.trim().length > 50) {
      setValidationError('Name must be less than 50 characters');
      return;
    }

    try {
      await createGame(playerName.trim());
      success('Game created successfully!');
      router.push('/game');
    } catch (err) {
      showError('Failed to create game. Please try again.');
      console.error('Create game error:', err);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center">
            <svg className="w-12 h-12 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-gradient-purple">Create Game</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Start a new multiplayer game
          </p>
        </div>

        {/* Form Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Game Setup</CardTitle>
            <CardDescription>
              Enter your name to create a new game. You&apos;ll receive a game code to share with your friend.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Player Name Field */}
              <FormField
                label="Your Name"
                required
                error={validationError}
                helperText="This name will be visible to other players"
              >
                <PlayerNameInput
                  value={playerName}
                  onChange={(e) => {
                    setPlayerName(e.target.value);
                    setValidationError('');
                  }}
                  placeholder="Enter your name"
                  disabled={isLoading}
                  autoFocus
                />
              </FormField>

              {/* API Error Display */}
              {error && !validationError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-500 rounded-lg p-3">
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isLoading || !playerName.trim()}
                isLoading={isLoading}
              >
                {isLoading ? 'Creating Game...' : 'Create Game'}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">or</span>
                </div>
              </div>

              {/* Alternative Actions */}
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="w-full"
                  onClick={() => router.push('/join')}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Join Existing Game
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="w-full"
                  onClick={() => router.push('/create-ai')}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 7H7v6h6V7z" />
                    <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                  </svg>
                  Play vs AI Instead
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  How it works:
                </p>
                <ol className="text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                  <li>Create a game and get a unique code</li>
                  <li>Share the code with a friend</li>
                  <li>Wait for them to join</li>
                  <li>Start playing!</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}