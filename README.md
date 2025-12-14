# Measurement Tool

A React-based canvas application for uploading images and drawing precisely measured shapes with real-world measurements. Draw lines, rectangles, and polygons with accurate measurements calculated from a user-defined scale calibration.

## Quick Start

```bash
pnpm install
pnpm dev
```

Open `http://localhost:5173` in your browser.

## Features

- **Image Upload**: Drag-and-drop or click to upload images
- **Scale Calibration**: Draw a line on a known distance to set the measurement scale
- **Drawing Tools**: Line, Rectangle, and Polygon tools with real-time measurements
- **Shape Rotation**: Rotate rectangles and polygons after creation
- **Vertex Editing**: Drag individual vertices to resize/reshape
- **Measurements**: Real-time area and perimeter calculations in feet or meters
- **Undo/Redo**: Full history with Cmd/Ctrl+Z support
- **Shape Management**: Label, delete, and organize shapes in a list view

## Architecture Overview

```
src/
├── App.tsx                      # Main app wrapper with context provider
├── App.css                      # All application styles (dark theme)
├── index.css                    # Base/reset styles
├── main.tsx                     # React entry point
├── types/
│   └── index.ts                 # TypeScript interfaces for all data structures
├── contexts/
│   └── AppContext.tsx           # Shared state management via React Context
├── components/
│   ├── Canvas/
│   │   ├── Canvas.tsx           # Main drawing canvas orchestrator (~340 lines)
│   │   └── UploadOverlay.tsx    # Empty state upload UI
│   ├── Toolbar.tsx              # Left sidebar with tools and settings
│   ├── ShapeList.tsx            # Shape list with labels and delete
│   ├── MeasurementPanel.tsx     # Displays measurements for selected shape
│   └── ScaleDialog.tsx          # Modal for entering scale calibration
├── hooks/
│   ├── useCanvas.ts             # Pan/zoom/resize logic
│   ├── useDrawing.ts            # Drawing state and shape creation
│   ├── useShapeInteraction.ts   # Vertex dragging, rotation, selection
│   ├── useFileUpload.ts         # File handling (drag/drop, paste)
│   ├── useKeyboardShortcuts.ts  # Keyboard event handling
│   └── useUndoRedo.ts           # Undo/redo state management
├── utils/
│   ├── canvasRenderer.ts        # All drawing functions (shapes, labels, tooltips)
│   ├── geometry.ts              # Geometry calculations (distance, area, rotation)
│   ├── measurement.ts           # Measurement calculation logic
│   ├── shapeFactory.ts          # Shape creation functions
│   ├── shapeTransforms.ts       # Drag/rotate/resize calculations
│   ├── fileHandler.ts           # File processing utilities
│   └── units.ts                 # Unit conversion (feet/meters)
└── constants/
    └── index.ts                 # Centralized constants (colors, thresholds, defaults)
```

## File Details

### `/src/types/index.ts`
Defines all TypeScript interfaces:
- `Point`: x/y coordinates
- `Shape`, `LineShape`, `RectangleShape`, `PolygonShape`: Shape data structures
- `ScaleCalibration`: Stores pixel-to-real-world ratio
- `Measurement`: Calculated measurements (length, area, perimeter)
- `Tool`, `Unit`: Type literals for tools and units

Key shape properties:
- All shapes have: `id`, `type`, `color`, `opacity`, `strokeWidth`, `label?`
- `RectangleShape`: `topLeft`, `bottomRight`, `rotation` (degrees)
- `PolygonShape`: `points[]`, `closed`, `rotation`, `center`

### `/src/App.tsx`
Main application wrapper that:
- Initializes all state (document, shapes, tools, scale, styles)
- Provides state via AppContext to all child components
- Manages undo/redo history
- Handles keyboard shortcuts and clipboard paste
- Coordinates between Canvas, Toolbar, and sidebar components

State is centralized in AppContext, eliminating prop drilling.

### `/src/contexts/AppContext.tsx`
React Context for shared state management:
- Eliminates prop drilling by providing state to all components
- Holds document, shapes, scale, tool, unit, and style settings
- Provides callbacks for state updates
- Makes state accessible via `useAppContext()` hook

### `/src/components/Canvas/Canvas.tsx`
The core drawing component (~340 lines, refactored from 1268). Orchestrates:

**Custom Hooks Used:**
- `useCanvas`: Pan/zoom state and coordinate transforms
- `useDrawing`: Drawing state and shape creation logic
- `useShapeInteraction`: Selection, dragging, rotation
- `useFileUpload`: File handling and drag/drop

**Rendering:**
- Delegates to `canvasRenderer.ts` for all drawing operations
- Renders background image with pan/zoom transforms
- Shows in-progress shapes while drawing
- Displays tooltips and visual feedback

