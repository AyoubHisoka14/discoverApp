import { useState, useEffect, useRef } from 'react';

interface UsePageStateOptions<T> {
  key: string;
  initialState: T;
  persist?: boolean;
  autoResetMinutes?: number; // Auto reset state after specified minutes
}

export function usePageState<T>({ 
  key, 
  initialState, 
  persist = true, 
  autoResetMinutes = 2
}: UsePageStateOptions<T>) {
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize state from localStorage or defaults
  const getInitialState = (): T => {
    if (!persist) return initialState;
    
    const savedState = localStorage.getItem(key);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        return { ...initialState, ...parsed };
      } catch (error) {
        console.error(`Error parsing saved state for key ${key}:`, error);
      }
    }
    return initialState;
  };

  const [state, setState] = useState<T>(getInitialState);

  // Save state to localStorage
  const saveState = (newState: Partial<T>) => {
    if (!persist) return;
    const currentState = { ...state, ...newState };
    localStorage.setItem(key, JSON.stringify(currentState));
    
    // Reset auto-reset timer whenever state is saved
    resetAutoResetTimer();
  };

  // Clear saved state
  const clearSavedState = () => {
    if (!persist) return;
    localStorage.removeItem(key);
  };

  // Update state and save to localStorage
  const updateState = (newState: Partial<T>) => {
    const updatedState = { ...state, ...newState };
    setState(updatedState);
    saveState(updatedState);
  };

  // Reset state to initial values
  const resetState = () => {
    setState(initialState);
    clearSavedState();
    resetAutoResetTimer();
  };

  // Reset auto-reset timer
  const resetAutoResetTimer = () => {
    // Clear existing timer
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }
    
    // Set new timer
    if (autoResetMinutes > 0) {
      resetTimeoutRef.current = setTimeout(() => {
        resetState();
      }, autoResetMinutes * 60 * 1000);
    }
  };

  // Initialize auto-reset timer on mount
  useEffect(() => {
    if (persist && autoResetMinutes > 0) {
      resetAutoResetTimer();
    }
    
    // Cleanup timer on unmount
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, [persist, autoResetMinutes, key]);

  return {
    state,
    setState,
    updateState,
    clearSavedState,
    resetState,
  };
} 