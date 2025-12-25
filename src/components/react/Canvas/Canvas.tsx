import { useRef, useEffect, useCallback } from "react";
import { useAppContext } from "../../../contexts/AppContext";
import { createPolygon } from "../../../utils/shapeFactory";
import type { DocumentSource } from "../../../types";
import { useCanvas } from "../../../hooks/useCanvas";
import { useDrawing } from "../../../hooks/useDrawing";
import { useShapeInteraction } from "../../../hooks/useShapeInteraction";
import { useFileUpload } from "../../../hooks/useFileUpload";
import UploadOverlay from "./UploadOverlay";
import {
  drawShape,
  drawScaleCalibrationLine,
  drawDrawingPreview,
  drawPolygonPreview,
  drawTooltip,
  drawMeasurementPreview,
  drawRectanglePreview,
} from "../../../utils/canvasRenderer";
import { pointNearVertex } from "../../../utils/geometry";
import { POLYGON_CLOSE_THRESHOLD } from "../../../constants";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    document,
    shapes,
    activeTool,
    scale,
    currentUnit,
    selectedShapeId,
    setShapes,
    setSelectedShapeId,
    onScaleDialogOpen,
    currentColor,
    currentOpacity,
    currentStrokeWidth,
    showSideLengths,
    onCancelDrawing,
  } = useAppContext();

  const image = document?.type === "image" ? document.data : null;

  const {
    panOffset,
    zoom,
    isPanning,
    getCanvasPoint,
    handleWheel,
    startPan,
    updatePan,
    stopPan,
    fitToImage,
  } = useCanvas(canvasRef);

  const {
    isDrawing,
    drawStart,
    currentPoint,
    polygonPoints,
    tooltipPosition,
    showTooltip,
    startDrawing,
    updateDrawing,
    finishDrawing,
    addPolygonPoint,
    closePolygon,
    cancelDrawing,
  } = useDrawing({
    activeTool,
    currentColor,
    currentOpacity,
    currentStrokeWidth,
    onShapesChange: setShapes,
    shapes,
    onScaleDialogOpen,
    onCancelDrawing,
  });

  const {
    handleMouseDown: handleInteractionMouseDown,
    handleMouseMove: handleInteractionMouseMove,
    handleMouseUp: handleInteractionMouseUp,
  } = useShapeInteraction({
    shapes,
    selectedShapeId,
    zoom,
    onShapesChange: setShapes,
    onShapeSelect: setSelectedShapeId,
  });

  const handleDocumentLoad = useCallback((doc: DocumentSource) => {
    const event = new CustomEvent("documentLoad", { detail: doc });
    window.dispatchEvent(event);
  }, []);

  const {
    isDraggingFile,
    fileInputRef,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleUploadClick,
  } = useFileUpload({
    onDocumentLoad: handleDocumentLoad,
    document,
  });

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);

    if (image) {
      ctx.drawImage(image, 0, 0);
    }

    if (scale && activeTool === "scale") {
      drawScaleCalibrationLine(ctx, scale, zoom);
    }

    shapes.forEach((shape) => {
      if (shape.visible !== false) {
        drawShape(
          ctx,
          shape,
          scale,
          currentUnit,
          zoom,
          showSideLengths,
          shape.id === selectedShapeId,
          panOffset
        );
      }
    });

    if (isDrawing && drawStart && currentPoint) {
      if (activeTool === "line" || activeTool === "scale") {
        drawDrawingPreview(
          ctx,
          activeTool,
          drawStart,
          currentPoint,
          currentColor,
          currentStrokeWidth,
          zoom
        );
        if (scale && activeTool === "line") {
          drawMeasurementPreview(
            ctx,
            drawStart,
            currentPoint,
            activeTool,
            scale,
            currentUnit,
            zoom,
            panOffset
          );
        }
      } else if (activeTool === "rectangle") {
        drawDrawingPreview(
          ctx,
          activeTool,
          drawStart,
          currentPoint,
          currentColor,
          currentStrokeWidth,
          zoom
        );
        if (scale) {
          drawRectanglePreview(
            ctx,
            drawStart,
            currentPoint,
            scale,
            currentUnit,
            zoom,
            panOffset
          );
        }
      }
    }

    if (activeTool === "polygon" && polygonPoints.length > 0) {
      drawPolygonPreview(
        ctx,
        polygonPoints,
        currentPoint,
        currentColor,
        currentStrokeWidth,
        zoom,
        panOffset,
        scale,
        currentUnit,
        showSideLengths
      );
    }

    if (
      showTooltip &&
      tooltipPosition &&
      (activeTool === "scale" ||
        activeTool === "line" ||
        activeTool === "rectangle")
    ) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      drawTooltip(ctx, tooltipPosition, activeTool);
      ctx.restore();
    }

    ctx.restore();
  }, [
    image,
    shapes,
    scale,
    activeTool,
    currentUnit,
    panOffset,
    zoom,
    isDrawing,
    drawStart,
    currentPoint,
    polygonPoints,
    currentColor,
    currentStrokeWidth,
    selectedShapeId,
    showSideLengths,
    showTooltip,
    tooltipPosition,
  ]);

  useEffect(() => {
    render();
  }, [render]);

  useEffect(() => {
    fitToImage(image);
  }, [image, fitToImage]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);

    if (
      activeTool === "pan" ||
      e.button === 1 ||
      (e.button === 0 && e.ctrlKey)
    ) {
      startPan(e);
      return;
    }

    if (activeTool === "select") {
      const result = handleInteractionMouseDown(point);
      if (result.type !== "none") {
        return;
      }
    }

    if (
      activeTool === "scale" ||
      activeTool === "line" ||
      activeTool === "rectangle"
    ) {
      const canvas = canvasRef.current;
      const screenPosition = canvas
        ? {
            x: e.clientX - canvas.getBoundingClientRect().left,
            y: e.clientY - canvas.getBoundingClientRect().top,
          }
        : undefined;
      startDrawing(point, screenPosition);
    } else if (activeTool === "polygon") {
      if (polygonPoints.length >= 3) {
        const firstPoint = polygonPoints[0];
        if (
          pointNearVertex(point, firstPoint, POLYGON_CLOSE_THRESHOLD / zoom)
        ) {
          closePolygon();
          return;
        }
      }
      addPolygonPoint(point);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);

    if (isPanning) {
      updatePan(e);
      return;
    }

    handleInteractionMouseMove(point);

    const canvas = canvasRef.current;
    const screenPosition = canvas
      ? {
          x: e.clientX - canvas.getBoundingClientRect().left,
          y: e.clientY - canvas.getBoundingClientRect().top,
        }
      : undefined;
    updateDrawing(point, screenPosition);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      stopPan();
      return;
    }

    handleInteractionMouseUp();

    const point = getCanvasPoint(e);
    finishDrawing(point);
  };

  const handleDoubleClick = () => {
    if (activeTool === "polygon" && polygonPoints.length >= 3) {
      const pointsToUse =
        polygonPoints.slice(0, -1).length >= 3
          ? polygonPoints.slice(0, -1)
          : polygonPoints;

      const newPolygon = createPolygon(
        Date.now().toString(),
        pointsToUse,
        currentColor,
        currentOpacity,
        currentStrokeWidth
      );
      setShapes([...shapes, newPolygon]);
      cancelDrawing();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isDrawing || polygonPoints.length > 0) {
          cancelDrawing();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawing, polygonPoints.length, cancelDrawing]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative ${
        !document 
          ? "bg-[linear-gradient(90deg,rgba(58,123,200,0.05)_1px,transparent_1px),linear-gradient(rgba(58,123,200,0.05)_1px,transparent_1px)] bg-[length:40px_40px] bg-[-1px_-1px]" 
          : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDraggingFile && (
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(58,123,200,0.15)_1px,transparent_1px),linear-gradient(rgba(58,123,200,0.15)_1px,transparent_1px)] bg-[length:40px_40px] bg-[-1px_-1px] pointer-events-none z-10">
          <div className="absolute inset-5 border-[3px] border-dashed border-primary rounded-lg animate-pulse" />
        </div>
      )}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        style={{
          cursor: activeTool === "pan" || isPanning ? "grab" : "crosshair",
          width: "100%",
          height: "100%",
        }}
      />

      {!document && (
        <>
          <UploadOverlay onUploadClick={handleUploadClick} />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
        </>
      )}
    </div>
  );
}