**Interaction:**
- Coordinates mouse events between different hooks
- Handles tool-specific behavior (draw, select, pan)
- Manages polygon closing and double-click completion

### `/src/components/Toolbar.tsx`
Left sidebar containing:
- Undo/Redo buttons
- Tool selection buttons (Select, Scale, Line, Rectangle, Polygon, Pan)
- Unit toggle (Feet/Meters)
- Style controls (Color picker, Opacity slider, Stroke width)
- Delete selected button
- Reset scale button
- Keyboard shortcut hints

### `/src/components/ShapeList.tsx`
Top portion of right sidebar:
- Lists all shapes with type icons
- Click to select shape
- Inline label editing (click pencil icon)
- Delete button per shape
- Toggle for showing side lengths on polygons

### `/src/components/MeasurementPanel.tsx`
Bottom portion of right sidebar:
- Shows measurements for selected shape
- Displays: length, width, height, area, perimeter
- Shows shape style info (color, opacity, stroke)
- Shows "Set scale to see measurements" when no scale

### `/src/components/Canvas/UploadOverlay.tsx`
Initial upload screen component:
- Drag-and-drop zone
- File input button
- Upload prompt with icon and instructions

### `/src/components/ScaleDialog.tsx`
Modal dialog for scale calibration:
- Input field for real-world distance
- Unit selector (feet/meters)
- Calculates pixels-per-unit from drawn line

### `/src/hooks/useCanvas.ts`
Canvas viewport management:
- Pan/zoom state and controls
- Coordinate transformation functions (`getCanvasPoint`, `screenToCanvas`)
- Mouse wheel zoom handling
- Auto-fit image to canvas on load
- Canvas resize handling

### `/src/hooks/useDrawing.ts`
Drawing state and shape creation:
- Manages drawing state (isDrawing, drawStart, currentPoint, polygonPoints)
- Tooltip display logic
- Drag detection to distinguish clicks from drags
- Shape creation via `shapeFactory.ts`
- Polygon completion logic

### `/src/hooks/useShapeInteraction.ts`
Shape editing operations:
- Selection hit detection
- Vertex dragging with rotation support
- Shape translation (moving)
- Rotation handle interaction
- Delegates transforms to `shapeTransforms.ts`

### `/src/hooks/useFileUpload.ts`
File handling logic:
- Drag-and-drop state management
- File input handling
- Document loading via `fileHandler.ts`
- Visual feedback for drag state

### `/src/hooks/useKeyboardShortcuts.ts`
Keyboard event handling:
- Undo/Redo (Cmd/Ctrl+Z)
- Delete selected shape
- Tool shortcuts (V, L, R, P, H)
- Escape to cancel/deselect

### `/src/hooks/useUndoRedo.ts`
Generic undo/redo hook:
- Maintains history array and current index
- `setState()`: Adds new state to history
- `undo()/redo()`: Navigate history
- `canUndo/canRedo`: Boolean flags
- Limits history to 50 items

### `/src/utils/canvasRenderer.ts`
All drawing functions (extracted from Canvas.tsx):
- `drawShape()`: Renders shapes with measurements and rotation
- `drawVertex()`: Draws vertex handles
- `drawMeasurementLabel()`: Displays measurement text
- `drawScaleCalibrationLine()`: Shows scale line
- `drawDrawingPreview()`: Shows shape being drawn
- `drawPolygonPreview()`: Polygon in-progress with close hint
- `drawTooltip()`: Tool instruction tooltips
- `drawMeasurementPreview()`, `drawRectanglePreview()`: Live measurement display

### `/src/utils/geometry.ts`
Pure geometry functions:
- `distance()`: Euclidean distance between points
- `polygonArea()`: Shoelace formula
- `polygonPerimeter()`: Sum of side lengths
- `pointInPolygon()`: Ray casting algorithm
- `pointInRectangle()`, `pointInRotatedRectangle()`: Hit detection
- `pointNearLine()`, `pointNearVertex()`: Proximity detection
- `rotatePoint()`: Rotate point around center
- `getRotatedRectangleCorners()`: Get corners after rotation
- `screenToCanvas()`, `canvasToScreen()`: Coordinate transforms

### `/src/utils/measurement.ts`
Measurement calculation functions:
- `calculateMeasurements()`: Returns Measurement object for any shape
- Handles unit conversion between scale unit and display unit
- Uses shoelace formula for polygon area
- `formatMeasurementDisplay()`: Formats measurements for display

### `/src/utils/shapeFactory.ts`
Shape creation functions:
- `createLine()`: Creates line shape with proper defaults
- `createRectangle()`: Creates rectangle with normalized bounds
- `createPolygon()`: Creates polygon with calculated center

