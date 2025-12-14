import { useState, useEffect } from 'react';
import { Ruler } from 'lucide-react';
import type { Shape, ScaleCalibration, Unit } from '../types';
import { calculateMeasurements } from '../utils/measurement';
import { formatMeasurement, formatArea } from '../utils/units';

interface ShapeAttributesProps {
  selectedShape: Shape | null;
  scale: ScaleCalibration | null;
  currentUnit: Unit;
  onAttributeChange: (shapeId: string, attributes: { color?: string; opacity?: number; strokeWidth?: number }) => void;
}

export default function ShapeAttributes({
  selectedShape,
  scale,
  currentUnit,
  onAttributeChange
}: ShapeAttributesProps) {
  const [localColor, setLocalColor] = useState(selectedShape?.color || '#3a7bc8');
  const [localOpacity, setLocalOpacity] = useState(selectedShape?.opacity ?? 0.5);
  const [localStrokeWidth, setLocalStrokeWidth] = useState(selectedShape?.strokeWidth ?? 2);

  useEffect(() => {
    if (selectedShape) {
      setLocalColor(selectedShape.color);
      setLocalOpacity(selectedShape.opacity);
      setLocalStrokeWidth(selectedShape.strokeWidth);
    }
  }, [selectedShape]);

  const handleColorChange = (color: string) => {
    if (selectedShape) {
      setLocalColor(color);
      onAttributeChange(selectedShape.id, { color });
    }
  };

  const handleOpacityChange = (opacity: number) => {
    if (selectedShape) {
      setLocalOpacity(opacity);
      onAttributeChange(selectedShape.id, { opacity });
    }
  };

  const handleStrokeWidthChange = (strokeWidth: number) => {
    if (selectedShape) {
      setLocalStrokeWidth(strokeWidth);
      onAttributeChange(selectedShape.id, { strokeWidth });
    }
  };

  if (!selectedShape) {
    return (
      <div className="shape-attributes">
        <h3>Shape Attributes</h3>
        <div className="no-selection">
          <p>Select a shape to edit attributes</p>
        </div>
      </div>
    );
  }

  const measurement = scale ? calculateMeasurements(selectedShape, scale, currentUnit) : null;

  return (
    <div className="shape-attributes">
      <h3>Shape Attributes</h3>
      
      <div className="shape-info">
        <div className="info-row">
          <span className="label">Type:</span>
          <span className="value">{selectedShape.type.charAt(0).toUpperCase() + selectedShape.type.slice(1)}</span>
        </div>
        <div className="info-row">
          <span className="label">ID:</span>
          <span className="value">{selectedShape.id}</span>
        </div>
      </div>

      {!scale && (
        <div className="info-message">
          <p><Ruler size={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Set scale to see measurements</p>
          <p className="hint">Use the Set Scale tool to calibrate</p>
        </div>
      )}

      {scale && measurement && (
        <div className="measurements">
          {measurement.length !== undefined && (
            <div className="measurement-row">
              <span className="label">Length:</span>
              <span className="value">{formatMeasurement(measurement.length, measurement.unit)}</span>
            </div>
          )}

          {measurement.width !== undefined && (
            <div className="measurement-row">
              <span className="label">Width:</span>
              <span className="value">{formatMeasurement(measurement.width, measurement.unit)}</span>
            </div>
          )}

          {measurement.height !== undefined && (
            <div className="measurement-row">
              <span className="label">Height:</span>
              <span className="value">{formatMeasurement(measurement.height, measurement.unit)}</span>
            </div>
          )}

          {measurement.perimeter !== undefined && (
            <div className="measurement-row">
              <span className="label">Perimeter:</span>
              <span className="value">{formatMeasurement(measurement.perimeter, measurement.unit)}</span>
            </div>
          )}

          {measurement.area !== undefined && (
            <div className="measurement-row highlight">
              <span className="label">Area:</span>
              <span className="value">{formatArea(measurement.area, measurement.unit)}</span>
            </div>
          )}
        </div>
      )}

      <div className="shape-style">
        <h4>Style</h4>
        <div className="style-controls">
          <div className="style-control">
            <label>Color</label>
            <div className="color-input-group">
              <input
                type="color"
                value={localColor}
                onChange={(e) => handleColorChange(e.target.value)}
              />
              <input
                type="text"
                value={localColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="color-text-input"
              />
            </div>
          </div>

          <div className="style-control">
            <label>Opacity</label>
            <div className="slider-input-group">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={localOpacity}
                onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
              />
              <span className="value">{Math.round(localOpacity * 100)}%</span>
            </div>
          </div>

          <div className="style-control">
            <label>Line Width</label>
            <div className="slider-input-group">
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={localStrokeWidth}
                onChange={(e) => handleStrokeWidthChange(parseInt(e.target.value))}
              />
              <span className="value">{localStrokeWidth}px</span>
            </div>
          </div>
        </div>
      </div>

      {selectedShape.type === 'polygon' && (
        <div className="shape-details">
          <h4>Details</h4>
          <div className="vertices-info">
            <p>Sides: {selectedShape.points.length}</p>
            <p>Vertices: {selectedShape.points.length}</p>
            <p>Status: {selectedShape.closed ? 'Closed' : 'Open'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
