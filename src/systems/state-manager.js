/**
 * STATE MANAGER
 * 
 * Central coordinator that wires all systems together.
 * Manages initialization sequence and data flow between systems.
 * 
 * RESPONSIBILITIES:
 * - Initialize all systems in correct order
 * - Wire timeline updates to all dependent systems
 * - Handle user interactions (start/pause)
 * - Manage error states and recovery
 * - Provide unified API for UI components
 * 
 * DATA FLOW:
 * Timeline Engine → Route Mapping → Audio Engine + Media Controller + Map Visualizer
 */

import { TimelineEngine } from './timeline-engine.js';
import { RouteMapping } from './route-mapping.js';
import { AudioEngine } from './audio-engine.js';
import { MediaController } from './media-controller.js';

export class StateManager {
  constructor(routeConfig) {
    this.routeConfig = routeConfig;
    
    // System instances
    this.routeMapping = null;
    this.timelineEngine = null;
    this.audioEngine = null;
    this.mediaController = null;
    
    // State
    this.isInitialized = false;
    this.isPlaying = false;
    this.currentContext = null;
    this.lastSectionId = null;
    
    // UI callbacks
    this.onStateChange = null;
    this.onContextChange = null;
    this.onError = null;
  }
  
  /**
   * Initialize all systems
   * Must be called before start()
   */
  async initialize() {
    try {
      console.log('=== Initializing Radio Installation ===');
      
      // 1. Initialize route mapping (needs config)
      console.log('1. Initializing route mapping...');
      this.routeMapping = new RouteMapping(this.routeConfig);
      const totalDuration = this.routeMapping.getTotalDuration();
      console.log(`   Total duration: ${totalDuration}s (${(totalDuration / 60).toFixed(1)} min)`);
      
      // 2. Initialize timeline engine (needs total duration)
      console.log('2. Initializing timeline engine...');
      this.timelineEngine = new TimelineEngine(totalDuration);
      
      // 3. Initialize audio engine (needs route mapping)
      console.log('3. Initializing audio engine...');
      this.audioEngine = new AudioEngine(this.routeMapping);
      await this.audioEngine.initialize();
      
      // 4. Initialize media controller (needs route mapping)
      console.log('4. Initializing media controller...');
      this.mediaController = new MediaController(this.routeMapping);
      
      // Give media controller access to state manager for context
      this.mediaController.setStateManager(this);
      
      // 5. Wire up timeline updates
      console.log('5. Wiring systems together...');
      this.timelineEngine.subscribe((timelineData) => {
        this.onTimelineUpdate(timelineData);
      });
      
      this.isInitialized = true;
      console.log('=== Initialization Complete ===');
      
      return true;
      
    } catch (error) {
      console.error('Initialization failed:', error);
      if (this.onError) {
        this.onError({
          type: 'initialization',
          message: 'Failed to initialize radio installation',
          error
        });
      }
      return false;
    }
  }
  
  /**
   * Start the installation
   * User must have interacted with page first (for autoplay policy)
   */
  async start() {
    if (!this.isInitialized) {
      console.error('Cannot start: not initialized');
      return false;
    }
    
    if (this.isPlaying) {
      console.warn('Already playing');
      return true;
    }
    
    try {
      console.log('=== Starting Playback ===');
      
      // Calculate entry point
      const entryPosition = this.timelineEngine.calculatePositionFromTimeOfDay();
      console.log(`Entry position: ${entryPosition.toFixed(2)}s`);
      
      // Get context for entry position
      const context = this.routeMapping.getContextAtPosition(entryPosition);
      console.log(`Starting in section: ${context.section.name}`);
      console.log(`Starting with audio: ${context.audio.file.url}`);
      
      // Start timeline
      this.timelineEngine.start();
      
      // Start audio at correct position
      await this.audioEngine.startAtPosition(entryPosition);
      
      // Start media for current section
      await this.mediaController.start(context.section.id);
      
      this.isPlaying = true;
      this.currentContext = context;
      this.lastSectionId = context.section.id;
      
      // Notify UI
      if (this.onStateChange) {
        this.onStateChange({
          isPlaying: true,
          context
        });
      }
      
      console.log('=== Playback Started ===');
      return true;
      
    } catch (error) {
      console.error('Failed to start playback:', error);
      if (this.onError) {
        this.onError({
          type: 'playback',
          message: 'Failed to start playback',
          error
        });
      }
      return false;
    }
  }
  
