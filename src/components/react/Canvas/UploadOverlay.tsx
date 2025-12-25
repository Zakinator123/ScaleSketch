import { FolderUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface UploadOverlayProps {
  onUploadClick: () => void;
}

export default function UploadOverlay({ onUploadClick }: UploadOverlayProps) {
  return (
    <>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[5]">
        <Card className="text-center p-16 bg-card/80 backdrop-blur-sm border-dashed border-2 max-w-[500px] pointer-events-auto transition-all hover:scale-105">
          <CardContent className="p-0">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground mb-5 mx-auto">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <h2 className="text-2xl text-foreground mb-3">Drop file, paste, or click to upload</h2>
            <p className="text-sm text-muted-foreground mb-6">Supports images (JPG, PNG, GIF, WebP)</p>
            <Button onClick={onUploadClick} className="px-8">
              Choose File
            </Button>
          </CardContent>
        </Card>
      </div>
      <Button 
        variant="outline"
        className="absolute bottom-5 right-5 shadow-lg z-10"
        onClick={onUploadClick}
        title="Upload file"
      >
        <FolderUp size={16} />
        Upload
      </Button>
    </>
  );
}

