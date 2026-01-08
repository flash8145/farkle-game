'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { updateGameStatistics, isTokenExpired } from '@/lib/auth-utils';

interface User {
  id: number;
  username: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  gamesPlayed: number;
  gamesWon: number;
  highestScore: number;
  winRate: number;
  averageScore: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  updateGameStats: (won: boolean, score: number) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication on mount
    const storedToken = localStorage.getItem('farkle_token');
    const storedUser = localStorage.getItem('farkle_user');

    if (storedToken && storedUser) {
      try {
        // Check if token is expired
        if (isTokenExpired(storedToken)) {
          console.warn('Stored token has expired, logging out');
          localStorage.removeItem('farkle_token');
          localStorage.removeItem('farkle_user');
        } else {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('farkle_token');
        localStorage.removeItem('farkle_user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('farkle_token', newToken);
    localStorage.setItem('farkle_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('farkle_token');
    localStorage.removeItem('farkle_user');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('farkle_user', JSON.stringify(updatedUser));
  };

  const updateGameStats = async (won: boolean, score: number): Promise<boolean> => {
    try {
      // Check if token is expired before making the API call
      const currentToken = localStorage.getItem('farkle_token');
      if (currentToken && isTokenExpired(currentToken)) {
        console.warn('Token expired, logging out');
        logout();
        return false;
      }

      const result = await updateGameStatistics(won, score);
      
      // Handle 401 Unauthorized - token might have expired during the call
      if (!result.success && result.message?.includes('401')) {
        console.warn('Received 401 error, token may have expired');
        logout();
        return false;
      }
      
      if (result.success && result.user) {
        updateUser(result.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update game statistics:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    updateUser,
    updateGameStats,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
