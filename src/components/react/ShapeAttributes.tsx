import { Ruler } from 'lucide-react';
import type { Shape, ScaleCalibration, Unit } from '../../types';
import { calculateMeasurements } from '../../utils/measurement';
import { formatMeasurement, formatArea } from '../../utils/units';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

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
  // Use selectedShape properties directly instead of syncing state in useEffect
  const localColor = selectedShape?.color || '#3a7bc8';
  const localOpacity = selectedShape?.opacity ?? 0.5;
  const localStrokeWidth = selectedShape?.strokeWidth ?? 2;

  const handleColorChange = (color: string) => {
    if (selectedShape) {
      onAttributeChange(selectedShape.id, { color });
    }
  };

  const handleOpacityChange = (opacity: number) => {
    if (selectedShape) {
      onAttributeChange(selectedShape.id, { opacity });
    }
  };

  const handleStrokeWidthChange = (strokeWidth: number) => {
    if (selectedShape) {
      onAttributeChange(selectedShape.id, { strokeWidth });
    }
  };

  if (!selectedShape) {
    return (
      <div className="flex-0-auto max-h-[50%] bg-card p-4 overflow-y-auto flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground mb-1.5">Shape Attributes</h3>
        <div className="py-10 px-5 text-center">
          <p className="text-sm text-muted-foreground">Select a shape to edit attributes</p>
        </div>
      </div>
    );
  }

  const measurement = scale ? calculateMeasurements(selectedShape, scale, currentUnit) : null;

  return (
    <div className="flex-0-auto max-h-[50%] bg-card p-4 overflow-y-auto flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground mb-1.5">Shape Attributes</h3>
      
      <Card>
        <CardContent className="p-3">
          <div className="flex justify-between py-2 border-b border-border last:border-0">
            <span className="text-sm text-muted-foreground">Type:</span>
            <span className="text-sm text-foreground font-medium">{selectedShape.type.charAt(0).toUpperCase() + selectedShape.type.slice(1)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border last:border-0">
            <span className="text-sm text-muted-foreground">ID:</span>
            <span className="text-sm text-foreground font-medium">{selectedShape.id}</span>
          </div>
        </CardContent>
      </Card>

      {!scale && (
        <Card className="bg-primary/10 border-primary/30">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-primary/90 my-1 flex items-center justify-center gap-1">
              <Ruler size={16} />
              Set scale to see measurements
            </p>
            <p className="text-xs text-muted-foreground">Use the Set Scale tool to calibrate</p>
          </CardContent>
        </Card>
      )}

      {scale && measurement && (
        <Card>
          <CardContent className="p-3">
            {measurement.length !== undefined && (
              <div className="flex justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">Length:</span>
                <span className="text-sm text-foreground font-medium flex items-center gap-2">{formatMeasurement(measurement.length, measurement.unit)}</span>
              </div>
            )}

            {measurement.width !== undefined && (
              <div className="flex justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">Width:</span>
                <span className="text-sm text-foreground font-medium flex items-center gap-2">{formatMeasurement(measurement.width, measurement.unit)}</span>
              </div>
            )}

            {measurement.height !== undefined && (
              <div className="flex justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">Height:</span>
                <span className="text-sm text-foreground font-medium flex items-center gap-2">{formatMeasurement(measurement.height, measurement.unit)}</span>
              </div>
            )}

            {measurement.perimeter !== undefined && (
              <div className="flex justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">Perimeter:</span>
                <span className="text-sm text-foreground font-medium flex items-center gap-2">{formatMeasurement(measurement.perimeter, measurement.unit)}</span>
              </div>
            )}

            {measurement.area !== undefined && (
              <div className="flex justify-between py-3 px-2 -mx-2 rounded bg-primary/10 my-2">
                <span className="text-sm font-semibold text-primary">Area:</span>
                <span className="text-base font-semibold text-primary flex items-center gap-2">{formatArea(measurement.area, measurement.unit)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Style</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 flex flex-col gap-2">
          <div className="flex items-center gap-2 py-1">
            <Label className="text-xs text-muted-foreground min-w-[60px]">Color</Label>
            <div className="flex items-center gap-2 flex-1">
              <input
                type="color"
                value={localColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-10 h-6 border border-input rounded cursor-pointer bg-background"
              />
              <Input
                type="text"
                value={localColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="flex-1 text-xs font-mono h-7"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 py-1">
            <Label className="text-xs text-muted-foreground min-w-[60px]">Opacity</Label>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[localOpacity]}
              onValueChange={(values) => handleOpacityChange(values[0])}
              className="flex-1"
            />
            <span className="text-[10px] text-muted-foreground min-w-[35px] text-right">{Math.round(localOpacity * 100)}%</span>
          </div>

          <div className="flex items-center gap-2 py-1">
            <Label className="text-xs text-muted-foreground min-w-[60px]">Line Width</Label>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[localStrokeWidth]}
              onValueChange={(values) => handleStrokeWidthChange(values[0])}
              className="flex-1"
            />
            <span className="text-[10px] text-muted-foreground min-w-[35px] text-right">{localStrokeWidth}px</span>
          </div>
        </CardContent>
      </Card>

      {selectedShape.type === 'polygon' && (
        <Card>
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Details</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 flex flex-col gap-0">
            <p className="text-sm text-muted-foreground py-1">Sides: {selectedShape.points.length}</p>
            <p className="text-sm text-muted-foreground py-1">Vertices: {selectedShape.points.length}</p>
            <p className="text-sm text-muted-foreground py-1">Status: {selectedShape.closed ? 'Closed' : 'Open'}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