  /**
   * Handle timeline updates
   * Called 60 times per second by timeline engine
   * 
   * @param {object} timelineData - {position, progress, totalDuration, timestamp}
   */
  onTimelineUpdate(timelineData) {
    // Get current context
    const context = this.routeMapping.getContextAtPosition(timelineData.position);
    if (!context) return;
    
    this.currentContext = context;
    
    // Update audio engine
    this.audioEngine.update(timelineData);
    
    // Update now playing display
    const sectionEl = document.getElementById('current-section');
    const trackEl = document.getElementById('current-track');
    const nextTrackEl = document.getElementById('next-track');
    
    if (sectionEl && trackEl) {
      // Current section name
      sectionEl.textContent = `Now Playing: ${context.section.name}`;
      
      // Current track info
      const trackNumber = context.audio.file.index + 1;
      const sectionNumber = context.section.index + 1;
      const fileName = context.audio.file.url.split('/').pop().replace('.mp3', '');
      trackEl.textContent = `Track ${trackNumber} of 8 • ${fileName}`;
      
      // Next track info
      if (nextTrackEl) {
        const nextTrackIndex = context.audio.file.index + 1;
        const totalTracksInSection = 8;
        
        if (nextTrackIndex < totalTracksInSection) {
          // Next track in same section
          const section = this.routeMapping.getSectionByIndex(context.section.index);
          const nextFile = section.audioFiles[nextTrackIndex];
          const nextFileName = nextFile.url.split('/').pop().replace('.mp3', '');
          nextTrackEl.textContent = `Next: ${nextFileName}`;
        } else {
          // Next section
          const nextSectionIndex = context.section.index + 1;
          if (nextSectionIndex < 4) {
            const nextSection = this.routeMapping.getSectionByIndex(nextSectionIndex);
            nextTrackEl.textContent = `Next: ${nextSection.name}`;
          } else {
            nextTrackEl.textContent = `Next: Back to start`;
          }
        }
      }
    }
    
    // Check for section change
    if (context.section.id !== this.lastSectionId) {
      console.log(`Section transition: ${this.lastSectionId} → ${context.section.id}`);
      this.lastSectionId = context.section.id;
      
      // Notify media controller
      this.mediaController.onSectionChange(context.section.id);
      
      // Notify UI
      if (this.onContextChange) {
        this.onContextChange(context);
      }
    }
    
    // Notify UI of position updates (throttled to avoid overwhelming)
    // UI can subscribe to this for map updates, progress bars, etc.
    if (this.onContextChange) {
      this.onContextChange(context);
    }
  }
  
  /**
   * Pause playback
   */
  pause() {
    if (!this.isPlaying) return;
    
    this.timelineEngine.stop();
    this.audioEngine.pause();
    this.isPlaying = false;
    
    console.log('Playback paused');
    
    if (this.onStateChange) {
      this.onStateChange({
        isPlaying: false,
        context: this.currentContext
      });
    }
  }
  
  /**
   * Resume playback
   */
  async resume() {
    if (this.isPlaying) return;
    
    this.timelineEngine.start();
    await this.audioEngine.resume();
    this.isPlaying = true;
    
    console.log('Playback resumed');
    
    if (this.onStateChange) {
      this.onStateChange({
        isPlaying: true,
        context: this.currentContext
      });
    }
  }
  
  /**
   * Set volume (0-1)
   */
  setVolume(volume) {
    if (this.audioEngine) {
      this.audioEngine.setVolume(volume);
    }
  }
  
  /**
   * Get current state
   * Useful for debugging and UI updates
   */
  getState() {
    return {
      isInitialized: this.isInitialized,
      isPlaying: this.isPlaying,
      currentContext: this.currentContext,
      timeline: this.timelineEngine?.getDiagnostics(),
      audio: this.audioEngine?.getState(),
      media: this.mediaController?.getState()
    };
  }
  
  /**
   * Seek to specific position (for testing/debugging)
   * Note: In production, timeline is driven by time-of-day only
   */
  async seekTo(position) {
    console.log('Seeking to position:', position);
    
    this.timelineEngine.seekTo(position);
    
    const context = this.routeMapping.getContextAtPosition(position);
    if (context) {
      await this.audioEngine.startAtPosition(position);
      
      if (context.section.id !== this.lastSectionId) {
        this.mediaController.onSectionChange(context.section.id);
        this.lastSectionId = context.section.id;
      }
    }
  }
  
  /**
   * Get route information
   * For visualizations and UI
   */
  getRouteInfo() {
    return {
      sections: this.routeMapping.getAllSections(),
      totalDuration: this.routeMapping.getTotalDuration(),
      totalDistance: this.routeMapping.totalDistance
    };
  }
  
  /**
   * Clean up all resources
   */
  destroy() {
    if (this.timelineEngine) {
      this.timelineEngine.stop();
    }
    if (this.audioEngine) {
      this.audioEngine.destroy();
    }
    if (this.mediaController) {
      this.mediaController.destroy();
    }
    
    this.isInitialized = false;
    this.isPlaying = false;
  }
}
