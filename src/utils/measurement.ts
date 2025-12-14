import type { Shape, ScaleCalibration, Measurement, Unit } from '../types';
import { distance, polygonArea, polygonPerimeter, rectangleArea, rectangleDimensions, getRectangleCorners } from './geometry';
import { pixelsToRealWorld, formatMeasurement, formatArea } from './units';

/**
 * Calculate measurements for a shape based on scale calibration
 */
export function calculateMeasurements(
  shape: Shape,
  scale: ScaleCalibration | null,
  targetUnit: Unit
): Measurement | null {
  if (!scale) return null;

  const { pixelDistance, realWorldDistance, unit: scaleUnit } = scale;

  switch (shape.type) {
    case 'line': {
      const pixelLength = distance(shape.start, shape.end);
      const realLength = pixelsToRealWorld(pixelLength, pixelDistance, realWorldDistance, scaleUnit, targetUnit);
      return {
        length: realLength,
        unit: targetUnit
      };
    }

    case 'rectangle': {
      const { width: pixelWidth, height: pixelHeight } = rectangleDimensions(shape.topLeft, shape.bottomRight);
      const width = pixelsToRealWorld(pixelWidth, pixelDistance, realWorldDistance, scaleUnit, targetUnit);
      const height = pixelsToRealWorld(pixelHeight, pixelDistance, realWorldDistance, scaleUnit, targetUnit);
      const area = width * height;

      return {
        width,
        height,
        area,
        perimeter: 2 * (width + height),
        unit: targetUnit
      };
    }

    case 'polygon': {
      if (!shape.closed || shape.points.length < 3) {
        // For unclosed or incomplete polygons, just show perimeter
        const pixelPerimeter = polygonPerimeter(shape.points);
        const perimeter = pixelsToRealWorld(pixelPerimeter, pixelDistance, realWorldDistance, scaleUnit, targetUnit);
        return {
          perimeter,
          unit: targetUnit
        };
      }

      const pixelArea = polygonArea(shape.points);
      const pixelPerimeter = polygonPerimeter(shape.points);
      
      // For area, we need to convert using squared scale
      const scaleFactor = realWorldDistance / pixelDistance;
      const areaScaleFactor = scaleFactor * scaleFactor;
      
      // Convert area from pixel² to real units²
      let realArea = pixelArea * areaScaleFactor;
      
      // If we need to convert units for area, square the conversion factor
      if (scaleUnit !== targetUnit) {
        const linearConversion = targetUnit === 'meters' ? 0.3048 : (1 / 0.3048);
        const areaConversion = linearConversion * linearConversion;
        realArea = realArea * areaConversion;
      }

      const perimeter = pixelsToRealWorld(pixelPerimeter, pixelDistance, realWorldDistance, scaleUnit, targetUnit);

      return {
        area: realArea,
        perimeter,
        unit: targetUnit
      };
    }

    default:
      return null;
  }
}

/**
 * Format measurements for display
 */
export function formatMeasurementDisplay(measurement: Measurement | null): string {
  if (!measurement) return 'Scale not calibrated';

  const parts: string[] = [];

  if (measurement.length !== undefined) {
    parts.push(`Length: ${formatMeasurement(measurement.length, measurement.unit)}`);
  }

  if (measurement.width !== undefined && measurement.height !== undefined) {
    parts.push(`${formatMeasurement(measurement.width, measurement.unit)} × ${formatMeasurement(measurement.height, measurement.unit)}`);
  }

  if (measurement.area !== undefined) {
    parts.push(`Area: ${formatArea(measurement.area, measurement.unit)}`);
  }

  if (measurement.perimeter !== undefined) {
    parts.push(`Perimeter: ${formatMeasurement(measurement.perimeter, measurement.unit)}`);
  }

  return parts.join(' | ');
}

