# Procedural Map Generator for Owlbear Rodeo

A powerful extension that generates dungeon, wilderness, battle, and city maps directly inside Owlbear Rodeo using seeded procedural generation. **Automatically creates walls and lights** compatible with the Dynamic Fog extension.

## Features

- **4 Map Types**: Dungeon, Wilderness, Battle Map, City/Town
- **Automatic Walls**: Extracts wall data from dungeons and battle maps
- **Smart Lighting**: Places lights in room centers and strategic positions
- **Dynamic Fog Compatible**: Works seamlessly with the popular fog-of-war extension
- **Seeded Generation**: Save and share seeds to recreate identical maps
- **Configurable Dimensions**: From 10x10 to 100x100 tiles
- **Grid-Aligned**: Automatically creates properly scaled scenes in Owlbear
- **High Quality**: Adjustable DPI from 100-300 for crisp, detailed maps

## Installation

### Method 1: Direct Load (Development/Testing)

1. Host these files on a web server (e.g., `python3 -m http.server 8000`)
2. In Owlbear Rodeo, click **Extensions** in the top menu
3. Click **Add Extension**
4. Enter your manifest URL: `http://localhost:8000/manifest.json`
5. Click **Add**

### Method 2: Deployment

1. Deploy to a static hosting service (GitHub Pages, Netlify, Vercel, Cloudflare Pages)
2. Share your manifest URL with users
3. Users add via the Extensions menu in Owlbear

## Usage

1. Open the extension in Owlbear Rodeo (look for the icon in the top-left)
2. Select map type and size
3. (Optional) Enter a seed for reproducible generation
4. Click **Generate Map in Scene**
5. The extension will:
   - Generate the map procedurally
   - Extract wall boundaries (dungeons/battle maps)
   - Place lights strategically
   - Upload it to Owlbear
   - Create a new scene with proper grid alignment
   - Add walls and lights as scene items

**Works with Dynamic Fog!** The walls are tagged with metadata that the Dynamic Fog extension recognizes, so fog-of-war works immediately.

## Map Types

### Dungeon
- Room-and-corridor layout using BSP algorithm
- **Walls**: Auto-generated at room boundaries
- **Lights**: Placed in room centers
- Connected chambers with varied sizes
- Perfect for dungeon crawls and dungeon delving

### Wilderness
- Natural terrain with noise-based generation
- Organic paths and vegetation
- Great for overland travel encounters
- No walls (open terrain)

### Battle Map
- Open arena with scattered obstacles
- **Walls**: Perimeter walls around the arena
- **Lights**: Dramatic corner lighting
- Tactical zones marked for strategic gameplay
- Ideal for arena fights or set-piece encounters

### City
- Street grid with building blocks
- Structured urban layout
- Perfect for city encounters and heists
- No walls by default (open streets)

## File Structure

```
owlbear-extension/
├── manifest.json          # Extension manifest
├── index.html            # Main UI (embedded in Owlbear)
├── map-generator.js      # Procedural generation algorithms
├── icon.svg             # Extension icon
└── README.md            # This file
```

## Technical Details

- **Framework**: Vanilla JavaScript with Owlbear Rodeo SDK
- **Canvas-based**: Generates maps using HTML5 Canvas API
- **Seeded RNG**: Linear Congruential Generator for reproducible results
- **Scene API**: Uses OBR.scene.create() to add generated maps

## Development

To modify or extend:

1. Edit `map-generator.js` to adjust generation algorithms
2. Modify `index.html` for UI changes
3. Update `manifest.json` version when publishing updates

## Seed System

Seeds are numeric values that control map generation. Same seed + same parameters = identical map.

**Examples:**
- `12345` - Specific seed
- Leave blank - Random seed (timestamp-based)
- Share seeds with other DMs to recreate maps

## Requirements

- Owlbear Rodeo account
- Modern browser (Chrome, Firefox, Safari, Edge)
- For hosting: Static file server or hosting service

## License

Built for the Zenith-Wahl campaign by Michael.
Free to use, modify, and distribute.

## Credits

Developed using:
- Owlbear Rodeo SDK v2.x
- Procedural generation algorithms inspired by roguelike dungeon generation
- Canvas API for rendering
