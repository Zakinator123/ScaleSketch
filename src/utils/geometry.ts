import type { Point } from '../types';

/**
 * Calculate Euclidean distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the area of a polygon using the Shoelace formula
 */
export function polygonArea(points: Point[]): number {
  if (points.length < 3) return 0;
  
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area / 2);
}

/**
 * Calculate the perimeter of a polygon
 */
export function polygonPerimeter(points: Point[]): number {
  if (points.length < 2) return 0;
  
  let perimeter = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    perimeter += distance(points[i], points[j]);
  }
  return perimeter;
}

/**
 * Calculate area of a rectangle
 */
export function rectangleArea(topLeft: Point, bottomRight: Point): number {
  const width = Math.abs(bottomRight.x - topLeft.x);
  const height = Math.abs(bottomRight.y - topLeft.y);
  return width * height;
}

/**
 * Get rectangle dimensions
 */
export function rectangleDimensions(topLeft: Point, bottomRight: Point): { width: number; height: number } {
  const width = Math.abs(bottomRight.x - topLeft.x);
  const height = Math.abs(bottomRight.y - topLeft.y);
  return { width, height };
}

/**
 * Check if a point is inside a polygon using ray casting algorithm
 */
export function pointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    
    const intersect = ((yi > point.y) !== (yj > point.y))
        && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Check if a point is near a line segment (within threshold distance)
 */
export function pointNearLine(point: Point, lineStart: Point, lineEnd: Point, threshold: number = 5): boolean {
  const dist = distanceToLineSegment(point, lineStart, lineEnd);
  return dist <= threshold;
}

/**
 * Calculate the distance from a point to a line segment
 */
export function distanceToLineSegment(point: Point, lineStart: Point, lineEnd: Point): number {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  
  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx, yy;

  if (param < 0) {
    xx = lineStart.x;
    yy = lineStart.y;
  } else if (param > 1) {
    xx = lineEnd.x;
    yy = lineEnd.y;
  } else {
    xx = lineStart.x + param * C;
    yy = lineStart.y + param * D;
  }

  const dx = point.x - xx;
  const dy = point.y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if point is near a vertex (for selection/editing)
 */
export function pointNearVertex(point: Point, vertex: Point, threshold: number = 8): boolean {
  return distance(point, vertex) <= threshold;
}

/**
 * Check if a point is inside a rectangle
 */
export function pointInRectangle(point: Point, topLeft: Point, bottomRight: Point): boolean {
  const minX = Math.min(topLeft.x, bottomRight.x);
  const maxX = Math.max(topLeft.x, bottomRight.x);
  const minY = Math.min(topLeft.y, bottomRight.y);
  const maxY = Math.max(topLeft.y, bottomRight.y);
  
  return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
}

/**
 * Get the rectangle corners from topLeft and bottomRight
 */
export function getRectangleCorners(topLeft: Point, bottomRight: Point): Point[] {
  return [
    topLeft,
    { x: bottomRight.x, y: topLeft.y },
    bottomRight,
    { x: topLeft.x, y: bottomRight.y }
  ];
}

/**
 * Transform a point from screen coordinates to canvas coordinates
 */
export function screenToCanvas(screenPoint: Point, panOffset: Point, zoom: number): Point {
  return {
    x: (screenPoint.x - panOffset.x) / zoom,
    y: (screenPoint.y - panOffset.y) / zoom
  };
}

/**
 * Transform a point from canvas coordinates to screen coordinates
 */
export function canvasToScreen(canvasPoint: Point, panOffset: Point, zoom: number): Point {
  return {
    x: canvasPoint.x * zoom + panOffset.x,
    y: canvasPoint.y * zoom + panOffset.y
  };
}

/**
 * Rotate a point around a center point by angle in degrees
 */
export function rotatePoint(point: Point, center: Point, angleDegrees: number): Point {
  const angleRad = (angleDegrees * Math.PI) / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos
  };
}

/**
 * Get rotated rectangle corners
 */
export function getRotatedRectangleCorners(topLeft: Point, bottomRight: Point, rotation: number): Point[] {
  const center = {
    x: (topLeft.x + bottomRight.x) / 2,
    y: (topLeft.y + bottomRight.y) / 2
  };
  
  const corners = [
    topLeft,
    { x: bottomRight.x, y: topLeft.y },
    bottomRight,
    { x: topLeft.x, y: bottomRight.y }
  ];
  
  return corners.map(corner => rotatePoint(corner, center, rotation));
}

/**
 * Check if a point is inside a rotated rectangle
 */
export function pointInRotatedRectangle(point: Point, topLeft: Point, bottomRight: Point, rotation: number): boolean {
  if (rotation === 0) {
    return pointInRectangle(point, topLeft, bottomRight);
  }
  
  const center = {
    x: (topLeft.x + bottomRight.x) / 2,
    y: (topLeft.y + bottomRight.y) / 2
  };
  
  // Rotate point back by negative rotation
  const unrotatedPoint = rotatePoint(point, center, -rotation);
  
  return pointInRectangle(unrotatedPoint, topLeft, bottomRight);
}

