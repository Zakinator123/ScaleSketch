# ScaleSketch

A professional, browser-based measurement tool for floor plans and blueprints. Upload images, calibrate scale, and draw precisely measured shapes with real-world dimensions.

## Quick Start

```bash
pnpm install
pnpm dev       # Visit http://localhost:4321
pnpm build     # Production build
```

## Features

### Canvas Measurement Tool
- **Image Upload**: Drag-and-drop, paste, or click to upload images
- **Scale Calibration**: Draw a line on a known distance to set the measurement scale
- **Drawing Tools**: Line, Rectangle, and Polygon tools with real-time measurements
- **Shape Rotation**: Rotate rectangles and polygons after creation
- **Vertex Editing**: Drag individual vertices to resize/reshape
- **Measurements**: Real-time area and perimeter calculations in feet or meters
- **Undo/Redo**: Full history with Cmd/Ctrl+Z support
- **Shape Management**: Label, delete, and organize shapes in a list view

### Marketing Site
- **Landing Page**: Professional hero, features, and CTA sections
- **Documentation**: Markdown-based docs (Getting Started, Measurements guide)
- **Blog**: Content management system for articles

## Tech Stack

- **Astro** - Static site generator for landing/docs/blog
- **React** - Canvas measurement tool
- **Tailwind CSS** - Utility-first styling
- **TypeScript** - Full type safety
- **Vercel** - Hosting and analytics

## Project Structure

```
src/
├── pages/                    # Routes
│   ├── index.astro           # Landing page
│   ├── app.astro             # Canvas tool
│   ├── docs/                 # Documentation pages
│   └── blog/                 # Blog pages
├── content/                  # Markdown content
│   ├── docs/                 # Doc articles
│   └── blog/                 # Blog posts
├── components/
│   ├── react/                # React components (canvas app)
│   │   ├── Canvas/
│   │   ├── LeftSidebar.tsx
│   │   ├── ScaleDialog.tsx
│   │   ├── ShapeAttributes.tsx
│   │   └── ShapeList.tsx
│   ├── astro/                # Astro components (marketing)
│   └── ui/                   # shadcn/ui components
├── hooks/                    # React hooks
├── utils/                    # Utility functions
├── types/                    # TypeScript types
└── constants/                # Constants
```

## Architecture

### Canvas App (React)
The measurement tool is a React SPA that loads on `/app`:

**Custom Hooks:**
- `useCanvas` - Pan/zoom/resize logic
- `useDrawing` - Drawing state and shape creation
- `useShapeInteraction` - Vertex dragging, rotation, selection
- `useFileUpload` - File handling (drag/drop, paste)
- `useKeyboardShortcuts` - Keyboard event handling
- `useUndoRedo` - Undo/redo state management

**Utilities:**
- `canvasRenderer.ts` - All drawing functions
- `geometry.ts` - Geometry calculations
- `measurement.ts` - Measurement calculations
- `shapeFactory.ts` - Shape creation
- `shapeTransforms.ts` - Drag/rotate/resize
- `units.ts` - Unit conversion (feet/meters)

**State Management:**
- React Context (`AppContext.tsx`) eliminates prop drilling
- Centralized state for document, shapes, tools, scale

### Marketing Site (Astro)
Static HTML generation for excellent SEO:
- Landing page with hero, features, CTA
- Documentation from Markdown
- Blog from Markdown
- Zero JavaScript on marketing pages

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| V or S | Select tool |
| L | Line tool |
| R | Rectangle tool |
| P | Polygon tool |
| H | Pan tool |
| Delete/Backspace | Delete selected shape |
| Escape | Cancel drawing / Deselect |
| Cmd/Ctrl + Z | Undo |
| Cmd/Ctrl + Shift + Z | Redo |

## Scale Calibration

1. Click "Set Scale" tool
2. Draw a line along a known distance on the image
3. Enter the real-world length and unit
4. All measurements now use this ratio

## Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm preview          # Preview production build

# Quality
pnpm lint             # Run ESLint
pnpm typecheck        # TypeScript type checking
```

## Deployment

Deploy to Vercel:
1. Push to GitHub
2. Connect repository at vercel.com
3. Vercel auto-detects Astro and deploys

Or use Vercel CLI:
```bash
pnpm add -g vercel
vercel
```

## Routes

- `/` - Canvas measurement tool
- `/docs` - Documentation
- `/blog` - Blog

## Cost

- **Vercel**: Free tier (100GB bandwidth/month)
- **Domain**: ~$12/year
- **Total**: ~$1/month

## License

MIT License
