import type { Shape, ScaleCalibration, Unit, Point, Tool } from '../types';
import { distance, rotatePoint, getRotatedRectangleCorners } from './geometry';
import { calculateMeasurements } from './measurement';
import { formatMeasurement, formatArea } from './units';
import { canvasToScreen, pointNearVertex } from './geometry';
import {
  VERTEX_FILL_COLOR,
  VERTEX_STROKE_COLOR,
  VERTEX_RADIUS,
  ROTATION_HANDLE_COLOR,
  ROTATION_HANDLE_RADIUS,
  ROTATION_HANDLE_DISTANCE,
  SCALE_LINE_COLOR,
  CLOSE_HINT_COLOR,
  CLOSE_HINT_BG_COLOR,
  CLOSE_HINT_RADIUS_OUTER,
  CLOSE_HINT_RADIUS_INNER,
  POLYGON_CLOSE_THRESHOLD,
  TOOLTIP_BACKGROUND_COLOR,
  TOOLTIP_BORDER_COLOR,
  TOOLTIP_TEXT_COLOR,
  MEASUREMENT_LABEL_PADDING,
  MEASUREMENT_LABEL_HEIGHT,
  MEASUREMENT_LABEL_OFFSET_Y,
} from '../constants';

interface RenderContext {
  ctx: CanvasRenderingContext2D;
  panOffset: Point;
  zoom: number;
}

export function drawVertex(ctx: CanvasRenderingContext2D, point: Point, zoom: number) {
  ctx.fillStyle = VERTEX_FILL_COLOR;
  ctx.strokeStyle = VERTEX_STROKE_COLOR;
  ctx.lineWidth = 1 / zoom;
  ctx.beginPath();
  ctx.arc(point.x, point.y, VERTEX_RADIUS / zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

export function drawMeasurementLabel(
  ctx: CanvasRenderingContext2D,
  point: Point,
  text: string,
  zoom: number,
  panOffset: Point
) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  
  const screenPoint = canvasToScreen(point, panOffset, zoom);
  
  ctx.font = '12px sans-serif';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  const metrics = ctx.measureText(text);
  ctx.fillRect(
    screenPoint.x - metrics.width / 2 - MEASUREMENT_LABEL_PADDING,
    screenPoint.y - MEASUREMENT_LABEL_OFFSET_Y,
    metrics.width + MEASUREMENT_LABEL_PADDING * 2,
    MEASUREMENT_LABEL_HEIGHT
  );
  
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, screenPoint.x, screenPoint.y - 12);
  
  ctx.restore();
}

