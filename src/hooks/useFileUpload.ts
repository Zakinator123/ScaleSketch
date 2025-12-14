import { useState, useCallback, useRef } from 'react';
import type { DocumentSource } from '../types';
import { processFile } from '../utils/fileHandler';

interface UseFileUploadOptions {
  onDocumentLoad: (doc: DocumentSource) => void;
  document: DocumentSource | null;
}

export function useFileUpload({ onDocumentLoad, document }: UseFileUploadOptions) {
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const doc = await processFile(file);
        onDocumentLoad(doc);
      } catch (error) {
        console.error('Error loading document:', error);
        alert(error instanceof Error ? error.message : 'Failed to load file');
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onDocumentLoad]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!document) {
      setIsDraggingFile(true);
    }
  }, [document]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      try {
        const doc = await processFile(file);
        onDocumentLoad(doc);
      } catch (error) {
        console.error('Error loading document:', error);
        alert(error instanceof Error ? error.message : 'Failed to load file');
      }
    }
  }, [onDocumentLoad]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    isDraggingFile,
    fileInputRef,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleUploadClick
  };
}

