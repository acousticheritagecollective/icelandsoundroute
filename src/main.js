/**
 * ICELAND RADIO INSTALLATION
 * Main Application Entry Point
 * 
 * This file initializes and coordinates all systems.
 */

import { routeConfig } from './data/route-config.js';
import { StateManager } from './systems/state-manager.js';
import { MediaDisplay } from './components/media-display.js';
import { MapVisualizer } from './components/map-visualizer.js';
import { UI } from './components/ui.js';

class RadioInstallation {
  constructor() {
    this.stateManager = null;
    this.mediaDisplay = null;
    this.mapVisualizer = null;
    this.ui = null;
    
    this.isInitialized = false;
  }
  
  /**
   * Initialize the installation
   */
  async initialize() {
    try {
      console.log('=== Iceland Radio Installation ===');
      console.log('Initializing...');
      
      // Get DOM containers
      const mediaContainer = document.getElementById('media-container');
      const mapContainer = document.getElementById('map-container');
      const uiContainer = document.getElementById('ui-container');
      
      if (!mediaContainer || !mapContainer || !uiContainer) {
        throw new Error('Required DOM containers not found');
      }
      
      // Initialize state manager
      this.stateManager = new StateManager(routeConfig);
      await this.stateManager.initialize();
      
      // Initialize UI (includes tune-in button)
      this.ui = new UI(uiContainer, this.stateManager);
      
      // Initialize map visualizer
      this.mapVisualizer = new MapVisualizer(mapContainer);
      const routeInfo = this.stateManager.getRouteInfo();
      this.mapVisualizer.loadRoute(routeInfo.sections);
      
      // Initialize media display
      this.mediaDisplay = new MediaDisplay(
        mediaContainer,
        this.stateManager.mediaController
      );
      
      // Wire up state manager callbacks
      this.stateManager.onContextChange = (context) => {
        this.onContextChange(context);
      };
      
      this.stateManager.onError = (error) => {
        this.onError(error);
      };
      
      this.isInitialized = true;
      console.log('Initialization complete');
      console.log('Waiting for user interaction...');
      
    } catch (error) {
      console.error('Failed to initialize:', error);
      if (this.ui) {
        this.ui.showError('Failed to initialize. Please refresh the page.');
      }
    }
  }
  
  /**
   * Handle context changes (timeline updates)
   */
  onContextChange(context) {
    // Update map visualization
    if (this.mapVisualizer) {
      this.mapVisualizer.update(context);
    }
  }
  
  /**
   * Handle errors
   */
  onError(error) {
    console.error('Application error:', error);
    if (this.ui) {
      this.ui.showError(error.message);
    }
  }
  
  /**
   * Clean up and destroy
   */
  destroy() {
    if (this.stateManager) {
      this.stateManager.destroy();
    }
    if (this.mediaDisplay) {
      this.mediaDisplay.destroy();
    }
    if (this.mapVisualizer) {
      this.mapVisualizer.destroy();
    }
    if (this.ui) {
      this.ui.destroy();
    }
  }
}

