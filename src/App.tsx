import { useState, useCallback, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Image as ImageIcon, Check } from "lucide-react";
import "./App.css";
import Canvas from "./components/react/Canvas/Canvas";
import LeftSidebar from "./components/react/LeftSidebar";
import ScaleDialog from "./components/react/ScaleDialog";
import ShapeAttributes from "./components/react/ShapeAttributes";
import ShapeList from "./components/react/ShapeList";
import { AppProvider, useAppContext } from "./contexts/AppContext";
import { useUndoRedo } from "./hooks/useUndoRedo";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { processFile } from "./utils/fileHandler";
import type {
  Shape,
  ScaleCalibration,
  Unit,
  Point,
  DocumentSource,
  Tool,
} from "./types";
import {
  DEFAULT_COLOR,
  DEFAULT_OPACITY,
  DEFAULT_STROKE_WIDTH,
  DEFAULT_UNIT,
  DEFAULT_TOOL,
} from "./constants";

function AppContent() {
  const {
    document,
    setDocument,
    shapes,
    setShapes,
    activeTool,
    setActiveTool,
    scale,
    setScale,
    currentUnit,
    setCurrentUnit,
    selectedShapeId,
    setSelectedShapeId,
    currentColor,
    setCurrentColor,
    currentOpacity,
    setCurrentOpacity,
    currentStrokeWidth,
    setCurrentStrokeWidth,
    showSideLengths,
    setShowSideLengths,
    scaleDialogOpen,
    setScaleDialogOpen,
    scaleDialogLine,
  } = useAppContext();

  const { undo, redo, canUndo, canRedo } = useUndoRedo<Shape[]>([]);

  // Sync undo/redo with shapes
  useEffect(() => {
    setShapes(shapes);
  }, [shapes, setShapes]);

  const handleDocumentLoad = useCallback(
    async (file: File) => {
      try {
        const doc = await processFile(file);
        setDocument(doc);
        setShapes([]);
        setScale(null);
        setSelectedShapeId(null);
        setActiveTool("select");
      } catch (error) {
        console.error("Error loading document:", error);
        alert(error instanceof Error ? error.message : "Failed to load file");
      }
    },
    [setShapes, setDocument, setScale, setSelectedShapeId, setActiveTool]
  );

  useEffect(() => {
    const handleDocumentLoadEvent = (e: CustomEvent<DocumentSource>) => {
      setDocument(e.detail);
      setShapes([]);
      setScale(null);
      setSelectedShapeId(null);
      setActiveTool("select");
    };
    window.addEventListener(
      "documentLoad",
      handleDocumentLoadEvent as EventListener
    );
    return () =>
      window.removeEventListener(
        "documentLoad",
        handleDocumentLoadEvent as EventListener
      );
  }, [setDocument, setShapes, setScale, setSelectedShapeId, setActiveTool]);

  useEffect(() => {
    const handleShapeSelectEvent = (e: CustomEvent<string | null>) => {
      setSelectedShapeId(e.detail);
    };
    window.addEventListener(
      "shapeSelect",
      handleShapeSelectEvent as EventListener
    );
    return () =>
      window.removeEventListener(
        "shapeSelect",
        handleShapeSelectEvent as EventListener
      );
  }, [setSelectedShapeId]);

  const handleResetScale = useCallback(() => {
    setScale(null);
    setActiveTool("select");
  }, [setScale, setActiveTool]);

  const handleScaleSet = useCallback(
    (newScale: ScaleCalibration) => {
      setScale(newScale);
      setActiveTool("select");
    },
    [setScale, setActiveTool]
  );

  const handleDeleteSelected = useCallback(() => {
    if (selectedShapeId) {
      setShapes((prev) => prev.filter((s) => s.id !== selectedShapeId));
      setSelectedShapeId(null);
    }
  }, [selectedShapeId, setShapes, setSelectedShapeId]);

  const handleShapeDelete = useCallback(
    (shapeId: string) => {
      setShapes((prev) => prev.filter((s) => s.id !== shapeId));
      if (selectedShapeId === shapeId) {
        setSelectedShapeId(null);
      }
    },
    [selectedShapeId, setShapes, setSelectedShapeId]
  );

  const handleShapeLabelChange = useCallback(
    (shapeId: string, label: string) => {
      setShapes((prev) =>
        prev.map((s) => (s.id === shapeId ? { ...s, label } : s))
      );
    },
    [setShapes]
  );

  const handleShapeVisibilityChange = useCallback(
    (shapeId: string, visible: boolean) => {
      setShapes((prev) =>
        prev.map((s) => (s.id === shapeId ? { ...s, visible } : s))
      );
    },
    [setShapes]
  );

  const handleShapeAttributeChange = useCallback(
    (
      shapeId: string,
      attributes: { color?: string; opacity?: number; strokeWidth?: number }
    ) => {
      setShapes((prev) =>
        prev.map((s) => (s.id === shapeId ? { ...s, ...attributes } : s))
      );
    },
    [setShapes]
  );

  const handleCancelDrawing = useCallback(() => {
    setActiveTool("select");
  }, [setActiveTool]);

  const selectedShape = shapes.find((s) => s.id === selectedShapeId) || null;

  useKeyboardShortcuts({
    selectedShapeId,
    onUndo: undo,
    onRedo: redo,
    onDeleteSelected: handleDeleteSelected,
    onCancelDrawing: handleCancelDrawing,
    setSelectedShapeId,
    setActiveTool,
  });

  // Paste handler for clipboard images
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const activeElement = window.document.activeElement;
      if (
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const blob = item.getAsFile();
          if (blob) {
            await handleDocumentLoad(blob);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleDocumentLoad]);

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff",
          },
          error: {
            style: {
              background: "#dc3545",
            },
          },
        }}
      />
      <LeftSidebar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        currentUnit={currentUnit}
        onUnitChange={setCurrentUnit}
        currentColor={currentColor}
        onColorChange={setCurrentColor}
        currentOpacity={currentOpacity}
        onOpacityChange={setCurrentOpacity}
        currentStrokeWidth={currentStrokeWidth}
        onStrokeWidthChange={setCurrentStrokeWidth}
        scaleSet={scale !== null}
        onDeleteSelected={handleDeleteSelected}
        hasSelection={selectedShapeId !== null}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onResetScale={handleResetScale}
      />

      <div className="canvas-container">
        <Canvas />

        {scale && (
          <div className="scale-indicator">
            <Check size={16} />
            Scale set: {scale.realWorldDistance} {scale.unit}
          </div>
        )}

        {document && (
          <button
            className="change-image-button"
            onClick={() => setDocument(null)}
            title="Change document"
          >
            <ImageIcon size={16} />
            Change Image
          </button>
        )}
      </div>

      <div className="right-sidebar">
        <ShapeList
          shapes={shapes}
          selectedShapeId={selectedShapeId}
          onShapeSelect={setSelectedShapeId}
          onShapeDelete={handleShapeDelete}
          onShapeLabelChange={handleShapeLabelChange}
          onShapeVisibilityChange={handleShapeVisibilityChange}
          showSideLengths={showSideLengths}
          onToggleSideLengths={() => setShowSideLengths(!showSideLengths)}
        />
        <ShapeAttributes
          selectedShape={selectedShape}
          scale={scale}
          currentUnit={currentUnit}
          onAttributeChange={handleShapeAttributeChange}
        />
      </div>

      <ScaleDialog
        isOpen={scaleDialogOpen}
        line={scaleDialogLine}
        onClose={() => setScaleDialogOpen(false)}
        onScaleSet={handleScaleSet}
      />
    </>
  );
}

