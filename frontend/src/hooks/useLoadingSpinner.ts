import { useState } from 'react';

/**
 * Custom hook for managing loading spinner state
 * Provides convenient methods to show, hide, and toggle loading states
 */
export const useLoadingSpinner = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);

  const showSpinner = () => setIsLoading(true);
  const hideSpinner = () => setIsLoading(false);
  const toggleSpinner = () => setIsLoading(prev => !prev);

  return {
    isLoading,
    showSpinner,
    hideSpinner,
    toggleSpinner,
    setIsLoading
  };
};

/**
 * Hook for managing multiple loading states
 * Useful when you have different loading operations happening simultaneously
 */
export const useMultipleLoadingSpinners = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const setLoading = (key: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }));
  };

  const isLoading = (key: string) => {
    return loadingStates[key] || false;
  };

  const isAnyLoading = () => {
    return Object.values(loadingStates).some(loading => loading);
  };

  const clearAll = () => {
    setLoadingStates({});
  };

  return {
    setLoading,
    isLoading,
    isAnyLoading,
    clearAll,
    loadingStates
  };
};

/**
 * Hook for managing loading with automatic timeout
 * Automatically hides loading after specified duration
 */
export const useLoadingWithTimeout = (timeoutMs = 30000) => {
  const [isLoading, setIsLoading] = useState(false);

  const showLoading = () => {
    setIsLoading(true);
    
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, timeoutMs);

    return () => clearTimeout(timeout);
  };

  const hideLoading = () => {
    setIsLoading(false);
  };

  return {
    isLoading,
    showLoading,
    hideLoading
  };
};

// Example usage:
// const { isLoading, showSpinner, hideSpinner } = useLoadingSpinner();
// const { setLoading, isLoading: isSpecificLoading } = useMultipleLoadingSpinners();
// const { isLoading: isTimedLoading, showLoading } = useLoadingWithTimeout(5000);
