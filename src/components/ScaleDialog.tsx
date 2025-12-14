import { useState } from 'react';
import type { Point, ScaleCalibration, Unit } from '../types';
import { distance } from '../utils/geometry';

interface ScaleDialogProps {
  isOpen: boolean;
  line: { start: Point; end: Point } | null;
  onClose: () => void;
  onScaleSet: (scale: ScaleCalibration) => void;
}

export default function ScaleDialog({ isOpen, line, onClose, onScaleSet }: ScaleDialogProps) {
  const [realDistance, setRealDistance] = useState('');
  const [unit, setUnit] = useState<Unit>('feet');

  if (!isOpen || !line) return null;

  const pixelDistance = distance(line.start, line.end);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const realValue = parseFloat(realDistance);
    if (isNaN(realValue) || realValue <= 0) {
      alert('Please enter a valid distance');
      return;
    }

    const scale: ScaleCalibration = {
      pixelDistance,
      realWorldDistance: realValue,
      unit,
      calibrationLine: line
    };

    onScaleSet(scale);
    setRealDistance('');
    onClose();
  };

  const handleCancel = () => {
    setRealDistance('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Set Scale</h2>
        <p>You've drawn a line on the image. Enter the real-world length of this line.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="distance">Real-world distance:</label>
            <div className="input-with-unit">
              <input
                type="number"
                id="distance"
                value={realDistance}
                onChange={(e) => setRealDistance(e.target.value)}
                placeholder="e.g., 50"
                step="0.01"
                min="0"
                autoFocus
                required
              />
              <select value={unit} onChange={(e) => setUnit(e.target.value as Unit)}>
                <option value="feet">feet</option>
                <option value="meters">meters</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={handleCancel} className="button-secondary">
              Cancel
            </button>
            <button type="submit" className="button-primary">
              Set Scale
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