function App() {
  const [document, setDocument] = useState<DocumentSource | null>(null);
  const { state: shapes, setState: setShapes } = useUndoRedo<Shape[]>([]);
  const [activeTool, setActiveTool] = useState<Tool>(DEFAULT_TOOL);
  const [scale, setScale] = useState<ScaleCalibration | null>(null);
  const [currentUnit, setCurrentUnit] = useState<Unit>(DEFAULT_UNIT);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState(DEFAULT_COLOR);
  const [currentOpacity, setCurrentOpacity] = useState(DEFAULT_OPACITY);
  const [currentStrokeWidth, setCurrentStrokeWidth] =
    useState(DEFAULT_STROKE_WIDTH);
  const [showSideLengths, setShowSideLengths] = useState(false);
  const [scaleDialogOpen, setScaleDialogOpen] = useState(false);
  const [scaleDialogLine, setScaleDialogLine] = useState<{
    start: Point;
    end: Point;
  } | null>(null);

  const handleScaleDialogOpen = useCallback(
    (line: { start: Point; end: Point }) => {
      setScaleDialogLine(line);
      setScaleDialogOpen(true);
    },
    [setScaleDialogLine, setScaleDialogOpen]
  );

  const handleCancelDrawing = useCallback(() => {
    setActiveTool("select");
  }, [setActiveTool]);

  const contextValue = {
    document,
    setDocument,
    shapes,
    setShapes,
    activeTool,
    setActiveTool,
    scale,
    setScale,
    currentUnit,
    setCurrentUnit,
    selectedShapeId,
    setSelectedShapeId,
    currentColor,
    setCurrentColor,
    currentOpacity,
    setCurrentOpacity,
    currentStrokeWidth,
    setCurrentStrokeWidth,
    showSideLengths,
    setShowSideLengths,
    scaleDialogOpen,
    setScaleDialogOpen,
    scaleDialogLine,
    setScaleDialogLine,
    onScaleDialogOpen: handleScaleDialogOpen,
    onCancelDrawing: handleCancelDrawing,
  };

  return (
    <div className="app">
      <AppProvider value={contextValue}>
        <AppContent />
      </AppProvider>
    </div>
  );
}

export default App;
