import React from 'react';
import { Ruler, Undo2, Redo2, Lightbulb, RotateCcw, Trash2 } from 'lucide-react';
import type { Tool, Unit } from '../../types';

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
    <div className="left-sidebar">
      <div className="left-sidebar-section">
        <h3>History</h3>
        <div className="history-buttons">
          <button
            className={`history-button ${!canUndo ? 'disabled' : ''}`}
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Cmd/Ctrl+Z)"
          >
            <Undo2 size={16} />
            Undo
          </button>
          <button
            className={`history-button ${!canRedo ? 'disabled' : ''}`}
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Cmd/Ctrl+Shift+Z)"
          >
            <Redo2 size={16} />
            Redo
          </button>
        </div>
      </div>

      <div className="left-sidebar-section">
        <h3>Tools</h3>
        <div className="tool-buttons">
          {tools.map(tool => (
            <button
              key={tool.id}
              className={`tool-button ${activeTool === tool.id ? 'active' : ''} ${tool.disabled ? 'disabled' : ''}`}
              onClick={() => !tool.disabled && onToolChange(tool.id)}
              title={tool.label}
              disabled={tool.disabled}
            >
              <span className="tool-icon">{typeof tool.icon === 'string' ? tool.icon : tool.icon}</span>
              <span className="tool-label">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      {!scaleSet ? (
        <div className="left-sidebar-section scale-info">
          <p><Lightbulb size={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Set scale to see measurements</p>
        </div>
      ) : (
        <div className="left-sidebar-section">
          <button 
            className="reset-scale-button"
            onClick={onResetScale}
            title="Reset scale calibration"
          >
            <RotateCcw size={16} />
            Reset Scale
          </button>
        </div>
      )}

      <div className="left-sidebar-section">
        <h3>Units</h3>
        <div className="unit-toggle">
          <button
            className={`unit-button ${currentUnit === 'feet' ? 'active' : ''}`}
            onClick={() => onUnitChange('feet')}
          >
            Feet
          </button>
          <button
            className={`unit-button ${currentUnit === 'meters' ? 'active' : ''}`}
            onClick={() => onUnitChange('meters')}
          >
            Meters
          </button>
        </div>
      </div>

      <div className="left-sidebar-section">
        <h3>Style</h3>
        
        <div className="style-control">
          <label>Color</label>
          <input
            type="color"
            value={currentColor}
            onChange={(e) => onColorChange(e.target.value)}
          />
        </div>

        <div className="style-control">
          <label>Fill Opacity</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={currentOpacity}
            onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
          />
          <span className="value">{Math.round(currentOpacity * 100)}%</span>
        </div>

        <div className="style-control">
          <label>Line Width</label>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={currentStrokeWidth}
            onChange={(e) => onStrokeWidthChange(parseInt(e.target.value))}
          />
          <span className="value">{currentStrokeWidth}px</span>
        </div>
      </div>

      {hasSelection && (
        <div className="left-sidebar-section">
          <button className="delete-button" onClick={onDeleteSelected}>
            <Trash2 size={16} />
            Delete Selected
          </button>
        </div>
      )}

      <div className="left-sidebar-section help">
        <h3>Tips</h3>
        <ul>
          <li><strong>Pan:</strong> Ctrl+Drag or Middle Click</li>
          <li><strong>Zoom:</strong> Mouse Wheel</li>
          <li><strong>Polygon:</strong> Double-click to finish</li>
          <li><strong>Edit:</strong> Select and drag vertices</li>
        </ul>
      </div>
    </div>
  );
}

