export type Point = {
  x: number;
  y: number;
};

export type Unit = 'feet' | 'meters';

export type Tool = 
  | 'select'
  | 'scale'
  | 'line'
  | 'rectangle'
  | 'polygon'
  | 'pan';

export type ShapeType = 'line' | 'rectangle' | 'polygon';

export interface BaseShape {
  id: string;
  type: ShapeType;
  color: string;
  opacity: number;
  strokeWidth: number;
  selected: boolean;
  label?: string;
  visible?: boolean;
}

export interface LineShape extends BaseShape {
  type: 'line';
  start: Point;
  end: Point;
}

export interface RectangleShape extends BaseShape {
  type: 'rectangle';
  topLeft: Point;
  bottomRight: Point;
  rotation: number; // rotation in degrees
}

export interface PolygonShape extends BaseShape {
  type: 'polygon';
  points: Point[];
  closed: boolean;
  rotation: number; // rotation in degrees
  center?: Point; // center point for rotation
}

export type Shape = LineShape | RectangleShape | PolygonShape;

export interface ScaleCalibration {
  pixelDistance: number;
  realWorldDistance: number;
  unit: Unit;
  calibrationLine: {
    start: Point;
    end: Point;
  };
}

export interface Measurement {
  length?: number;
  width?: number;
  height?: number;
  area?: number;
  perimeter?: number;
  unit: Unit;
}

export interface AppState {
  image: HTMLImageElement | null;
  imageLoaded: boolean;
  scale: ScaleCalibration | null;
  shapes: Shape[];
  activeTool: Tool;
  selectedShapeId: string | null;
  currentUnit: Unit;
  // Drawing state
  isDrawing: boolean;
  currentShape: Partial<Shape> | null;
  // Canvas state
  panOffset: Point;
  zoom: number;
  // UI state
  showMeasurementPanel: boolean;
}

export interface DrawingState {
  isDrawing: boolean;
  startPoint: Point | null;
  currentPoint: Point | null;
  tempPoints: Point[];
}

export interface CanvasTransform {
  panOffset: Point;
  zoom: number;
}

// Document types for extensible file format support
export type DocumentType = 'image' | 'pdf' | 'cad';

export interface DocumentSource {
  type: DocumentType;
  name: string;
  data: HTMLImageElement; // Will expand to union type when adding PDF/CAD support
}
