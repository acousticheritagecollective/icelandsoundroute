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
        bars.forEach((bar, i) => {
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
  let cachedProfile = null;
  
  function buildElevationProfile(geoPath) {
    if (!geoPath || geoPath.length < 2) return null;
    
    const hasAltitude = geoPath[0].length >= 3;
    const elevations = geoPath.map(p => hasAltitude ? p[2] : p[0]);
    const minElev = Math.min(...elevations);
    const maxElev = Math.max(...elevations);
    const range = maxElev - minElev || 1;
    
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
    
    const maxPoints = 200;
    const step = Math.max(1, Math.floor(geoPath.length / maxPoints));
    const points = [];
    
    for (let i = 0; i < geoPath.length; i += step) {
      points.push({
        x: distances[i] / totalDist,
        y: 1 - (elevations[i] - minElev) / range
      });
    }
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
    
    const cx = (p) => p.x * w;
    const cy = (p) => padTop + p.y * drawH;
    
    // Filled area up to progress
    elevationCtx.beginPath();
    elevationCtx.moveTo(cx(points[0]), h);
    elevationCtx.lineTo(cx(points[0]), cy(points[0]));
    
    for (let i = 1; i < points.length; i++) {
      if (points[i].x > progress) {
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
    
    // Full profile line (dim)
    elevationCtx.beginPath();
    elevationCtx.moveTo(cx(points[0]), cy(points[0]));
    for (let i = 1; i < points.length; i++) {
      elevationCtx.lineTo(cx(points[i]), cy(points[i]));
    }
    elevationCtx.strokeStyle = 'rgba(116, 121, 120, 0.3)';
    elevationCtx.lineWidth = 1;
    elevationCtx.stroke();
    
    // Played portion (bright)
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
    
    // Position indicator
    const posX = progress * w;
    
    elevationCtx.beginPath();
    elevationCtx.moveTo(posX, padTop);
    elevationCtx.lineTo(posX, h - padBottom);
    elevationCtx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    elevationCtx.lineWidth = 1;
    elevationCtx.stroke();
    
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
    
    if (context.section.id !== cachedSectionId) {
      cachedSectionId = context.section.id;
      cachedProfile = buildElevationProfile(context.geo.path);
    }
    
    drawElevationProfile(context.section.progressInSection);
  };
  
  // Volume control
  const volumeSlider = document.getElementById('volume-slider');
  if (volumeSlider && app.stateManager?.audioEngine) {
    volumeSlider.addEventListener('input', (e) => {
      const volume = e.target.value / 100;
      if (app.stateManager.audioEngine.masterGainNode) {
        app.stateManager.audioEngine.masterGainNode.gain.value = volume;
      }
    });
  }
});

// ======================================================================
// TAB VISIBILITY HANDLING
// 
// PRINCIPLE: This is a radio — audio NEVER stops.
// Only visual media (videos/images) pauses when tab hidden and
// resumes with fresh content when tab becomes visible again.
// No "Tune In" screen, no restart, no interruption.
// ======================================================================
document.addEventListener('visibilitychange', () => {
  const app = window.radioInstallation;
  if (!app?.stateManager?.isPlaying) return;
  
  if (document.hidden) {
    // --- TAB HIDDEN ---
    console.log('[Visibility] Tab hidden — pausing visual media only');
    
    // 1. Pause media controller (stops image timers and media cycling)
    if (app.stateManager.mediaController) {
      app.stateManager.mediaController.pause();
    }
    
    // 2. Pause video elements to free GPU/memory (videos only, not audio)
    if (app.mediaDisplay) {
      app.mediaDisplay.pauseVideos();
    }
    
    // Audio engine + timeline engine: UNTOUCHED — music keeps playing
    
  } else {
    // --- TAB VISIBLE AGAIN ---
    console.log('[Visibility] Tab visible — resuming visual media');
    
    // 1. Resync timeline to correct any drift accumulated while hidden
    if (app.stateManager.timelineEngine) {
      app.stateManager.timelineEngine.resync();
    }
    
    // 2. Resume AudioContext if browser auto-suspended it
    if (app.stateManager.audioEngine?.audioContext?.state === 'suspended') {
      app.stateManager.audioEngine.audioContext.resume().then(() => {
        console.log('[Visibility] AudioContext resumed');
      });
    }
    
    // 3. Resume media controller — loads a fresh video/image immediately
    if (app.stateManager.mediaController) {
      app.stateManager.mediaController.resume();
    }
  }
});
