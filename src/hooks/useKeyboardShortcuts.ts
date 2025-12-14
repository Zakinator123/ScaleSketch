import { useEffect } from 'react';
import type { Tool } from '../types';

interface UseKeyboardShortcutsOptions {
  selectedShapeId: string | null;
  onUndo: () => void;
  onRedo: () => void;
  onDeleteSelected: () => void;
  onCancelDrawing: () => void;
  setSelectedShapeId: (id: string | null) => void;
  setActiveTool: (tool: Tool) => void;
}

export function useKeyboardShortcuts({
  selectedShapeId,
  onUndo,
  onRedo,
  onDeleteSelected,
  onCancelDrawing,
  setSelectedShapeId,
  setActiveTool
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        onUndo();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'z' && e.shiftKey || e.key === 'y')) {
        e.preventDefault();
        onRedo();
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedShapeId) {
        e.preventDefault();
        onDeleteSelected();
      }
      
      if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedShapeId(null);
        onCancelDrawing();
      }
      
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'v':
          case 's':
            setActiveTool('select');
            break;
          case 'l':
            setActiveTool('line');
            break;
          case 'r':
            setActiveTool('rectangle');
            break;
          case 'p':
            setActiveTool('polygon');
            break;
          case 'h':
            setActiveTool('pan');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedShapeId, onUndo, onRedo, onDeleteSelected, onCancelDrawing, setSelectedShapeId, setActiveTool]);
}

