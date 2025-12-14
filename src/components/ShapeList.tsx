import { useState } from 'react';
import { Ruler, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import type { Shape } from '../types';

interface ShapeListProps {
  shapes: Shape[];
  selectedShapeId: string | null;
  onShapeSelect: (shapeId: string) => void;
  onShapeDelete: (shapeId: string) => void;
  onShapeLabelChange: (shapeId: string, label: string) => void;
  onShapeVisibilityChange: (shapeId: string, visible: boolean) => void;
  showSideLengths: boolean;
  onToggleSideLengths: () => void;
}

export default function ShapeList({
  shapes,
  selectedShapeId,
  onShapeSelect,
  onShapeDelete,
  onShapeLabelChange,
  onShapeVisibilityChange,
  showSideLengths,
  onToggleSideLengths
}: ShapeListProps) {
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [labelInput, setLabelInput] = useState('');

  const getShapeIcon = (type: string) => {
    switch (type) {
      case 'line': return '╱';
      case 'rectangle': return '▭';
      case 'polygon': return '⬡';
      default: return '○';
    }
  };

  const getShapeLabel = (shape: Shape) => {
    if (shape.label) return shape.label;
    return `${shape.type.charAt(0).toUpperCase() + shape.type.slice(1)} ${shape.id.slice(-4)}`;
  };

  const handleLabelEdit = (shape: Shape) => {
    setEditingLabelId(shape.id);
    setLabelInput(shape.label || '');
  };

  const handleLabelSave = (shapeId: string) => {
    onShapeLabelChange(shapeId, labelInput);
    setEditingLabelId(null);
  };

  const handleLabelCancel = () => {
    setEditingLabelId(null);
    setLabelInput('');
  };

  return (
    <div className="shape-list">
      <div className="shape-list-header">
        <h3>Shapes ({shapes.length})</h3>
        <button 
          className={`toggle-button ${showSideLengths ? 'active' : ''}`}
          onClick={onToggleSideLengths}
          title="Toggle side lengths on polygons"
        >
          <Ruler size={16} />
        </button>
      </div>

      <div className="shape-items">
        {shapes.length === 0 ? (
          <div className="empty-state">
            <p>No shapes yet</p>
            <p className="hint">Draw shapes on the canvas</p>
          </div>
        ) : (
          shapes.map(shape => (
            <div
              key={shape.id}
              className={`shape-item ${shape.id === selectedShapeId ? 'selected' : ''} ${shape.visible === false ? 'hidden' : ''}`}
              onClick={() => onShapeSelect(shape.id)}
            >
              <span className="shape-icon" style={{ color: shape.color }}>
                {getShapeIcon(shape.type)}
              </span>
              
              <div className="shape-info">
                {editingLabelId === shape.id ? (
                  <input
                    type="text"
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    onBlur={() => handleLabelSave(shape.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleLabelSave(shape.id);
                      if (e.key === 'Escape') handleLabelCancel();
                    }}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                    className="label-input"
                  />
                ) : (
                  <span className="shape-label">{getShapeLabel(shape)}</span>
                )}
              </div>

              <div className="shape-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  className="action-button visibility"
                  onClick={() => onShapeVisibilityChange(shape.id, shape.visible !== false ? false : true)}
                  title={shape.visible !== false ? "Hide shape" : "Show shape"}
                >
                  {shape.visible !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                {editingLabelId !== shape.id && (
                  <button
                    className="action-button"
                    onClick={() => handleLabelEdit(shape)}
                    title="Edit label"
                  >
                    <Pencil size={16} />
                  </button>
                )}
                <button
                  className="action-button delete"
                  onClick={() => onShapeDelete(shape.id)}
                  title="Delete shape"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

