import { createContext, useContext, type ReactNode } from 'react';
import type { Shape, Tool, ScaleCalibration, Unit, DocumentSource, Point } from '../types';

interface AppContextValue {
  // Document state
  document: DocumentSource | null;
  setDocument: (doc: DocumentSource | null) => void;
  
  // Shapes state
  shapes: Shape[];
  setShapes: (shapes: Shape[] | ((prev: Shape[]) => Shape[])) => void;
  
  // Selection state
  selectedShapeId: string | null;
  setSelectedShapeId: (id: string | null) => void;
  
  // Tool state
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  
  // Scale state
  scale: ScaleCalibration | null;
  setScale: (scale: ScaleCalibration | null) => void;
  
  // Unit state
  currentUnit: Unit;
  setCurrentUnit: (unit: Unit) => void;
  
  // Style settings
  currentColor: string;
  setCurrentColor: (color: string) => void;
  currentOpacity: number;
  setCurrentOpacity: (opacity: number) => void;
  currentStrokeWidth: number;
  setCurrentStrokeWidth: (width: number) => void;
  
  // UI state
  showSideLengths: boolean;
  setShowSideLengths: (show: boolean) => void;
  
  // Scale dialog state
  scaleDialogOpen: boolean;
  setScaleDialogOpen: (open: boolean) => void;
  scaleDialogLine: { start: Point; end: Point } | null;
  setScaleDialogLine: (line: { start: Point; end: Point } | null) => void;
  onScaleDialogOpen: (line: { start: Point; end: Point }) => void;
  onCancelDrawing: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children, value }: { children: ReactNode; value: AppContextValue }) {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

