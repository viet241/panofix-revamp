# 360 Pano Maker

Web app to edit and inject Google Photo Sphere XMP metadata into equirectangular images, enabling proper 360° display in Google Photos, Street View, and common panorama viewers.

## Features

- **Image upload**: JPEG/JPG or PNG (PNG is converted to JPEG before processing)
- **FOV adjustment**: Horizontal FOV 30°–360° with vertical FOV auto-scaled by aspect ratio
- **View modes**: Map (equirectangular) or 360° (interactive Three.js viewer)
- **Alignment**: North offset, horizon offset
- **Export**: Injects XMP metadata per GPano (Google Panorama) spec

## Requirements

- Node.js 18+

## Setup & Run

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```

Open `http://localhost:3000` in your browser.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server (port 3000, host 0.0.0.0) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run clean` | Remove dist folder |
| `npm run lint` | Type-check (tsc) |

## License

Apache-2.0
