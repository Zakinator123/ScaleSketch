import { useState } from 'react';
import { Ruler, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import type { Shape } from '../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    <div className="flex-1 border-b border-border flex flex-col overflow-hidden">
      <div className="flex justify-between items-center px-5 pt-5 pb-3 border-b border-border">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Shapes ({shapes.length})</h3>
        <Button 
          variant={showSideLengths ? "default" : "outline"}
          size="sm"
          onClick={onToggleSideLengths}
          title="Toggle side lengths on polygons"
        >
          <Ruler size={16} />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-2">
        {shapes.length === 0 ? (
          <div className="py-10 px-5 text-center">
            <p className="text-sm text-muted-foreground my-1">No shapes yet</p>
            <p className="text-xs text-muted-foreground">Draw shapes on the canvas</p>
          </div>
        ) : (
          <div className="space-y-1">
            {shapes.map(shape => (
              <div
                key={shape.id}
                className={`flex items-center gap-2 p-2 bg-card border border-border rounded cursor-pointer transition-colors hover:bg-accent hover:border-accent-foreground/20 ${
                  shape.id === selectedShapeId ? 'bg-accent border-primary' : ''
                } ${shape.visible === false ? 'opacity-50' : ''}`}
                onClick={() => onShapeSelect(shape.id)}
              >
                <span className="text-xl w-6 text-center" style={{ color: shape.color }}>
                  {getShapeIcon(shape.type)}
                </span>
                
                <div className="flex-1 min-w-0">
                  {editingLabelId === shape.id ? (
                    <Input
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
                      className="h-7 text-sm"
                    />
                  ) : (
                    <span className="text-sm text-foreground whitespace-nowrap overflow-hidden text-ellipsis block">{getShapeLabel(shape)}</span>
                  )}
                </div>

                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent"
                    onClick={() => onShapeVisibilityChange(shape.id, shape.visible !== false ? false : true)}
                    title={shape.visible !== false ? "Hide shape" : "Show shape"}
                  >
                    {shape.visible !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                  </Button>
                  {editingLabelId !== shape.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent"
                      onClick={() => handleLabelEdit(shape)}
                      title="Edit label"
                    >
                      <Pencil size={16} />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onShapeDelete(shape.id)}
                    title="Delete shape"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

