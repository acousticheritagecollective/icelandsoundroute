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
import { EarthquakeMonitor } from './components/earthquake-monitor.js';
import { UI } from './components/ui.js';

class RadioInstallation {
  constructor() {
    this.stateManager = null;
    this.mediaDisplay = null;
    this.mapVisualizer = null;
    this.earthquakeMonitor = null;
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
      const earthquakeContainer = document.getElementById('earthquake-monitor');
      const uiContainer = document.getElementById('ui-container');
      
      if (!mediaContainer || !mapContainer || !earthquakeContainer || !uiContainer) {
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
      
      // Initialize earthquake monitor
      this.earthquakeMonitor = new EarthquakeMonitor(earthquakeContainer);
      
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
    
    // Earthquake monitor updates on its own timer, no need to update here
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
