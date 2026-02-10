# OUR ICELAND SONIC ROUTE

A browser-based continuous audio-visual installation that maps a 4-hour audio timeline to a physical car route across Iceland. Visitors "tune in" at different points in the journey based on time-of-day, creating a unique radio-like experience.

## Concept

- **Continuous Audio Timeline**: ~4 hours of audio divided into 4 sequential route sections
- **Time-of-Day Entry**: Each visitor enters at a different point (24h cycle → 4h audio loop)
- **Geographic Mapping**: Audio timeline synced to route visualization on Iceland map
- **Random Visual Media**: Videos and images play randomly from section-specific pools
- **Radio-Like Experience**: Always-on stream, not an album or playlist
- **Visual Aesthetics**: 
  - Desaturated media (almost grayscale) with high contrast
  - Animated vertical black bars with blur effects creating a dynamic viewing experience
  - Monochromatic UI using a curated greyscale palette
  - Elegant typography with Barlow Condensed font

## Architecture

### Core Systems

```
Timeline Engine (Master Clock)
    ↓
Route Mapping System
    ↓
    ├─→ Audio Engine (Sequential playback)
    ├─→ Media Controller (Random visual media)
    └─→ Map Visualizer (Route progress)
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
   - Sequential playback of ~32 audio files
   - Gapless transitions between tracks and sections
   - Web Audio API integration (for future analysis)
   - Lazy preloading of next track

4. **Media Controller** (`src/systems/media-controller.js`)
   - Random selection from section-specific pools (~50-60 items each)
   - No-repeat logic (shows all before repeating)
   - Lazy loading (only 2-3 items cached)
   - Crossfade transitions

5. **State Manager** (`src/systems/state-manager.js`)
   - Coordinates all systems
   - Handles initialization sequence
   - Manages user interactions

## Visual Design System

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
- **Usage**:
  - Tune-in overlay title and subtitle
  - Now Playing information
  - Volume label
  - Track metadata

### UI Components

#### Now Playing Bar (Bottom)
- **Background**: Onyx (#0c0e10) - Deep black base
- **Height**: 150px on desktop, 140px on mobile
- **Elements**:
  - Volume fader (vertical, Silver thumb with Ash Grey progress)
  - Frequency bars (15 bars, 2px width, gradient from Grey to Silver)
  - "NOW PLAYING:" label (Grey color, 0.9rem, 3px letter-spacing)
  - Current section name (Grey color, same size as label)
  - Track information (Ash Grey, italic, 0.65rem)

#### Map Visualizer (Right Sidebar)
- **Position**: Right sidebar on desktop (25% width), top on mobile (full width)
- **Background**: White for contrast with dark UI
- **Technology**: OpenStreetMap with Leaflet.js
- **Features**: Route visualization with real-time position tracking

#### Frequency Bars
- **Count**: 15 bars
- **Width**: 2px each
- **Gradient**: From Grey (#747978) to Silver (#c3c6c8)
- **Animation**: Real-time audio frequency data visualization
- **Shadow**: Subtle glow effect using Ash Grey (#a8b5b2)
- **Height**: Dynamic based on audio analysis

#### Black Bars Overlay
- **Container**: Fixed position, z-index 5 (above media, below UI)
- **Bars**: 4 columns, 25% width each
- **Bottom clearance**: 150px (desktop) / 140px (mobile)
- **Pointer events**: Disabled to allow interaction with underlying elements
- **Script**: Standalone animation loop in main HTML

### Responsive Design

The layout adapts seamlessly for mobile devices:
- **Desktop (>1024px)**:
  - Map: Right sidebar (25% width)
  - Media: Full screen background
  - Black bars: Top to 150px from bottom
  - Controls: Bottom bar (150px height)

- **Mobile (≤1024px)**:
  - Map: Top horizontal strip (150px height)
  - Media: Middle section (between top and bottom bars)
  - Black bars: From 150px top to 140px bottom
  - Controls: Bottom bar (140px height)
  - Reduced spacing and padding for compact layout

## 📁 Project Structure

```
iceland-radio-installation/
├── index.html                  # Main HTML file
├── README.md                   # This file
│
├── src/
│   ├── main.js                 # Application entry point
│   │
│   ├── data/
│   │   └── route-config.js     #  YOUR DATA GOES HERE
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
└── public/
    ├── audio/
    │   ├── section1/
    │   ├── section2/
    │   ├── section3/
    │   └── section4/
    │
    └── media/
        ├── section1/
        │   ├── videos/
        │   └── images/
        ├── section2/
        ├── section3/
        └── section4/
