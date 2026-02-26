# Iceland Radio Installation

A browser-based continuous audio-visual installation that maps a 4-hour audio timeline to a physical car route across Iceland. Visitors "tune in" at different points in the journey based on time-of-day, creating a unique radio-like experience.

## 🎯 Concept

- **Continuous Audio Timeline**: ~4 hours of audio divided into 4 sequential route sections (20 tracks total: 7+3+4+6)
- **Time-of-Day Entry**: Each visitor enters at a different point (24h cycle → 4h audio loop)
- **Geographic Mapping**: Audio timeline synced to route visualization on Iceland map
- **Elevation Profile**: Real-time elevation visualization of the current section with progress indicator
- **Random Visual Media**: Videos and images play randomly from section-specific pools
- **Radio-Like Experience**: Always-on stream, not an album or playlist
- **Visual Aesthetics**: 
  - Desaturated media (almost grayscale) with high contrast
  - Animated vertical black bars with blur effects creating a dynamic viewing experience
  - Monochromatic UI using a curated greyscale palette
  - Unified modular bottom bar design
  - Elegant typography with Barlow Condensed font

## 🏗️ Architecture

### Core Systems

```
Timeline Engine (Master Clock)
    ↓
Route Mapping System
    ↓
    ├─→ Audio Engine (Sequential playback)
    ├─→ Media Controller (Random visual media)
    ├─→ Map Visualizer (Route progress)
    └─→ Elevation Profile (Section terrain visualization)
```

### System Descriptions

1. **Timeline Engine** (`src/systems/timeline-engine.js`)
   - Master clock and single source of truth
   - Calculates entry point from time-of-day
   - Emits position updates at 60fps
   - Auto-resyncs to prevent drift

2. **Route Mapping** (`src/systems/route-mapping.js`)
   - Translates timeline position to section, audio file, and geo position
   - Pre-calculates all boundaries and offsets
   - Handles geographic interpolation

3. **Audio Engine** (`src/systems/audio-engine.js`)
   - Sequential playback of 20 audio files across 4 sections
   - Gapless transitions between tracks and sections
   - Web Audio API with real-time frequency analysis
   - Lazy preloading of next track

4. **Media Controller** (`src/systems/media-controller.js`)
   - Random selection from section-specific pools (5 videos + 15 images per section)
   - No-repeat logic (shows all before repeating)
   - Lazy loading (only 2-3 items cached)
   - Crossfade transitions

5. **State Manager** (`src/systems/state-manager.js`)
   - Coordinates all systems
   - Handles initialization sequence
   - Manages user interactions
   - Dynamic track count display per section

6. **Elevation Profile** (`src/main.js`)
   - Real elevation data from Open-Meteo API (0–562m range across Iceland)
   - Canvas-based rendering with normalized height per section
   - Bright played portion, dim upcoming portion, position dot indicator
   - Cached per section, redraws on every context update

## 🎨 Visual Design System

### Color Palette

The installation uses a carefully curated greyscale palette:

```css
/* Color Palette - Coolors */
--onyx: #0c0e10       /* Deep black - Background */
--gunmetal: #323535   /* Dark grey - Structural elements */
--grey: #747978       /* Mid grey - Secondary text */
--ash-grey: #a8b5b2   /* Light grey - Labels and subtitles */
--silver: #c3c6c8     /* Lightest grey - Primary text and highlights */
```

### Visual Effects

#### 1. Animated Black Bars
- **Four vertical bars** (25% width each) overlay the media display
- **Dynamic behavior**: Random bars disappear/reappear every 0.3-1.5 seconds
- **Blur effect**: Active bars have 20-40px backdrop blur creating a "smudge" effect
- **Opacity**: Active bars vary between 0.9-1.0 opacity
- **Transparent state**: Fully transparent (opacity 0) when inactive, revealing media beneath
- Creates a rhythmic, glitchy visual experience

#### 2. Media Desaturation & Contrast
All videos and images are processed with CSS filters:
```css
filter: saturate(0.2) contrast(1.4);
```
- **Saturation**: Reduced to 20% for near-grayscale aesthetic
- **Contrast**: Increased by 40% for dramatic visual impact
- Maintains cohesion with the monochromatic UI palette

#### 3. Typography
- **Primary font**: Barlow Condensed (300, 400, 500, 600 weights)
- **Fallbacks**: 'Helvetica Neue', Helvetica, sans-serif
- **Google Fonts**: Loaded via CDN for optimal performance

