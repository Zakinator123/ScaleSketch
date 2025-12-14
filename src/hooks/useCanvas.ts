import { useState, useCallback, useEffect, useRef } from 'react';
import type { Point } from '../types';
import { screenToCanvas } from '../utils/geometry';
import { MIN_ZOOM, MAX_ZOOM, ZOOM_FACTOR } from '../constants';

export function useCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point | null>(null);

  const getCanvasPoint = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const screenPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    return screenToCanvas(screenPoint, panOffset, zoom);
  }, [panOffset, zoom]);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? (1 - ZOOM_FACTOR) : (1 + ZOOM_FACTOR);
    setZoom(prev => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev * zoomFactor)));
  }, []);

  const startPan = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  }, [panOffset]);

  const updatePan = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning && panStart) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  }, [isPanning, panStart]);

  const stopPan = useCallback(() => {
    setIsPanning(false);
    setPanStart(null);
  }, []);

  const fitToImage = useCallback((image: HTMLImageElement | null) => {
    if (image && canvasRef.current) {
      const canvas = canvasRef.current;
      const scaleX = canvas.width / image.width;
      const scaleY = canvas.height / image.height;
      const scale = Math.min(scaleX, scaleY) * 0.9;
      
      setZoom(scale);
      setPanOffset({
        x: (canvas.width - image.width * scale) / 2,
        y: (canvas.height - image.height * scale) / 2
      });
    }
  }, [canvasRef]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }
  }, [canvasRef]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  return {
    panOffset,
    zoom,
    isPanning,
    setPanOffset,
    setZoom,
    getCanvasPoint,
    handleWheel,
    startPan,
    updatePan,
    stopPan,
    fitToImage,
    resizeCanvas
  };
}