### `/src/utils/shapeTransforms.ts`
Shape transformation calculations:
- `updateShapeVertex()`: Handles vertex dragging for all shape types
- `translateShape()`: Moves shape by delta
- `rotateShape()`: Updates shape rotation
- Separate functions for line, rectangle, and polygon transforms

### `/src/utils/fileHandler.ts`
File processing utilities:
- `processFile()`: Routes file to appropriate processor
- `processImageFile()`: Loads images as HTMLImageElement
- `processClipboardItem()`: Handles pasted images
- Extensible for future PDF/CAD support

### `/src/utils/units.ts`
Unit conversion utilities:
- `convertUnits()`: Feet ↔ Meters
- `pixelsToRealWorld()`: Convert pixel distance using scale
- `formatMeasurement()`: Format as "X.XX feet"
- `formatArea()`: Format as "X.XX ft²"

### `/src/constants/index.ts`
Centralized constants:
- Default values (colors, opacity, stroke width, tool, unit)
- Thresholds (vertex selection, line selection, polygon close, drag detection)
- Zoom limits and factors
- UI colors (rotation handle, vertices, tooltips)
- Sizes (vertex radius, rotation handle distance)
- History limit

### `/src/App.css`
Complete dark theme styling (~800 lines):
- CSS variables for consistent theming
- Toolbar styles
- Canvas container
- Modal styles
- Shape list styles
- Measurement panel styles
- Form inputs and buttons
- Scrollbar styling

## Data Flow

```
User Input → Canvas.tsx (mouse events)
    ↓
Hook Processing → useDrawing/useShapeInteraction
    ↓
State Update → AppContext (setShapes, setSelectedShapeId, etc.)
    ↓
useUndoRedo → Updates history in App.tsx
    ↓
Context Update → All subscribed components re-render
    ↓
Canvas.tsx → Calls canvasRenderer functions
    ↓
Measurements → Calculated on-the-fly via measurement.ts
```

## Coordinate Systems

1. **Screen coordinates**: Mouse position in browser window
2. **Canvas coordinates**: After applying pan offset and zoom
3. **Shape local coordinates**: For rotated shapes, relative to shape center

Transforms in Canvas.tsx:
```typescript
// Screen → Canvas
screenToCanvas(screenPoint, panOffset, zoom)

// Canvas → Screen (for drawing labels)
canvasToScreen(canvasPoint, panOffset, zoom)

// Rotate point around center
rotatePoint(point, center, angleDegrees)
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| V or S | Select tool |
| L | Line tool |
| R | Rectangle tool |
| P | Polygon tool |
| H | Pan tool |
| Delete/Backspace | Delete selected shape |
| Escape | Cancel current drawing / Deselect |
| Cmd/Ctrl + Z | Undo |
| Cmd/Ctrl + Shift + Z | Redo |

## Shape Lifecycle

### Creating a Rectangle
1. Select Rectangle tool
2. Click and drag on canvas
3. Release to create shape
4. Shape added to shapes array via `onShapesChange`

### Creating a Polygon
1. Select Polygon tool
2. Click to add vertices
3. Either double-click OR click near first vertex to close
4. Green highlight appears when hovering near first vertex

### Rotating a Shape
1. Select the shape
2. Look for blue rotation handle above shape
3. Drag handle to rotate
4. Rotation stored in degrees

### Editing Vertices
1. Select a shape
2. White vertex handles appear
3. Drag any handle to resize
4. For rectangles: opposite diagonal corner stays anchored
5. For polygons: only the dragged vertex moves

## Scale Calibration

1. Click "Set Scale" tool
2. Draw a line along a known distance on the image
3. Dialog opens - enter the real-world length
4. Select unit (feet or meters)
5. Scale is calculated: `pixelDistance / realWorldDistance`
6. All measurements now use this ratio

To reset: Click "Reset Scale" button in toolbar.

## Styling Shapes

Before or after drawing:
- **Color**: Click color picker in toolbar
- **Opacity**: Adjust slider (affects polygon fill)
- **Stroke Width**: Adjust slider (affects line thickness)

New shapes use current style settings. Existing shapes keep their original styles.

## Code Quality

- **Modular Architecture**: Separated concerns into focused modules
- **Custom Hooks**: Reusable logic extracted from components
- **Type Safety**: Full TypeScript coverage with strict types
- **No Prop Drilling**: React Context for shared state
- **Pure Functions**: Utilities are side-effect free
- **Single Responsibility**: Each module has one clear purpose

## Dependencies

- React 19
- Vite 7
- TypeScript 5.9
- react-hot-toast (for notifications)
- No external canvas/drawing libraries - uses native Canvas API

## Build

```bash
pnpm build    # Creates dist/ folder
pnpm preview  # Preview production build
```

Deployed via Netlify (see `netlify.toml`).