### UI Components

#### Now Playing Bar (Bottom) — Modular Design

The bottom bar uses a unified module pattern: each module has content above and a small uppercase label below, all sharing the same typography and color language.

- **Background**: Onyx (#0c0e10)
- **Height**: 120px (desktop), 100px (tablet), 80px (mobile)
- **Layout**: Flexbox with `align-items: stretch`
- **Modules** (left to right):

| Module | Content | Label |
|--------|---------|-------|
| **VOL** | Vertical slider (3px track, 10px white dot) | `vol` |
| **SPECTRUM** | 15 frequency bars (2px, gradient #586462→#a8b5b2) | `spectrum` |
| **NOW PLAYING** | Section name + Track info (flex: 1) | `now playing` |
| **ELEVATION** | Canvas elevation profile with progress indicator | `elevation` |

- **Label style**: 0.6rem, `#586462`, uppercase, `letter-spacing: 2px`, Barlow Condensed 400

#### Elevation Profile
- **Data**: Real altitude from geoPath `[lat, lng, altitude_meters]`
- **Rendering**: Canvas with device pixel ratio scaling
- **Visual elements**:
  - Full profile line in dim grey (`rgba(116, 121, 120, 0.3)`)
  - Played portion in bright white (`rgba(255, 255, 255, 0.7)`)
  - Subtle gradient fill under played area
  - Vertical position line + white dot at current position
- **Fallback**: Uses latitude as proxy if altitude data is absent

#### Map Visualizer (Right Sidebar)
- **Position**: Right sidebar on desktop (25% width), top on mobile (full width)
- **Background**: White for contrast with dark UI
- **Technology**: OpenStreetMap with Leaflet.js
- **Features**: Route visualization with real-time position tracking

#### Black Bars Overlay
- **Container**: Fixed position, z-index 5 (above media, below UI)
- **Bars**: 4 columns, 25% width each
- **Bottom clearance**: 120px (desktop) / 100px (tablet) / 80px (mobile)
- **Pointer events**: Disabled to allow interaction with underlying elements

### Responsive Design

The layout adapts across three breakpoints:

- **Desktop (>1024px)**:
  - Map: Right sidebar (25% width)
  - Media: Full screen background
  - Bottom bar: 120px with all 4 modules
  - Black bars: Top to 120px from bottom

- **Tablet (≤1024px)**:
  - Map: Top horizontal strip (120px height)
  - Media: Between top and bottom bars
  - Bottom bar: 100px, spectrum hidden
  - Black bars: From 120px top to 100px bottom

- **Mobile (≤580px)**:
  - Map: Top strip (100px height)
  - Bottom bar: 80px, spectrum + elevation hidden
  - Only vol and now playing modules visible

## 📁 Project Structure

```
iceland-radio-installation/
├── index.html                  # Main HTML + bottom bar + black bars animation
├── README.md                   # This file
│
├── src/
│   ├── main.js                 # App entry + frequency bars + elevation profile
│   │
│   ├── data/
│   │   └── route-config.js     # ⭐ Routes, audio, media pools, elevation
│   │
│   ├── systems/
│   │   ├── timeline-engine.js
│   │   ├── route-mapping.js
│   │   ├── audio-engine.js
│   │   ├── media-controller.js
│   │   └── state-manager.js
│   │
│   ├── components/
│   │   ├── media-display.js
│   │   ├── map-visualizer.js
│   │   └── ui.js
│   │
│   └── utils/
│       └── (helper scripts)
│
├── public/
│   ├── audio/
│   │   ├── section1/           # 7 tracks (track_01 – track_07)
│   │   ├── section2/           # 3 tracks (track_08 – track_10)
│   │   ├── section3/           # 4 tracks (track_11 – track_14)
│   │   └── section4/           # 6 tracks (track_15 – track_20)
│   │
│   └── media/
│       ├── section1/
│       │   ├── videos/         # 5 videos per section
│       │   └── images/         # 15 images per section
│       ├── section2/
│       ├── section3/
│       └── section4/
│
└── tools/
    └── fetch-elevations.py     # Script to get real elevation data
```

## 🚀 Getting Started

### 1. Running Locally

Since the project uses ES6 modules, you need a local server:

```bash
# Option 1: Python
python3 -m http.server 8000

# Option 2: Node.js
npx http-server -p 8000

# Option 3: VS Code Live Server extension
```

Then open `http://localhost:8000` in your browser.

### 2. Testing

Open browser console to see detailed logs:
- Timeline position and sync
- Audio file loading and playback
- Media selection and transitions
- Section changes

## 📝 Data Configuration

### Route Config Structure

`src/data/route-config.js` contains all data for the 4 sections. Each section has:

```javascript
{
  id: 'section_1',
  name: 'Reykjavik to Vík',
  geoPath: [
    [64.115366, -20.300251, 97.0],  // [lat, lng, altitude_meters]
    [64.115528, -20.299848, 97.0],
    // ... thousands of points with real elevation
  ],
  audioFiles: [
    { url: '/iceland/public/audio/section1/track_01.mp3', duration: 934 },
    // ...
  ],
  mediaPool: {
    videos: ['video_01.mp4', 'video_02.mp4', ...],
    images: ['image_01.jpg', 'image_02.jpg', ...]
  }
}
```

### Audio Files

The 20 tracks are distributed across 4 sections:

| Section | Tracks | Files |
|---------|--------|-------|
| 1: Reykjavik → Vík | 7 | track_01 – track_07 |
| 2: Vík → Höfn | 3 | track_08 – track_10 |
| 3: Mývatn → Sauðárkrókur | 4 | track_11 – track_14 |
| 4: Sauðárkrókur → Reykjavik | 6 | track_15 – track_20 |

Track count per section is fully dynamic — the system reads `section.audioFiles.length` at runtime.

### Optimizing Media for Web

#### Videos (H.264, 1080p, no audio)
```bash
# Single file
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset slow \
  -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
  -an -movflags +faststart output.mp4

# Batch process folder
for f in *.mp4; do
  ffmpeg -i "$f" -c:v libx264 -crf 23 -preset slow \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
    -an -movflags +faststart "opt_${f}"
done
```

Key flags:
- `-an`: strips audio (videos are muted in the app, saves bandwidth)
- `-movflags +faststart`: enables progressive playback
- `-crf 23`: quality/size balance (lower = better, 20–26 range)

#### Images (JPEG, 1920px width)
```bash
for f in *.jpg; do
  ffmpeg -i "$f" -vf "scale=1920:-1" -q:v 3 "opt_${f}"
done
```

### Updating Media Pools

Only edit `mediaPool.videos` and `mediaPool.images` arrays in `route-config.js`. The system is fully dynamic — `media-controller.js` reads from these arrays at runtime. Add or remove as many as needed.

### Elevation Data

The geoPath arrays include real elevation data from Open-Meteo API:

| Section | Elevation Range |
|---------|----------------|
| 1 | 0m – 119m |
| 2 | 0m – 562m |
| 3 | 0m – 552m |
| 4 | 0m – 321m |

#### Regenerating Elevation Data

If you change routes, use the included script:

```bash
# Place route1.json – route4.json in same folder
python3 fetch-elevations.py
```

This outputs `geopaths-with-elevation.js` with `[lat, lng, altitude]` arrays ready to paste into `route-config.js`. Uses Open-Meteo API (free, no API key, covers Iceland). No pip install needed — uses only Python 3 standard library.

## 🔧 Configuration Options

### Media Behavior

In `src/systems/media-controller.js`:

```javascript
this.imageDuration = 10000;      // 10 seconds per image
this.crossfadeDuration = 1000;   // 1 second crossfade
```

### Audio Sync

In `src/systems/audio-engine.js`:

```javascript
this.syncCheckInterval = 5000;   // Check sync every 5 seconds
this.syncThreshold = 0.5;        // Resync if drift > 0.5 seconds
```

### Debug Mode

In `src/components/ui.js`:

```javascript
this.showDebug = true;  // Show debug panel (development only)
```

## 🌐 Deployment

### Requirements

- HTTPS required (for Web Audio API and autoplay)
- Fast CDN recommended (for media files)

### Recommended Hosting

1. **Netlify** (easiest) — Drag and drop, automatic HTTPS, global CDN
2. **Vercel** — Connect to GitHub, automatic deployments
3. **AWS S3 + CloudFront** — More control, requires setup

### Optimization Checklist

- [ ] Optimize videos with ffmpeg (`-an -movflags +faststart -crf 23`)
- [ ] Optimize images with ffmpeg (`-vf scale=1920:-1 -q:v 3`)
- [ ] Test on mobile devices
- [ ] Test on slow connections
- [ ] Enable gzip/brotli compression
- [ ] Set cache headers for media files

## 🐛 Troubleshooting

### Audio won't play
**Cause**: Autoplay policy requires user interaction
**Solution**: User must click "Tune In" button (already implemented)

### Audio/video drift over time
**Cause**: Browser throttling or network issues
**Solution**: System auto-resyncs every 5 seconds (already implemented)

### Media won't load
**Cause**: CORS restrictions or incorrect file paths
**Solution**: Ensure all files are served from same domain. Check console for 404s. Verify paths in `route-config.js`.

### Map doesn't show route
**Cause**: GPS coordinates incorrect or out of bounds
**Solution**: Verify coordinates are `[latitude, longitude]` or `[latitude, longitude, altitude]` format. Latitudes ~63–66 for Iceland, longitudes ~-24 to -13.

### Elevation profile flat or missing
**Cause**: geoPath has only `[lat, lng]` without altitude
**Solution**: Run `fetch-elevations.py` to add real elevation data. The system falls back to latitude as visual proxy if no altitude is present.

## 🎨 Customization

### Changing Colors

The entire UI uses the greyscale palette defined in `index.html`:

```css
--onyx: #0c0e10       /* Background */
--gunmetal: #323535   /* Structural */
--grey: #747978       /* Secondary text */
--ash-grey: #a8b5b2   /* Labels */
--silver: #c3c6c8     /* Primary text */
```

### Adjusting Visual Effects

#### Black Bars Animation Speed
In the `<script>` section of `index.html`:
```javascript
const randomDelay = (Math.random() * 1.2 + 0.3) * 1000; // 0.3-1.5s
const randomBlur = Math.floor(Math.random() * 21) + 20;  // 20-40px
const randomOpacity = Math.random() * 0.1 + 0.9;         // 0.9-1.0
```

#### Media Desaturation & Contrast
In `src/components/media-display.js`:
```javascript
video.style.filter = 'saturate(0.2) contrast(1.4)';
// More saturated: saturate(0.5)
// Full grayscale: saturate(0) contrast(1.2)
```

### Changing Map Size

```css
#right-sidebar { width: 25%; }              /* Desktop */
@media (max-width: 1024px) {
  #right-sidebar { height: 120px; }         /* Tablet */
}
```

### Changing Transitions

In `src/components/media-display.js`:
```javascript
this.crossfadeDuration = 1000; // Milliseconds
```

## 📊 Performance Stats

- Total audio duration: ~4 hours
- Total files: 20 audio + 80 media (20 videos + 60 images) = 100 files
- Audio tracks: 20 (7 + 3 + 4 + 6)
- GeoPath points: 16,325 (with real elevation data)
- Bandwidth per user: ~300–600 MB for full experience
- Memory usage: ~200–300 MB
- CPU usage: Low (plays audio/video natively)

## 📖 API Reference

### State Manager

```javascript
const state = stateManager.getState();
// Returns: { isPlaying, currentContext, timeline, audio, media }
```

### Timeline Engine

```javascript
timeline.seekTo(position);      // Seek to specific second
timeline.resync();               // Force resync to time-of-day
timeline.getDiagnostics();       // Get debug info
```

### Audio Engine

```javascript
audio.setVolume(0.5);           // Set volume (0-1)
audio.pause();                   // Pause playback
audio.resume();                  // Resume playback
```

## 🔮 Future Enhancements

- Audio-reactive visuals (analyzer already set up)
- Dynamic shader effects and color grading
- Interactive black bars (click to trigger, audio-reactive blur)
- 3D terrain view (Cesium already included)
- Weather overlay synced to footage
- Quality settings (HD/SD) for mobile

## 🤝 Support

1. Check browser console for error messages
2. Verify all file paths in `route-config.js`
3. Test with a simple 1-section configuration first
4. Check network tab for failed file loads

## 🙏 Acknowledgments

Built with:
- Web Audio API (with frequency analysis)
- HTML5 Video/Canvas
- CSS backdrop-filter (blur effects)
- Leaflet.js + OpenStreetMap (route visualization)
- Open-Meteo Elevation API (terrain data)
- Google Fonts (Barlow Condensed)
- Vanilla JavaScript (no frameworks)

**Design Credits:**
- Color palette: [Coolors.co](https://coolors.co/c3c6c8-a8b5b2-747978-323535-0c0e10)
- Typography: Barlow Condensed by Jeremy Tribby

---

**Iceland Radio Installation** 🇮🇸 📻 🎨
*A continuous audio-visual journey by Ginebra Raventós, Emilio Marx, Edgardo Gómez and Joan Lavandeira*
