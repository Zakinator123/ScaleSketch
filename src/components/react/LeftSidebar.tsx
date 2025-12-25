import React from 'react';
import { Ruler, Undo2, Redo2, Lightbulb, RotateCcw, Trash2 } from 'lucide-react';
import type { Tool, Unit } from '../../types';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface LeftSidebarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  currentUnit: Unit;
  onUnitChange: (unit: Unit) => void;
  currentColor: string;
  onColorChange: (color: string) => void;
  currentOpacity: number;
  onOpacityChange: (opacity: number) => void;
  currentStrokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  scaleSet: boolean;
  onDeleteSelected: () => void;
  hasSelection: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onResetScale: () => void;
}

export default function LeftSidebar({
  activeTool,
  onToolChange,
  currentUnit,
  onUnitChange,
  currentColor,
  onColorChange,
  currentOpacity,
  onOpacityChange,
  currentStrokeWidth,
  onStrokeWidthChange,
  scaleSet,
  onDeleteSelected,
  hasSelection,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onResetScale
}: LeftSidebarProps) {
  const tools: { id: Tool; label: string; icon: string | React.ReactNode; disabled?: boolean }[] = [
    { id: 'select', label: 'Select', icon: '⌖' },
    { id: 'scale', label: 'Set Scale', icon: <Ruler size={18} /> },
    { id: 'line', label: 'Line', icon: '╱' },
    { id: 'rectangle', label: 'Rectangle', icon: '▭' },
    { id: 'polygon', label: 'Polygon', icon: '⬡' },
    { id: 'pan', label: 'Pan', icon: '✋' }
  ];

  return (
    <div className="w-60 bg-card border-r border-border p-3 overflow-y-auto overflow-x-hidden flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">History</h3>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Cmd/Ctrl+Z)"
            className="flex-1"
          >
            <Undo2 size={16} />
            Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Cmd/Ctrl+Shift+Z)"
            className="flex-1"
          >
            <Redo2 size={16} />
            Redo
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Tools</h3>
        <div className="flex flex-col gap-1">
          {tools.map(tool => (
            <Button
              key={tool.id}
              variant={activeTool === tool.id ? "default" : "ghost"}
              size="sm"
              onClick={() => !tool.disabled && onToolChange(tool.id)}
              title={tool.label}
              disabled={tool.disabled}
              className={`w-full justify-start ${
                activeTool === tool.id 
                  ? "bg-primary text-primary-foreground shadow-md font-semibold" 
                  : ""
              }`}
            >
              <span className="text-base w-5 text-center">{typeof tool.icon === 'string' ? tool.icon : tool.icon}</span>
              <span className="flex-1">{tool.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {!scaleSet ? (
        <Card className="bg-primary/10 border-primary/30">
          <CardContent className="p-2">
            <p className="text-xs text-primary/90 m-0 flex items-center gap-1">
              <Lightbulb size={16} />
              Set scale to see measurements
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={onResetScale}
            title="Reset scale calibration"
            className="w-full"
          >
            <RotateCcw size={16} />
            Reset Scale
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Units</h3>
        <ToggleGroup 
          type="single" 
          value={currentUnit} 
          onValueChange={(value) => value && onUnitChange(value as Unit)}
          className="w-full"
        >
          <ToggleGroupItem value="feet" className="flex-1">Feet</ToggleGroupItem>
          <ToggleGroupItem value="meters" className="flex-1">Meters</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Style</h3>
        
        <div className="flex items-center gap-2 py-1">
          <Label className="text-xs text-muted-foreground min-w-[60px]">Color</Label>
          <input
            type="color"
            value={currentColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-10 h-6 border border-input rounded cursor-pointer bg-background"
          />
        </div>

        <div className="flex items-center gap-2 py-1">
          <Label className="text-xs text-muted-foreground min-w-[60px]">Fill Opacity</Label>
          <Slider
            min={0}
            max={1}
            step={0.1}
            value={[currentOpacity]}
            onValueChange={(values) => onOpacityChange(values[0])}
            className="flex-1"
          />
          <span className="text-[10px] text-muted-foreground min-w-[35px] text-right">{Math.round(currentOpacity * 100)}%</span>
        </div>

        <div className="flex items-center gap-2 py-1">
          <Label className="text-xs text-muted-foreground min-w-[60px]">Line Width</Label>
          <Slider
            min={1}
            max={10}
            step={1}
            value={[currentStrokeWidth]}
            onValueChange={(values) => onStrokeWidthChange(values[0])}
            className="flex-1"
          />
          <span className="text-[10px] text-muted-foreground min-w-[35px] text-right">{currentStrokeWidth}px</span>
        </div>
      </div>

      {hasSelection && (
        <div className="flex flex-col gap-2">
          <Button 
            variant="destructive" 
            size="sm"
            onClick={onDeleteSelected}
            className="w-full"
          >
            <Trash2 size={16} />
            Delete Selected
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-2 mt-auto pt-3 border-t border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Tips</h3>
        <ul className="list-none p-0 m-0">
          <li className="text-[10px] text-muted-foreground py-0.5 leading-snug"><strong className="text-muted-foreground">Pan:</strong> Ctrl+Drag or Middle Click</li>
          <li className="text-[10px] text-muted-foreground py-0.5 leading-snug"><strong className="text-muted-foreground">Zoom:</strong> Mouse Wheel</li>
          <li className="text-[10px] text-muted-foreground py-0.5 leading-snug"><strong className="text-muted-foreground">Polygon:</strong> Double-click to finish</li>
          <li className="text-[10px] text-muted-foreground py-0.5 leading-snug"><strong className="text-muted-foreground">Edit:</strong> Select and drag vertices</li>
        </ul>
      </div>
    </div>
  );
}