```

## 🚀 Getting Started

### 1. Basic Setup

The project is currently set up with **placeholder data**. Everything works, but you'll need to replace:
- Route GPS coordinates
- Audio file URLs and durations
- Media pool (video/image) URLs

**Visual system is ready to use:**
- Greyscale color palette pre-configured
- Black bars animation system active
- Media desaturation filters applied
- Barlow Condensed font loaded from Google Fonts
- Responsive layout implemented

### 2. Running Locally

Since the project uses ES6 modules, you need a local server:

```bash
# Option 1: Python
python3 -m http.server 8000

# Option 2: Node.js
npx http-server -p 8000

# Option 3: VS Code Live Server extension
```

Then open `http://localhost:8000` in your browser.

### 3. Testing

Open browser console to see detailed logs:
- Timeline position and sync
- Audio file loading and playback
- Media selection and transitions
- Section changes

## Adding Your Data

### Step 1: Prepare Your Audio Files

1. Export your audio tracks as MP3 or AAC files
2. Organize into 4 sections (approximately 8 tracks per section)
3. Name consistently: `track_01.mp3`, `track_02.mp3`, etc.
4. Place in `/public/audio/section1/`, `/section2/`, etc.

### Step 2: Get Audio Durations

```bash
# On Mac/Linux with ffmpeg:
for file in public/audio/section1/*.mp3; do
  duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$file")
  echo "$file: ${duration%.*} seconds"
done
```

### Step 3: Prepare Your Media Files

1. Collect ~50-60 videos and images per section
2. Optimize for web:
   - Videos: H.264 MP4, 720p-1080p, 2-5 Mbps
   - Images: JPEG or WebP, 1920×1080 max, 100-300 KB
3. Organize into folders:
   - `/public/media/section1/videos/`
   - `/public/media/section1/images/`
   - etc.

### Step 4: Provide Your GPS Route

**Best option: GPS Track File**

If you recorded your drive with a GPS device or phone app:
- Export as GPX, KML, or GeoJSON
- Send me the file

**Alternative: Google Maps Route**

Share a Google Maps link with your route

**Alternative: Waypoints**

List major stops:
```
Reykjavik: 64.1466°N, 21.9426°W
Selfoss: 63.9333°N, 20.9833°W
Vik: 63.4186°N, 19.0059°W
Hofn: 64.2539°N, 15.2082°W
```

And tell me which waypoints mark section boundaries.

### Step 5: Update Configuration

Edit `src/data/route-config.js`:

1. Replace `geoPath` arrays with your actual GPS coordinates
2. Replace `audioFiles` arrays with your track URLs and durations
3. Replace `mediaPool` arrays with your video/image URLs

**Or**: Send me your data and I'll create a helper script to generate the config automatically.

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

## Deployment

### Requirements

- HTTPS required (for Web Audio API and autoplay)
- Fast CDN recommended (for 200+ media files)

### Recommended Hosting

1. **Netlify** (easiest)
   - Drag and drop your folder
   - Automatic HTTPS
   - Global CDN

2. **Vercel**
   - Connect to GitHub repo
   - Automatic deployments

3. **AWS S3 + CloudFront**
   - More control
   - Requires setup

### Optimization Checklist

- [ ] Compress images (TinyPNG, ImageOptim)
- [ ] Compress videos (HandBrake, ffmpeg)
- [ ] Test on mobile devices
- [ ] Test on slow connections
- [ ] Enable gzip/brotli compression
- [ ] Set cache headers for media files

## 📱 Mobile Considerations

The installation is **mobile-friendly**, but note:

- Large media files may take time to load on cellular
- Users on metered connections may see loading delays
- Consider adding quality settings (HD/SD) in future

**Current mobile optimizations:**
- Lazy loading (only loads 2-3 media items at a time)
- Responsive layout (map repositions on small screens)
- Touch-friendly UI

## Troubleshooting

### Audio won't play

**Cause**: Autoplay policy requires user interaction

**Solution**: User must click "Tune In" button (already implemented)

### Audio/video drift over time

**Cause**: Browser throttling or network issues

**Solution**: System auto-resyncs every 5 seconds (already implemented)

### Media won't load

**Cause**: CORS restrictions or incorrect file paths

**Solution**: 
- Ensure all files are served from same domain
- Check browser console for 404 errors
- Verify file paths in `route-config.js`

### Map doesn't show route

**Cause**: GPS coordinates incorrect or out of bounds

**Solution**: 
- Verify coordinates are `[latitude, longitude]` format
- Check that latitudes are ~63-66 for Iceland
- Check that longitudes are ~-24 to -13 for Iceland

## Future Enhancements

The architecture is designed to be extensible:

### Audio-Reactive Visuals
```javascript
// Already set up in audio-engine.js
// Add analyzer node:
const analyzer = audioContext.createAnalyser();
source.connect(analyzer);

// Use FFT data to control:
// - Black bar animation speed/intensity
// - Media blur intensity
// - Frequency bar heights (already implemented)
```

