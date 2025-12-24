---
title: Understanding Measurements
description: How ScaleSketch calculates area, perimeter, and other measurements
order: 2
published: true
---

## How Measurements Work

ScaleSketch uses your scale calibration to convert pixel distances into real-world measurements.

## Scale Calibration

The scale is the foundation of all measurements:

1. **Draw a reference line** on a known distance
2. **Enter the real-world distance** (e.g., 10 feet)
3. **ScaleSketch calculates** pixels per unit

Formula: `scale = pixelDistance / realWorldDistance`

## Measurement Types

### Lines

- **Length**: Direct distance between two points
- Displayed in feet or meters based on your unit selection

### Rectangles

- **Width**: Horizontal dimension
- **Height**: Vertical dimension
- **Area**: Width × Height
- **Perimeter**: 2 × (Width + Height)

### Polygons

- **Area**: Calculated using the Shoelace formula (works for any polygon shape)
- **Perimeter**: Sum of all side lengths
- **Side Lengths**: Individual measurements for each edge (toggle in shape list)

## Unit Conversion

ScaleSketch supports two unit systems:

- **Feet** (ft, ft²)
- **Meters** (m, m²)

You can:
- Set the scale in one unit
- Display measurements in another unit
- ScaleSketch handles conversion automatically (1 meter = 3.28084 feet)

## Accuracy Tips

1. **Use a clear reference**: Choose a dimension that's clearly marked on your image
2. **Zoom in**: Get precise clicks by zooming in when setting scale
3. **Straight lines work best**: Use walls or other straight features for calibration
4. **Re-calibrate if needed**: Click "Reset Scale" to start over

## Measurement Display

Measurements are shown in multiple places:

- **On shapes**: Hover to see dimensions
- **Right panel**: Detailed measurements for selected shape
- **Shape list**: Quick reference for all shapes

## Precision

- Measurements are displayed to 2 decimal places
- Internal calculations use full precision
- Rounding only happens for display

## Common Use Cases

### Floor Plans

1. Set scale using a known wall length
2. Draw rooms as rectangles or polygons
3. Get instant square footage

### Blueprints

1. Use the scale bar on the blueprint
2. Measure individual components
3. Calculate total areas

### Site Plans

1. Calibrate using a known property line
2. Measure building footprints
3. Calculate lot coverage

## Limitations

- Measurements assume a flat, 2D surface
- Perspective distortion in photos will affect accuracy
- Best results with orthogonal (top-down) views
- Scale applies uniformly across the entire image