export function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  scale: ScaleCalibration | null,
  unit: Unit,
  zoom: number,
  showSideLengths: boolean,
  isSelected: boolean,
  panOffset: Point
) {
  ctx.strokeStyle = shape.color;
  ctx.lineWidth = shape.strokeWidth / zoom;
  ctx.globalAlpha = 1;

  if (shape.type === 'line') {
    ctx.beginPath();
    ctx.moveTo(shape.start.x, shape.start.y);
    ctx.lineTo(shape.end.x, shape.end.y);
    ctx.stroke();

    if (isSelected) {
      drawVertex(ctx, shape.start, zoom);
      drawVertex(ctx, shape.end, zoom);
    }

    if (scale) {
      const measurement = calculateMeasurements(shape, scale, unit);
      if (measurement && measurement.length) {
        const midPoint = {
          x: (shape.start.x + shape.end.x) / 2,
          y: (shape.start.y + shape.end.y) / 2
        };
        drawMeasurementLabel(ctx, midPoint, formatMeasurement(measurement.length, unit), zoom, panOffset);
      }
    }
  } else if (shape.type === 'rectangle') {
    const center = {
      x: (shape.topLeft.x + shape.bottomRight.x) / 2,
      y: (shape.topLeft.y + shape.bottomRight.y) / 2
    };
    const width = shape.bottomRight.x - shape.topLeft.x;
    const height = shape.bottomRight.y - shape.topLeft.y;
    
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate((shape.rotation * Math.PI) / 180);
    ctx.translate(-center.x, -center.y);
    
    ctx.fillStyle = shape.color;
    ctx.globalAlpha = shape.opacity;
    ctx.fillRect(shape.topLeft.x, shape.topLeft.y, width, height);
    
    ctx.globalAlpha = 1;
    ctx.strokeRect(shape.topLeft.x, shape.topLeft.y, width, height);
    
    ctx.restore();

    if (isSelected) {
      const corners = getRotatedRectangleCorners(shape.topLeft, shape.bottomRight, shape.rotation);
      corners.forEach(corner => drawVertex(ctx, corner, zoom));
      
      const handleDistance = Math.max(width, height) / 2 + ROTATION_HANDLE_DISTANCE / zoom;
      const handlePoint = rotatePoint(
        { x: center.x, y: center.y - handleDistance },
        center,
        shape.rotation
      );
      
      ctx.strokeStyle = ROTATION_HANDLE_COLOR;
      ctx.lineWidth = 1 / zoom;
      ctx.setLineDash([3 / zoom, 3 / zoom]);
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(handlePoint.x, handlePoint.y);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = ROTATION_HANDLE_COLOR;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2 / zoom;
      ctx.beginPath();
      ctx.arc(handlePoint.x, handlePoint.y, ROTATION_HANDLE_RADIUS / zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    if (scale) {
      const measurement = calculateMeasurements(shape, scale, unit);
      if (measurement) {
        const label = measurement.area 
          ? `${formatArea(measurement.area, unit)}`
          : '';
        if (label) drawMeasurementLabel(ctx, center, label, zoom, panOffset);
      }
    }
  } else if (shape.type === 'polygon' && shape.closed) {
    const center = shape.center || {
      x: shape.points.reduce((sum, p) => sum + p.x, 0) / shape.points.length,
      y: shape.points.reduce((sum, p) => sum + p.y, 0) / shape.points.length
    };
    
    const rotatedPoints = shape.points.map(p => rotatePoint(p, center, shape.rotation));
    
    ctx.beginPath();
    ctx.moveTo(rotatedPoints[0].x, rotatedPoints[0].y);
    for (let i = 1; i < rotatedPoints.length; i++) {
      ctx.lineTo(rotatedPoints[i].x, rotatedPoints[i].y);
    }
    ctx.closePath();
    
    ctx.fillStyle = shape.color;
    ctx.globalAlpha = shape.opacity;
    ctx.fill();
    
    ctx.globalAlpha = 1;
    ctx.stroke();

    if (isSelected) {
      rotatedPoints.forEach(point => drawVertex(ctx, point, zoom));
      
      const maxDist = Math.max(...rotatedPoints.map(p => distance(center, p)));
      const handleDistance = maxDist + ROTATION_HANDLE_DISTANCE / zoom;
      const handlePoint = rotatePoint(
        { x: center.x, y: center.y - handleDistance },
        center,
        shape.rotation
      );
      
      ctx.strokeStyle = ROTATION_HANDLE_COLOR;
      ctx.lineWidth = 1 / zoom;
      ctx.setLineDash([3 / zoom, 3 / zoom]);
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(handlePoint.x, handlePoint.y);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = ROTATION_HANDLE_COLOR;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2 / zoom;
      ctx.beginPath();
      ctx.arc(handlePoint.x, handlePoint.y, ROTATION_HANDLE_RADIUS / zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    if (scale && showSideLengths) {
      for (let i = 0; i < rotatedPoints.length; i++) {
        const j = (i + 1) % rotatedPoints.length;
        const p1 = rotatedPoints[i];
        const p2 = rotatedPoints[j];
        const pixelDist = distance(p1, p2);
        const realDist = (pixelDist / scale.pixelDistance) * scale.realWorldDistance;
        const convertedDist = unit === scale.unit ? realDist : 
          (unit === 'meters' ? realDist * 0.3048 : realDist / 0.3048);
        
        const midPoint = {
          x: (p1.x + p2.x) / 2,
          y: (p1.y + p2.y) / 2
        };
        drawMeasurementLabel(ctx, midPoint, formatMeasurement(convertedDist, unit), zoom, panOffset);
      }
    }

    if (scale) {
      const measurement = calculateMeasurements(shape, scale, unit);
      if (measurement && measurement.area) {
        drawMeasurementLabel(ctx, center, formatArea(measurement.area, unit), zoom, panOffset);
      }
    }
  }
}

export function drawScaleCalibrationLine(
  ctx: CanvasRenderingContext2D,
  scale: ScaleCalibration,
  zoom: number
) {
  ctx.strokeStyle = SCALE_LINE_COLOR;
  ctx.lineWidth = 2 / zoom;
  ctx.setLineDash([5 / zoom, 5 / zoom]);
  ctx.beginPath();
  ctx.moveTo(scale.calibrationLine.start.x, scale.calibrationLine.start.y);
  ctx.lineTo(scale.calibrationLine.end.x, scale.calibrationLine.end.y);
  ctx.stroke();
  ctx.setLineDash([]);
}

export function drawDrawingPreview(
  ctx: CanvasRenderingContext2D,
  tool: Tool,
  drawStart: Point,
  currentPoint: Point,
  color: string,
  strokeWidth: number,
  zoom: number
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth / zoom;
  ctx.setLineDash([5 / zoom, 5 / zoom]);

  if (tool === 'line' || tool === 'scale') {
    ctx.beginPath();
    ctx.moveTo(drawStart.x, drawStart.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.stroke();
  } else if (tool === 'rectangle') {
    ctx.strokeRect(
      drawStart.x,
      drawStart.y,
      currentPoint.x - drawStart.x,
      currentPoint.y - drawStart.y
    );
  }
  
  ctx.setLineDash([]);
}

export function drawPolygonPreview(
  ctx: CanvasRenderingContext2D,
  polygonPoints: Point[],
  currentPoint: Point | null,
  color: string,
  strokeWidth: number,
  zoom: number,
  panOffset: Point,
  scale: ScaleCalibration | null,
  unit: Unit,
  showSideLengths: boolean
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth / zoom;
  
  ctx.beginPath();
  ctx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
  for (let i = 1; i < polygonPoints.length; i++) {
    ctx.lineTo(polygonPoints[i].x, polygonPoints[i].y);
  }
  
  if (currentPoint) {
    ctx.setLineDash([5 / zoom, 5 / zoom]);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.setLineDash([]);
  }
  
  ctx.stroke();

  if (scale && showSideLengths) {
    for (let i = 0; i < polygonPoints.length; i++) {
      const p1 = polygonPoints[i];
      const p2 = i < polygonPoints.length - 1 ? polygonPoints[i + 1] : (currentPoint || polygonPoints[0]);
      const pixelDist = distance(p1, p2);
      const realDist = (pixelDist / scale.pixelDistance) * scale.realWorldDistance;
      const convertedDist = unit === scale.unit ? realDist : 
        (unit === 'meters' ? realDist * 0.3048 : realDist / 0.3048);
      
      const midPoint = {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2
      };
      drawMeasurementLabel(ctx, midPoint, formatMeasurement(convertedDist, unit), zoom, panOffset);
    }
  }

  let showCloseHint = false;
  polygonPoints.forEach((point, index) => {
    if (index === 0 && polygonPoints.length >= 3 && currentPoint) {
      const canClose = pointNearVertex(currentPoint, point, POLYGON_CLOSE_THRESHOLD / zoom);
      if (canClose) {
        showCloseHint = true;
        ctx.fillStyle = CLOSE_HINT_COLOR;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2 / zoom;
        ctx.beginPath();
        ctx.arc(point.x, point.y, CLOSE_HINT_RADIUS_OUTER / zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(point.x, point.y, CLOSE_HINT_RADIUS_INNER / zoom, 0, Math.PI * 2);
        ctx.fill();
        return;
      }
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4 / zoom, 0, Math.PI * 2);
    ctx.fill();
  });
  
  if (showCloseHint && polygonPoints.length >= 3) {
    const firstPoint = polygonPoints[0];
    const tooltipPoint = { x: firstPoint.x, y: firstPoint.y - 25 / zoom };
    
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const screenPoint = canvasToScreen(tooltipPoint, panOffset, zoom);
    
    const text = 'Click to close';
    ctx.font = 'bold 12px sans-serif';
    const metrics = ctx.measureText(text);
    const padding = 6;
    const tooltipWidth = metrics.width + padding * 2;
    const tooltipHeight = 20;
    
    ctx.fillStyle = CLOSE_HINT_BG_COLOR;
    ctx.beginPath();
    ctx.roundRect(
      screenPoint.x - tooltipWidth / 2,
      screenPoint.y - tooltipHeight / 2,
      tooltipWidth,
      tooltipHeight,
      4
    );
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, screenPoint.x, screenPoint.y);
    
    ctx.restore();
  }
}

export function drawTooltip(
  ctx: CanvasRenderingContext2D,
  tooltipPosition: Point,
  tool: Tool
) {
  const toolMessages: Record<Tool, string> = {
    scale: 'Drag to set scale',
    line: 'Drag to make a line',
    rectangle: 'Drag to make a rectangle',
    polygon: 'Drag to make a polygon',
    select: '',
    pan: ''
  };
  const text = toolMessages[tool];
  
  if (!text) return;
  
  ctx.font = 'bold 12px sans-serif';
  const metrics = ctx.measureText(text);
  const padding = 8;
  const tooltipWidth = metrics.width + padding * 2;
  const tooltipHeight = 24;
  
  ctx.fillStyle = TOOLTIP_BACKGROUND_COLOR;
  ctx.beginPath();
  ctx.roundRect(
    tooltipPosition.x - tooltipWidth / 2,
    tooltipPosition.y - tooltipHeight - 10,
    tooltipWidth,
    tooltipHeight,
    6
  );
  ctx.fill();
  
  ctx.strokeStyle = TOOLTIP_BORDER_COLOR;
  ctx.lineWidth = 1;
  ctx.stroke();
  
  ctx.fillStyle = TOOLTIP_TEXT_COLOR;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, tooltipPosition.x, tooltipPosition.y - tooltipHeight / 2 - 10);
}

export function drawMeasurementPreview(
  ctx: CanvasRenderingContext2D,
  drawStart: Point,
  currentPoint: Point,
  tool: Tool,
  scale: ScaleCalibration | null,
  unit: Unit,
  zoom: number,
  panOffset: Point
) {
  if (!scale || tool !== 'line') return;
  
  const pixelDist = distance(drawStart, currentPoint);
  const realDist = (pixelDist / scale.pixelDistance) * scale.realWorldDistance;
  const convertedDist = unit === scale.unit ? realDist : 
    (unit === 'meters' ? realDist * 0.3048 : realDist / 0.3048);
  drawMeasurementLabel(ctx, currentPoint, formatMeasurement(convertedDist, unit), zoom, panOffset);
}

export function drawRectanglePreview(
  ctx: CanvasRenderingContext2D,
  drawStart: Point,
  currentPoint: Point,
  scale: ScaleCalibration | null,
  unit: Unit,
  zoom: number,
  panOffset: Point
) {
  if (!scale) return;
  
  const pixelWidth = Math.abs(currentPoint.x - drawStart.x);
  const pixelHeight = Math.abs(currentPoint.y - drawStart.y);
  const width = (pixelWidth / scale.pixelDistance) * scale.realWorldDistance;
  const height = (pixelHeight / scale.pixelDistance) * scale.realWorldDistance;
  const convertedWidth = unit === scale.unit ? width : 
    (unit === 'meters' ? width * 0.3048 : width / 0.3048);
  const convertedHeight = unit === scale.unit ? height : 
    (unit === 'meters' ? height * 0.3048 : height / 0.3048);
  
  const label = `${convertedWidth.toFixed(2)} × ${convertedHeight.toFixed(2)} ${unit}`;
  drawMeasurementLabel(ctx, currentPoint, label, zoom, panOffset);
}

