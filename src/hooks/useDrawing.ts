import { useState, useCallback, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { Point, Tool, Shape } from '../types';
import { distance } from '../utils/geometry';
import { createLine, createRectangle, createPolygon } from '../utils/shapeFactory';
import { DRAG_DETECTION_THRESHOLD, TOOLTIP_DELAY_MS } from '../constants';

interface UseDrawingOptions {
  activeTool: Tool;
  currentColor: string;
  currentOpacity: number;
  currentStrokeWidth: number;
  onShapesChange: (shapes: Shape[]) => void;
  shapes: Shape[];
  onScaleDialogOpen: (line: { start: Point; end: Point }) => void;
  onCancelDrawing: () => void;
}

export function useDrawing({
  activeTool,
  currentColor,
  currentOpacity,
  currentStrokeWidth,
  onShapesChange,
  shapes,
  onScaleDialogOpen,
  onCancelDrawing
}: UseDrawingOptions) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [polygonPoints, setPolygonPoints] = useState<Point[]>([]);
  const [hasDragged, setHasDragged] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<Point | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startDrawing = useCallback((point: Point, screenPosition?: Point) => {
    if (activeTool === 'polygon') {
      setPolygonPoints(prev => [...prev, point]);
      return;
    }

    setIsDrawing(true);
    setDrawStart(point);
    setCurrentPoint(point);
    setHasDragged(false);
    
    if (screenPosition) {
      setTooltipPosition(screenPosition);
      tooltipTimeoutRef.current = setTimeout(() => {
        setShowTooltip(true);
      }, TOOLTIP_DELAY_MS);
    }
  }, [activeTool]);

  const updateDrawing = useCallback((point: Point, screenPosition?: Point) => {
    if (activeTool === 'polygon') {
      setCurrentPoint(point);
      return;
    }

    if (isDrawing) {
      setCurrentPoint(point);
      
      if (drawStart && !hasDragged) {
        const dragDistance = distance(drawStart, point);
        if (dragDistance > DRAG_DETECTION_THRESHOLD) {
          setHasDragged(true);
          setShowTooltip(false);
          if (tooltipTimeoutRef.current) {
            clearTimeout(tooltipTimeoutRef.current);
            tooltipTimeoutRef.current = null;
          }
        }
      }
      
      if (showTooltip && screenPosition) {
        setTooltipPosition(screenPosition);
      }
    }
  }, [activeTool, isDrawing, drawStart, hasDragged, showTooltip]);

  const finishDrawing = useCallback((point: Point) => {
    if (activeTool === 'polygon') {
      return;
    }

    if (!isDrawing || !drawStart || !currentPoint) return;

    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    setShowTooltip(false);

    const finalDragDistance = distance(drawStart, point);
    const actuallyDragged = hasDragged || finalDragDistance > DRAG_DETECTION_THRESHOLD;
    
    if (actuallyDragged) {
      if (activeTool === 'scale') {
        onScaleDialogOpen({ start: drawStart, end: point });
      } else if (activeTool === 'line') {
        const newLine = createLine(
          Date.now().toString(),
          drawStart,
          point,
          currentColor,
          currentStrokeWidth
        );
        onShapesChange([...shapes, newLine]);
      } else if (activeTool === 'rectangle') {
        const newRect = createRectangle(
          Date.now().toString(),
          drawStart,
          point,
          currentColor,
          currentOpacity,
          currentStrokeWidth
        );
        onShapesChange([...shapes, newRect]);
      }
    } else {
      const toolMessages: Record<Tool, string> = {
        scale: 'Please click and drag to set scale',
        line: 'Please click and drag to make a line',
        rectangle: 'Please click and drag to make a rectangle',
        polygon: 'Please click and drag to make a polygon',
        select: '',
        pan: ''
      };
      const message = toolMessages[activeTool];
      if (message) {
        toast.error(message);
      }
    }

    setIsDrawing(false);
    setDrawStart(null);
    setCurrentPoint(null);
    setHasDragged(false);
  }, [isDrawing, drawStart, currentPoint, hasDragged, activeTool, currentColor, currentOpacity, currentStrokeWidth, onShapesChange, shapes, onScaleDialogOpen]);

  const addPolygonPoint = useCallback((point: Point) => {
    setPolygonPoints(prev => [...prev, point]);
  }, []);

  const closePolygon = useCallback(() => {
    if (polygonPoints.length >= 3) {
      const newPolygon = createPolygon(
        Date.now().toString(),
        polygonPoints,
        currentColor,
        currentOpacity,
        currentStrokeWidth
      );
      onShapesChange([...shapes, newPolygon]);
      setPolygonPoints([]);
      setCurrentPoint(null);
    }
  }, [polygonPoints, currentColor, currentOpacity, currentStrokeWidth, shapes, onShapesChange]);

  const cancelDrawing = useCallback(() => {
    setIsDrawing(false);
    setDrawStart(null);
    setCurrentPoint(null);
    setPolygonPoints([]);
    setShowTooltip(false);
    setHasDragged(false);
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    onCancelDrawing();
  }, [onCancelDrawing]);

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  return {
    isDrawing,
    drawStart,
    currentPoint,
    polygonPoints,
    hasDragged,
    tooltipPosition,
    showTooltip,
    startDrawing,
    updateDrawing,
    finishDrawing,
    addPolygonPoint,
    closePolygon,
    cancelDrawing,
    setTooltipPosition
  };
}

