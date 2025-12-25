import { useState } from 'react';
import type { Point, ScaleCalibration, Unit } from '../../types';
import { distance } from '../../utils/geometry';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ScaleDialogProps {
  isOpen: boolean;
  line: { start: Point; end: Point } | null;
  onClose: () => void;
  onScaleSet: (scale: ScaleCalibration) => void;
}

export default function ScaleDialog({ isOpen, line, onClose, onScaleSet }: ScaleDialogProps) {
  const [realDistance, setRealDistance] = useState('');
  const [unit, setUnit] = useState<Unit>('feet');

  if (!line) return null;

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Set Scale</DialogTitle>
          <DialogDescription>
            You've drawn a line on the image. Enter the real-world length of this line.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="distance">Real-world distance:</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  id="distance"
                  value={realDistance}
                  onChange={(e) => setRealDistance(e.target.value)}
                  placeholder="e.g., 50"
                  step="0.01"
                  min="0"
                  autoFocus
                  required
                  className="flex-1"
                />
                <Select value={unit} onValueChange={(value) => setUnit(value as Unit)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feet">feet</SelectItem>
                    <SelectItem value="meters">meters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Set Scale
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

