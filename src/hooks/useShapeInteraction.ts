import { useState, useCallback } from 'react';
import type { Point, Shape } from '../types';
import { pointNearLine, pointInRotatedRectangle, pointInPolygon, pointNearVertex, rotatePoint, getRotatedRectangleCorners, distance } from '../utils/geometry';
import { updateShapeVertex, translateShape, rotateShape } from '../utils/shapeTransforms';
import { ROTATION_HANDLE_DISTANCE, VERTEX_SELECTION_THRESHOLD, LINE_SELECTION_THRESHOLD } from '../constants';

interface UseShapeInteractionOptions {
  shapes: Shape[];
  selectedShapeId: string | null;
  zoom: number;
  onShapesChange: (shapes: Shape[]) => void;
  onShapeSelect: (shapeId: string | null) => void;
}

export function useShapeInteraction({
  shapes,
  selectedShapeId,
  zoom,
  onShapesChange,
  onShapeSelect
}: UseShapeInteractionOptions) {
  const [draggedVertex, setDraggedVertex] = useState<{ shapeId: string; vertexIndex: number } | null>(null);
  const [draggedShape, setDraggedShape] = useState<string | null>(null);
  const [dragStartPoint, setDragStartPoint] = useState<Point | null>(null);
  const [rotatingShape, setRotatingShape] = useState<string | null>(null);
  const [rotationStartAngle, setRotationStartAngle] = useState<number>(0);

  const getShapeCenter = (shape: Shape): Point => {
    if (shape.type === 'rectangle') {
      return {
        x: (shape.topLeft.x + shape.bottomRight.x) / 2,
        y: (shape.topLeft.y + shape.bottomRight.y) / 2
      };
    } else if (shape.type === 'polygon') {
      return shape.center || {
        x: shape.points.reduce((sum, p) => sum + p.x, 0) / shape.points.length,
        y: shape.points.reduce((sum, p) => sum + p.y, 0) / shape.points.length
      };
    }
    return { x: 0, y: 0 };
  };

  const getShapeVertices = (shape: Shape): Point[] => {
    if (shape.type === 'line') {
      return [shape.start, shape.end];
    } else if (shape.type === 'rectangle') {
      return getRotatedRectangleCorners(shape.topLeft, shape.bottomRight, shape.rotation);
    } else if (shape.type === 'polygon') {
      const center = getShapeCenter(shape);
      return shape.points.map(p => rotatePoint(p, center, shape.rotation));
    }
    return [];
  };

  const getRotationHandlePoint = (shape: Shape, zoom: number): Point | null => {
    if (shape.type !== 'rectangle' && shape.type !== 'polygon') return null;
    if (shape.type === 'polygon' && !shape.closed) return null;

    const center = getShapeCenter(shape);
    let handleDistance: number;

    if (shape.type === 'rectangle') {
      const width = shape.bottomRight.x - shape.topLeft.x;
      const height = shape.bottomRight.y - shape.topLeft.y;
      handleDistance = Math.max(width, height) / 2 + ROTATION_HANDLE_DISTANCE / zoom;
    } else {
      const vertices = getShapeVertices(shape);
      const maxDist = Math.max(...vertices.map(p => distance(center, p)));
      handleDistance = maxDist + ROTATION_HANDLE_DISTANCE / zoom;
    }

    return rotatePoint(
      { x: center.x, y: center.y - handleDistance },
      center,
      shape.rotation
    );
  };

  const handleMouseDown = useCallback((point: Point) => {
    if (selectedShapeId) {
      const selectedShape = shapes.find(s => s.id === selectedShapeId);
      if (selectedShape) {
        const handlePoint = getRotationHandlePoint(selectedShape, zoom);
        if (handlePoint && pointNearVertex(point, handlePoint, VERTEX_SELECTION_THRESHOLD / zoom)) {
          const center = getShapeCenter(selectedShape);
          const angleRad = Math.atan2(point.y - center.y, point.x - center.x);
          const angleDeg = (angleRad * 180) / Math.PI;
          setRotatingShape(selectedShape.id);
          setRotationStartAngle((angleDeg - selectedShape.rotation) * Math.PI / 180);
          return { type: 'rotation' as const };
        }

        const vertices = getShapeVertices(selectedShape);
        const vertexIndex = vertices.findIndex(v => pointNearVertex(point, v, VERTEX_SELECTION_THRESHOLD / zoom));
        
        if (vertexIndex !== -1) {
          setDraggedVertex({ shapeId: selectedShape.id, vertexIndex });
          return { type: 'vertex' as const };
        }
      }
    }

    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i];
      let isInside = false;

      if (shape.type === 'line') {
        isInside = pointNearLine(point, shape.start, shape.end, LINE_SELECTION_THRESHOLD / zoom);
      } else if (shape.type === 'rectangle') {
        isInside = pointInRotatedRectangle(point, shape.topLeft, shape.bottomRight, shape.rotation);
      } else if (shape.type === 'polygon' && shape.closed) {
        const center = getShapeCenter(shape);
        const rotatedPoints = shape.points.map(p => rotatePoint(p, center, shape.rotation));
        isInside = pointInPolygon(point, rotatedPoints);
      }

      if (isInside) {
        onShapeSelect(shape.id);
        setDraggedShape(shape.id);
        setDragStartPoint(point);
        return { type: 'drag' as const };
      }
    }

    onShapeSelect(null);
    return { type: 'none' as const };
  }, [shapes, selectedShapeId, zoom, onShapeSelect]);

  const handleMouseMove = useCallback((point: Point) => {
    if (rotatingShape) {
      const shape = shapes.find(s => s.id === rotatingShape);
      if (shape && (shape.type === 'rectangle' || shape.type === 'polygon')) {
        const center = getShapeCenter(shape);
        const angleRad = Math.atan2(point.y - center.y, point.x - center.x);
        const angleDeg = (angleRad * 180) / Math.PI;
        const newRotation = angleDeg - (rotationStartAngle * 180) / Math.PI;
        
        const newShapes = shapes.map(s => 
          s.id === rotatingShape ? rotateShape(s, newRotation) : s
        );
        onShapesChange(newShapes);
      }
      return;
    }

    if (draggedVertex) {
      const shape = shapes.find(s => s.id === draggedVertex.shapeId);
      if (shape) {
        const newShapes = shapes.map(s =>
          s.id === draggedVertex.shapeId ? updateShapeVertex(s, draggedVertex.vertexIndex, point) : s
        );
        onShapesChange(newShapes);
      }
      return;
    }

    if (draggedShape && dragStartPoint) {
      const dx = point.x - dragStartPoint.x;
      const dy = point.y - dragStartPoint.y;

      const newShapes = shapes.map(shape =>
        shape.id === draggedShape ? translateShape(shape, dx, dy) : shape
      );

      onShapesChange(newShapes);
      setDragStartPoint(point);
      return;
    }
  }, [rotatingShape, draggedVertex, draggedShape, dragStartPoint, shapes, rotationStartAngle, onShapesChange]);

  const handleMouseUp = useCallback(() => {
    if (rotatingShape) {
      setRotatingShape(null);
      setRotationStartAngle(0);
      return;
    }

    if (draggedVertex) {
      setDraggedVertex(null);
      return;
    }

    if (draggedShape) {
      setDraggedShape(null);
      setDragStartPoint(null);
      return;
    }
  }, [rotatingShape, draggedVertex, draggedShape]);

  return {
    draggedVertex,
    draggedShape,
    rotatingShape,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    getShapeVertices,
    getRotationHandlePoint
  };
}