// Create and initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const app = new RadioInstallation();
  await app.initialize();
  
  // Make app instance globally accessible for debugging
  window.radioInstallation = app;
  
  // Animate frequency bars with REAL audio data
  const bars = document.querySelectorAll('.frequency-bar');
  
  function updateFrequencyBars() {
    if (app.stateManager?.audioEngine?.analyser) {
      const freqData = app.stateManager.audioEngine.getFrequencyData();
      
      if (freqData) {
        // Update each bar with real frequency data
        bars.forEach((bar, i) => {
          // Map frequency data (0-255) to height (5-40px)
          const value = freqData[i] || 0;
          const height = (value / 255) * 35 + 5;
          bar.style.height = `${height}px`;
        });
      }
    }
    
    requestAnimationFrame(updateFrequencyBars);
  }
  
  // Start animation loop
  updateFrequencyBars();
  
  // === ELEVATION PROFILE ===
  const elevationCanvas = document.getElementById('elevation-profile');
  const elevationCtx = elevationCanvas ? elevationCanvas.getContext('2d') : null;
  const elevationLabel = document.getElementById('elevation-section-label');
  let cachedSectionId = null;
  let cachedProfile = null; // { points: [{x, y}], minElev, maxElev }
  
  function buildElevationProfile(geoPath) {
    if (!geoPath || geoPath.length < 2) return null;
    
    // Use real altitude (index 2) if available, otherwise fallback to latitude
    const hasAltitude = geoPath[0].length >= 3;
    const elevations = geoPath.map(p => hasAltitude ? p[2] : p[0]);
    const minElev = Math.min(...elevations);
    const maxElev = Math.max(...elevations);
    const range = maxElev - minElev || 1;
    
    // Compute cumulative distance along path for proper X spacing
    const distances = [0];
    for (let i = 1; i < geoPath.length; i++) {
      const [lat1, lng1] = geoPath[i - 1];
      const [lat2, lng2] = geoPath[i];
      const dlat = lat2 - lat1;
      const dlng = lng2 - lng1;
      const d = Math.sqrt(dlat * dlat + dlng * dlng);
      distances.push(distances[i - 1] + d);
    }
    const totalDist = distances[distances.length - 1] || 1;
    
    // Sample ~200 points max for smooth rendering
    const maxPoints = 200;
    const step = Math.max(1, Math.floor(geoPath.length / maxPoints));
    const points = [];
    
    for (let i = 0; i < geoPath.length; i += step) {
      points.push({
        x: distances[i] / totalDist,           // 0-1 normalized X
        y: 1 - (elevations[i] - minElev) / range      // 0-1 normalized Y (inverted for canvas)
      });
    }
    // Always include last point
    const lastIdx = geoPath.length - 1;
    if (points[points.length - 1].x < 1) {
      points.push({
        x: 1,
        y: 1 - (elevations[lastIdx] - minElev) / range
      });
    }
    
    return { points, minElev, maxElev };
  }
  
  function drawElevationProfile(progress) {
    if (!elevationCtx || !cachedProfile) return;
    
    const canvas = elevationCanvas;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set canvas resolution to match display size
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      elevationCtx.scale(dpr, dpr);
    }
    
    const w = rect.width;
    const h = rect.height;
    const padTop = 8;
    const padBottom = 4;
    const drawH = h - padTop - padBottom;
    const points = cachedProfile.points;
    
    elevationCtx.clearRect(0, 0, w, h);
    
    if (points.length < 2) return;
    
    // Helper: get canvas coords
    const cx = (p) => p.x * w;
    const cy = (p) => padTop + p.y * drawH;
    
    // --- Draw filled area up to current progress (subtle) ---
    elevationCtx.beginPath();
    elevationCtx.moveTo(cx(points[0]), h);
    elevationCtx.lineTo(cx(points[0]), cy(points[0]));
    
    for (let i = 1; i < points.length; i++) {
      if (points[i].x > progress) {
        // Interpolate to exact progress point
        const prev = points[i - 1];
        const curr = points[i];
        const t = (progress - prev.x) / (curr.x - prev.x);
        const interpY = prev.y + (curr.y - prev.y) * t;
        elevationCtx.lineTo(progress * w, padTop + interpY * drawH);
        break;
      }
      elevationCtx.lineTo(cx(points[i]), cy(points[i]));
    }
    
    elevationCtx.lineTo(progress * w, h);
    elevationCtx.closePath();
    
    const grad = elevationCtx.createLinearGradient(0, padTop, 0, h);
    grad.addColorStop(0, 'rgba(168, 181, 178, 0.15)');
    grad.addColorStop(1, 'rgba(168, 181, 178, 0.02)');
    elevationCtx.fillStyle = grad;
    elevationCtx.fill();
    
    // --- Draw full profile line (dim, ahead of position) ---
    elevationCtx.beginPath();
    elevationCtx.moveTo(cx(points[0]), cy(points[0]));
    for (let i = 1; i < points.length; i++) {
      elevationCtx.lineTo(cx(points[i]), cy(points[i]));
    }
    elevationCtx.strokeStyle = 'rgba(116, 121, 120, 0.3)';
    elevationCtx.lineWidth = 1;
    elevationCtx.stroke();
    
    // --- Draw played portion (bright) ---
    elevationCtx.beginPath();
    elevationCtx.moveTo(cx(points[0]), cy(points[0]));
    
    let posY = cy(points[0]);
    for (let i = 1; i < points.length; i++) {
      if (points[i].x > progress) {
        const prev = points[i - 1];
        const curr = points[i];
        const t = (progress - prev.x) / (curr.x - prev.x);
        const interpY = prev.y + (curr.y - prev.y) * t;
        posY = padTop + interpY * drawH;
        elevationCtx.lineTo(progress * w, posY);
        break;
      }
      elevationCtx.lineTo(cx(points[i]), cy(points[i]));
      posY = cy(points[i]);
    }
    elevationCtx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    elevationCtx.lineWidth = 1.5;
    elevationCtx.stroke();
    
    // --- Position indicator: vertical line + dot ---
    const posX = progress * w;
    
    // Vertical line
    elevationCtx.beginPath();
    elevationCtx.moveTo(posX, padTop);
    elevationCtx.lineTo(posX, h - padBottom);
    elevationCtx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    elevationCtx.lineWidth = 1;
    elevationCtx.stroke();
    
    // Dot
    elevationCtx.beginPath();
    elevationCtx.arc(posX, posY, 3, 0, Math.PI * 2);
    elevationCtx.fillStyle = '#ffffff';
    elevationCtx.fill();
    elevationCtx.beginPath();
    elevationCtx.arc(posX, posY, 5, 0, Math.PI * 2);
    elevationCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    elevationCtx.lineWidth = 1;
    elevationCtx.stroke();
  }
  
  // Update elevation profile on context changes
  const origOnContextChange = app.stateManager.onContextChange;
  app.stateManager.onContextChange = (context) => {
    if (origOnContextChange) origOnContextChange(context);
    
    if (!context) return;
    
    // Rebuild profile if section changed
    if (context.section.id !== cachedSectionId) {
      cachedSectionId = context.section.id;
      cachedProfile = buildElevationProfile(context.geo.path);
    }
    
    // Draw with current progress
    drawElevationProfile(context.section.progressInSection);
  };
  
  // Volume control
  const volumeSlider = document.getElementById('volume-slider');
  if (volumeSlider && app.stateManager?.audioEngine) {
    volumeSlider.addEventListener('input', (e) => {
      const volume = e.target.value / 100; // Convert 0-100 to 0-1
      if (app.stateManager.audioEngine.masterGainNode) {
        app.stateManager.audioEngine.masterGainNode.gain.value = volume;
      }
    });
  }
});

// Handle page visibility changes (pause when tab hidden, resume when visible)
document.addEventListener('visibilitychange', () => {
  if (window.radioInstallation?.stateManager) {
    if (document.hidden) {
      console.log('Tab hidden, pausing...');
      // Note: We don't pause timeline - it continues in background
      // This maintains sync with time-of-day
    } else {
      console.log('Tab visible, checking sync...');
      // Timeline will auto-resync on next sync check
      window.radioInstallation.stateManager.timelineEngine?.resync();
    }
  }
});
