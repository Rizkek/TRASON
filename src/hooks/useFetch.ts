'use client';

import { useState, useCallback } from 'react';

interface UseFetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseFetchOptions<T = unknown> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

export const useFetch = <T = any>(
  initialData: T | null = null
) => {
  const [state, setState] = useState<UseFetchState<T>>({
    data: initialData,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (
      promise: Promise<T>,
      options?: UseFetchOptions
    ) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await promise;
        setState({
          data: response,
          isLoading: false,
          error: null,
        });
        options?.onSuccess?.(response);
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred';

        setState({
          data: null,
          isLoading: false,
          error: errorMessage,
        });
        options?.onError?.(errorMessage);
        throw err;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      data: initialData,
      isLoading: false,
      error: null,
    });
  }, [initialData]);

  return {
    ...state,
    execute,
    reset,
  };
};

export const useAsyncOperation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      options?: UseFetchOptions
    ): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await operation();
        setIsLoading(false);
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        setIsLoading(false);
        options?.onError?.(errorMessage);
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    error,
    execute,
    reset,
  };
};
