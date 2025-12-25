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
- **Documentation**: Markdown-based docs (Getting Started, Measurements guide)
- **Blog**: Content management system for articles

## Tech Stack

- **Astro** - Static site generator for landing/docs/blog
- **React** - Canvas measurement tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - UI components + theming via CSS variables (Radix UI)
- **TypeScript** - Full type safety
- **Vercel** - Hosting and analytics

## UI & Theming (shadcn/ui)

This project uses **shadcn/ui with CSS variables** (recommended approach).

- **Config**: `components.json` → `tailwind.cssVariables: true`
- **Theme tokens**: `src/styles/globals.css` (`:root` + `.dark`)
- **Tailwind mapping**: `tailwind.config.mjs` uses `oklch(var(--token))` for colors

### Important: CSS variable format

Because Tailwind is configured as `oklch(var(--token))`, the variables in `src/styles/globals.css` must be **raw OKLCH components** (e.g. `--background: 0.17 0 0;`) rather than `oklch(...)`.

### Dark mode

Dark mode is **class-based** (`darkMode: 'class'`). The app currently forces dark mode in `src/layouts/BaseLayout.astro` by applying the `dark` class to `<html>`.

### Updating / adding shadcn components

```bash
# Add a component
pnpm dlx shadcn@latest add input

# Update an existing component to the latest shadcn version
pnpm dlx shadcn@latest add button --overwrite
```

To change the overall palette, edit tokens in `src/styles/globals.css` or use the shadcn theme generator at `https://ui.shadcn.com/themes`.

## Project Structure

```
src/
├── pages/                    # Routes
│   ├── index.astro           # Canvas tool (React island)
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
The measurement tool is a React SPA that loads on `/` (via an Astro page + React island):

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
- Documentation from Markdown (`/docs`)
- Blog from Markdown (`/blog`)
- Minimal JavaScript outside the canvas app

## Production / Deployment Notes

- **CI**: GitHub Actions workflow at `.github/workflows/ci.yml` runs lint → typecheck → build.
- **SEO**: includes standard meta tags + OpenGraph, plus sitemap generation.
- **Analytics**: Vercel Analytics is integrated (`@vercel/analytics`) and can be enabled from the Vercel dashboard.

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
pnpm dev              # Start dev server with TypeScript type checking (recommended)
pnpm dev:fast         # Start dev server only (no checks, fastest)
pnpm dev:check        # Start dev server with linting & typechecking in watch mode
pnpm build            # Production build
pnpm preview          # Preview production build

# Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Run ESLint with auto-fix
pnpm typecheck        # TypeScript type checking
pnpm typecheck:watch  # TypeScript type checking in watch mode
```

## Pre-commit Hooks

This project uses [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/lint-staged/lint-staged) to automatically run linting and type checking before commits:

- **Linting**: Automatically fixes ESLint issues on staged files
- **Type Checking**: Runs TypeScript type checking on all files

The hooks are automatically set up when you run `pnpm install` (via the `prepare` script).

To manually initialize Husky:
```bash
pnpm prepare
```

## Development Workflow

**Default (`pnpm dev`)**: Runs dev server + TypeScript watch mode
- Catches type errors immediately
- Unobtrusive (only shows errors, not on every change)
- Recommended for most development

**Fast (`pnpm dev:fast`)**: Dev server only
- No checks running
- Use when you need maximum speed or are just testing UI

**Full Checks (`pnpm dev:check`)**: Dev server + TypeScript + ESLint watch
- Catches both type and lint errors in real-time
- Use when you want comprehensive feedback during development

## Deployment

Deploy to Vercel:
1. Push to GitHub
2. Connect repository at vercel.com
3. Vercel auto-detects Astro and deploys

Recommended follow-ups after first deploy:
- **Enable Analytics** in the Vercel dashboard (no code changes).
- **Set your canonical site URL** in `astro.config.mjs` (used by sitemap/SEO).
- Add basic assets:
  - `public/og-image.png` (1200×630)
  - `public/favicon.ico` (and replace any placeholder icons)

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
