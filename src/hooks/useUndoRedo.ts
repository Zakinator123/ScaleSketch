import { useState, useCallback } from 'react';

export function useUndoRedo<T>(initialState: T) {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    setHistory(prev => {
      const current = prev[currentIndex];
      const next = typeof newState === 'function' 
        ? (newState as (prev: T) => T)(current)
        : newState;
      
      // Remove any future history and add new state
      const newHistory = [...prev.slice(0, currentIndex + 1), next];
      
      // Limit history to 50 items
      if (newHistory.length > 50) {
        newHistory.shift();
        setCurrentIndex(currentIndex);
      } else {
        setCurrentIndex(currentIndex + 1);
      }
      
      return newHistory;
    });
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, history.length]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    state: history[currentIndex],
    setState,
    undo,
    redo,
    canUndo,
    canRedo
  };
}

