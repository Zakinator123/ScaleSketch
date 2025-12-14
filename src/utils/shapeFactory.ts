import type { LineShape, RectangleShape, PolygonShape, Point } from '../types';

export function createLine(
  id: string,
  start: Point,
  end: Point,
  color: string,
  strokeWidth: number
): LineShape {
  return {
    id,
    type: 'line',
    start,
    end,
    color,
    opacity: 1,
    strokeWidth,
    selected: false,
    visible: true
  };
}

export function createRectangle(
  id: string,
  topLeft: Point,
  bottomRight: Point,
  color: string,
  opacity: number,
  strokeWidth: number
): RectangleShape {
  return {
    id,
    type: 'rectangle',
    topLeft: {
      x: Math.min(topLeft.x, bottomRight.x),
      y: Math.min(topLeft.y, bottomRight.y)
    },
    bottomRight: {
      x: Math.max(topLeft.x, bottomRight.x),
      y: Math.max(topLeft.y, bottomRight.y)
    },
    rotation: 0,
    color,
    opacity,
    strokeWidth,
    selected: false,
    visible: true
  };
}

export function createPolygon(
  id: string,
  points: Point[],
  color: string,
  opacity: number,
  strokeWidth: number
): PolygonShape {
  // Calculate center for rotation
  let cx = 0, cy = 0;
  points.forEach(p => {
    cx += p.x;
    cy += p.y;
  });
  cx /= points.length;
  cy /= points.length;
  
  return {
    id,
    type: 'polygon',
    points: [...points],
    closed: true,
    rotation: 0,
    center: { x: cx, y: cy },
    color,
    opacity,
    strokeWidth,
    selected: false,
    visible: true
  };
}