### Advanced Visual Effects
```javascript
// In media-display.js, add dynamic shader effects:
// - Audio-reactive blur intensity
// - Dynamic color grading based on section
// - Glitch effects synchronized with black bars
// - Chromatic aberration
```

### Interactive Black Bars
```javascript
// Potential enhancements:
// - Click to manually trigger bar animations
// - Audio-reactive blur (louder = more blur)
// - Section-specific bar behaviors
// - Gradient colors instead of pure black
```

### User Controls
```javascript
// Optional additions:
// - Saturation slider (grayscale ↔ full color)
// - Blur intensity control
// - Black bars on/off toggle
// - Animation speed control
// - Custom color palette picker
```

### Enhanced Map Visualization
```javascript
// Potential improvements:
// - 3D terrain view (Cesium already included)
// - Weather overlay synced to footage
// - Time-of-day lighting
// - Photo markers at GPS coordinates
```

## 📊 Performance Stats

**Current setup (placeholder data):**
- Total duration: ~5 hours 20 minutes
- Total files: 32 audio + 200 media = 232 files
- Bandwidth per user: ~500 MB - 1 GB for full experience
- Memory usage: ~200-300 MB
- CPU usage: Low (plays audio/video natively)

## Customization

### Changing Colors

The entire UI uses the greyscale palette defined in `index.html`. To change the color scheme:

```css
/* In <style> section of index.html */
/* Update these color values throughout: */
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
// Change animation timing (currently 0.3-1.5 seconds)
const randomDelay = (Math.random() * 1.2 + 0.3) * 1000;

// Adjust blur intensity (currently 20-40px)
const randomBlur = Math.floor(Math.random() * 21) + 20;

// Adjust opacity range (currently 0.9-1.0)
const randomOpacity = Math.random() * 0.1 + 0.9;
```

#### Media Desaturation & Contrast
In `src/components/media-display.js`:
```javascript
// Adjust filter values
video.style.filter = 'saturate(0.2) contrast(1.4)';
img.style.filter = 'saturate(0.2) contrast(1.4)';

// Examples:
// More saturated: saturate(0.5)
// More contrast: contrast(1.6)
// Full grayscale: saturate(0) contrast(1.2)
```

#### Frequency Bars
In `index.html`:
```css
.frequency-bar {
  width: 2px;  /* Adjust thickness */
  background: linear-gradient(to top, #747978, #c3c6c8);  /* Change colors */
}
```

### Changing Map Size

In `index.html`:
```css
#right-sidebar {
  width: 25%;   /* Desktop map width (25% of screen) */
}

@media (max-width: 1024px) {
  #right-sidebar {
    height: 150px;  /* Mobile map height */
  }
}
```

### Changing Typography

To use a different font, update the Google Fonts import in `index.html`:
```html
<!-- Replace Barlow Condensed with your preferred font -->
<link href="https://fonts.googleapis.com/css2?family=Your+Font+Name:wght@300;400;500;600&display=swap" rel="stylesheet">
```

Then update the CSS:
```css
body {
  font-family: 'Your Font Name', 'Helvetica Neue', Helvetica, sans-serif;
}
```

### Changing Transitions

In `src/components/media-display.js`:
```javascript
this.crossfadeDuration = 1000; // Milliseconds (currently 1 second)
```

### Adjusting Black Bars Layout

In `index.html`:
```css
.black-bar {
  width: 25%;  /* Change to create different number of bars */
               /* 33.33% for 3 bars, 20% for 5 bars, etc. */
}
```

## 📖 API Reference

### State Manager

```javascript
const state = stateManager.getState();
// Returns: {
//   isPlaying: boolean,
//   currentContext: object,
//   timeline: object,
//   audio: object,
//   media: object
// }
```

### Timeline Engine

```javascript
timeline.seekTo(position);     // Seek to specific second
timeline.resync();              // Force resync to time-of-day
timeline.getDiagnostics();      // Get debug info
```

### Audio Engine

```javascript
audio.setVolume(0.5);          // Set volume (0-1)
audio.pause();                  // Pause playback
audio.resume();                 // Resume playback
```

## Support

For questions or issues:
1. Check browser console for error messages
2. Verify all file paths in `route-config.js`
3. Test with a simple 1-section configuration first
4. Check network tab for failed file loads

## 📄 License

[Your license here]

## Acknowledgments

Built with:
- Web Audio API (with frequency analysis)
- HTML5 Video/Canvas
- CSS backdrop-filter (blur effects)
- Leaflet.js + OpenStreetMap (route visualization)
- Google Fonts (Barlow Condensed)
- Vanilla JavaScript (no frameworks)

**Design Credits:**
- Color palette: [Coolors.co](https://coolors.co/c3c6c8-a8b5b2-747978-323535-0c0e10)
- Typography: Barlow Condensed by Jeremy Tribby

---

**Ready to deploy your Iceland Radio Installation!**
