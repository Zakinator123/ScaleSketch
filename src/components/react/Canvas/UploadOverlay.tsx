import { FolderUp } from 'lucide-react';

interface UploadOverlayProps {
  onUploadClick: () => void;
}

export default function UploadOverlay({ onUploadClick }: UploadOverlayProps) {
  return (
    <>
      <div className="upload-overlay">
        <div className="upload-prompt">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <h2>Drop file, paste, or click to upload</h2>
          <p>Supports images (JPG, PNG, GIF, WebP)</p>
          <button className="upload-button" onClick={onUploadClick}>
            Choose File
          </button>
        </div>
      </div>
      <button 
        className="upload-button-corner"
        onClick={onUploadClick}
        title="Upload file"
      >
        <FolderUp size={16} />
        Upload
      </button>
    </>
  );
}

