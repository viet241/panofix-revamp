# PanoFix

**Fix Your Panoramas, Share in 360°**

Free, browser-based tool: inject XMP Photo Sphere (GPano) metadata into equirectangular panoramas. Set FOV, align north and horizon, then export a 360°-ready JPEG for Google Photos, Facebook, Street View, and more.

## Features

- **Image upload**: JPEG, PNG, WebP, HEIC, TIFF. Non-JPEG formats are converted to JPEG for export. (HEIC decodes best in Safari.)
- **FOV**: Horizontal FOV 30°–360°; vertical FOV auto-scaled from aspect ratio.
- **View modes**: Map (equirectangular) or 360° (interactive Three.js viewer with pan, pinch zoom, and zoom buttons).
- **Alignment**: Drag North line and Horizon line on the map; export embeds pose.
- **Export**: Single JPEG with XMP metadata per GPano spec.

## Requirements

- Node.js 18+

## Setup & Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server (port 3000, host 0.0.0.0) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run clean` | Remove dist folder |
| `npm run lint` | Type-check (tsc) |

## License

Apache-2.0
