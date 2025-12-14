import type { Unit } from '../types';

const FEET_TO_METERS = 0.3048;
const METERS_TO_FEET = 1 / FEET_TO_METERS;

/**
 * Convert a value from one unit to another
 */
export function convertUnits(value: number, fromUnit: Unit, toUnit: Unit): number {
  if (fromUnit === toUnit) return value;
  
  if (fromUnit === 'feet' && toUnit === 'meters') {
    return value * FEET_TO_METERS;
  } else if (fromUnit === 'meters' && toUnit === 'feet') {
    return value * METERS_TO_FEET;
  }
  
  return value;
}

/**
 * Convert pixel distance to real-world distance using scale calibration
 */
export function pixelsToRealWorld(
  pixelDistance: number,
  scalePixels: number,
  scaleRealWorld: number,
  scaleUnit: Unit,
  targetUnit: Unit
): number {
  // Calculate real-world distance in the scale's unit
  const realWorldDistance = (pixelDistance / scalePixels) * scaleRealWorld;
  
  // Convert to target unit if different
  return convertUnits(realWorldDistance, scaleUnit, targetUnit);
}

/**
 * Format a measurement value with appropriate precision and unit
 */
export function formatMeasurement(value: number, unit: Unit, decimals: number = 2): string {
  return `${value.toFixed(decimals)} ${unit}`;
}

/**
 * Format area measurement with appropriate precision and unit
 */
export function formatArea(value: number, unit: Unit, decimals: number = 2): string {
  const unitSquared = unit === 'feet' ? 'ft²' : 'm²';
  return `${value.toFixed(decimals)} ${unitSquared}`;
}

/**
 * Get the appropriate number of decimal places based on the magnitude of the value
 */
export function getAppropriateDecimals(value: number): number {
  if (value < 1) return 3;
  if (value < 10) return 2;
  if (value < 100) return 1;
  return 0;
}

