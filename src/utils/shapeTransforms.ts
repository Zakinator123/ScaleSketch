import type { Shape, Point, LineShape, RectangleShape, PolygonShape } from '../types';
import { rotatePoint, getRotatedRectangleCorners } from './geometry';

export function updateLineVertex(
  shape: LineShape,
  vertexIndex: number,
  newPoint: Point
): LineShape {
  if (vertexIndex === 0) {
    return { ...shape, start: newPoint };
  } else {
    return { ...shape, end: newPoint };
  }
}

export function updateRectangleVertex(
  shape: RectangleShape,
  vertexIndex: number,
  newPoint: Point
): RectangleShape {
  const rotatedCorners = getRotatedRectangleCorners(shape.topLeft, shape.bottomRight, shape.rotation);
  const oppositeIndex = (vertexIndex + 2) % 4;
  const anchorScreenPos = rotatedCorners[oppositeIndex];
  const draggedScreenPos = newPoint;
  
  const newCenterScreen = {
    x: (anchorScreenPos.x + draggedScreenPos.x) / 2,
    y: (anchorScreenPos.y + draggedScreenPos.y) / 2
  };
  
  const diagX = draggedScreenPos.x - anchorScreenPos.x;
  const diagY = draggedScreenPos.y - anchorScreenPos.y;
  
  const angleRad = (-shape.rotation * Math.PI) / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const localDiagX = diagX * cos - diagY * sin;
  const localDiagY = diagX * sin + diagY * cos;
  
  const newHalfWidth = Math.max(1, Math.abs(localDiagX) / 2);
  const newHalfHeight = Math.max(1, Math.abs(localDiagY) / 2);
  
  return {
    ...shape,
    topLeft: {
      x: newCenterScreen.x - newHalfWidth,
      y: newCenterScreen.y - newHalfHeight
    },
    bottomRight: {
      x: newCenterScreen.x + newHalfWidth,
      y: newCenterScreen.y + newHalfHeight
    }
  };
}

export function updatePolygonVertex(
  shape: PolygonShape,
  vertexIndex: number,
  newPoint: Point
): PolygonShape {
  const center = shape.center || {
    x: shape.points.reduce((sum, p) => sum + p.x, 0) / shape.points.length,
    y: shape.points.reduce((sum, p) => sum + p.y, 0) / shape.points.length
  };
  
  const currentRotatedPos = rotatePoint(shape.points[vertexIndex], center, shape.rotation);
  const deltaX = newPoint.x - currentRotatedPos.x;
  const deltaY = newPoint.y - currentRotatedPos.y;
  
  const angleRad = (-shape.rotation * Math.PI) / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const unrotatedDeltaX = deltaX * cos - deltaY * sin;
  const unrotatedDeltaY = deltaX * sin + deltaY * cos;
  
  const newPoints = [...shape.points];
  newPoints[vertexIndex] = {
    x: shape.points[vertexIndex].x + unrotatedDeltaX,
    y: shape.points[vertexIndex].y + unrotatedDeltaY
  };
  
  return { ...shape, points: newPoints };
}

export function updateShapeVertex(
  shape: Shape,
  vertexIndex: number,
  newPoint: Point
): Shape {
  if (shape.type === 'line') {
    return updateLineVertex(shape, vertexIndex, newPoint);
  } else if (shape.type === 'rectangle') {
    return updateRectangleVertex(shape, vertexIndex, newPoint);
  } else if (shape.type === 'polygon') {
    return updatePolygonVertex(shape, vertexIndex, newPoint);
  }
  return shape;
}

export function translateLine(shape: LineShape, dx: number, dy: number): LineShape {
  return {
    ...shape,
    start: { x: shape.start.x + dx, y: shape.start.y + dy },
    end: { x: shape.end.x + dx, y: shape.end.y + dy }
  };
}

export function translateRectangle(shape: RectangleShape, dx: number, dy: number): RectangleShape {
  return {
    ...shape,
    topLeft: { x: shape.topLeft.x + dx, y: shape.topLeft.y + dy },
    bottomRight: { x: shape.bottomRight.x + dx, y: shape.bottomRight.y + dy }
  };
}

export function translatePolygon(shape: PolygonShape, dx: number, dy: number): PolygonShape {
  const newPoints = shape.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
  const newCenter = shape.center ? { x: shape.center.x + dx, y: shape.center.y + dy } : undefined;
  return {
    ...shape,
    points: newPoints,
    center: newCenter
  };
}

export function translateShape(shape: Shape, dx: number, dy: number): Shape {
  if (shape.type === 'line') {
    return translateLine(shape, dx, dy);
  } else if (shape.type === 'rectangle') {
    return translateRectangle(shape, dx, dy);
  } else if (shape.type === 'polygon') {
    return translatePolygon(shape, dx, dy);
  }
  return shape;
}

export function rotateShape(shape: Shape, newRotation: number): Shape {
  if (shape.type === 'rectangle') {
    return { ...shape, rotation: newRotation };
  } else if (shape.type === 'polygon') {
    return { ...shape, rotation: newRotation };
  }
  // Lines don't support rotation
  return shape;
}

