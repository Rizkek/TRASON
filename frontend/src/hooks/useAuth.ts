'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export const useAuth = () => {
  const {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setTokens,
    logout,
    clearError,
    setLoading,
  } = useAuthStore();

  useEffect(() => {
    // Check if user is authenticated on mount
    const token = localStorage.getItem('accessToken');
    if (token && !isAuthenticated) {
      // Token exists but not loaded in store yet
      // This handles page refresh scenarios
    }
  }, []);

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setTokens,
    logout,
    clearError,
    setLoading,
  };
};
