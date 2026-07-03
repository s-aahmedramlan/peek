# peek

A cozy, desktop-first infinite digital scrapbook where you can upload photos, turn them into scrapbook scraps, place them on an infinite canvas, and zoom into nested memories.

## Features

- ✨ **Infinite Canvas**: Pan and zoom smoothly through your memory world
- 📸 **Image Upload**: Add photos and turn them into beautiful scrapbook scraps
- 🎨 **Styling Options**: Choose from ripped paper, polaroid, journal, and kraft styles
- 🔭 **Nested Memories**: Double-click any scrap to peek into nested memories
- 🧭 **Breadcrumb Navigation**: Easily navigate through memory hierarchies
- 📍 **Mini Map**: See your position on the canvas at a glance
- 💾 **Local Storage**: All your memories are saved locally using LocalStorage and IndexedDB
- 🎭 **Cozy Design**: Warm paper textures, soft shadows, and nostalgic aesthetics

## Tech Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Framer Motion** - Smooth animations
- **IndexedDB** - Image storage
- **LocalStorage** - Project persistence

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will open automatically at `http://localhost:5173`

## Usage

### Creating Scraps

1. Click **"Upload Image"** in the right panel
2. Select or drag a photo
3. Add a caption (optional)
4. Choose paper style (ripped, polaroid, journal, kraft)
5. Choose tape style (none, horizontal, vertical, cross)
6. Click **"Done"** to add it to the canvas

### Interacting with Scraps

- **Drag**: Click and drag a scrap to move it
- **Resize**: Grab the brown circle handle on the bottom-right
- **Rotate**: Grab the pink circle handle on the top-right
- **Delete**: Select a scrap and click "Delete" in the toolbox
- **Bring Forward/Back**: Use the layer controls in the toolbox

### Creating Nested Memories

1. Click on a scrap to select it
2. Click **"Add Peek Inside"** in the toolbox
3. Enter a name for the nested memory
4. Click **"Create"**
5. Double-click the scrap to enter the nested memory
6. Use breadcrumbs or **Escape** to go back

### Navigation

- **Pan**: Click and drag on empty canvas space
- **Zoom**: Use mouse wheel or the +/- buttons (bottom left)
- **Reset**: Click the ⊡ button to reset the view
- **Breadcrumbs**: Click any breadcrumb item to jump to that memory level

## Project Structure

```
src/
├── components/          # React components
│   ├── ScrapbookObject.tsx
│   ├── UploadScrapCreator.tsx
│   ├── FloatingToolbox.tsx
│   ├── ObjectToolbar.tsx
│   ├── BreadcrumbNav.tsx
│   ├── ZoomControls.tsx
│   ├── MiniMap.tsx
│   ├── CanvasViewport.tsx
│   └── NestedCanvasTransition.tsx
├── store/               # Zustand store
│   └── scrapbookStore.ts
├── utils/               # Utility functions
│   ├── geometry.ts
│   ├── canvasTransforms.ts
│   ├── imageStorage.ts
│   └── storage.ts
├── types/               # TypeScript types
│   └── scrapbook.ts
├── styles/              # CSS files
│   ├── index.css
│   └── paperEffects.css
├── App.tsx              # Main app component
└── main.tsx             # Entry point
```

## Data Persistence

- **Images**: Stored in IndexedDB for efficient blob storage
- **Projects**: Saved to LocalStorage as JSON
- **Viewports**: Each canvas viewport state is saved for smooth restoration

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari (with some styling caveats)

## Future Features

- Friend navigation and viewing others' peeks
- Shared memories and collaboration
- Export and backup functionality
- More paper styles and effects
- Stickers and doodles
- Tags and search
- Mobile responsive version

## Design Principles

- Cozy, intimate, and nostalgic
- Tactile and warm (paper textures, soft shadows)
- Encourages curiosity, not urgency
- Personal memory world, not a productivity tool
- Beautiful, polished MVP feel

## License

MIT

## Contributing

This is a personal MVP project. Feedback and ideas are welcome!

---

**Made with ❤️ for exploring memories**
