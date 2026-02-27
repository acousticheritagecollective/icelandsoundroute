/**
 * MEDIA CONTROLLER
 * 
 * Manages random playback of videos and images from section-specific media pools.
 * 
 * FEATURES:
 * - Random selection from current section's pool
 * - No-repeat until all items shown (then reset and reshuffle)
 * - Lazy loading (only preload current + next 1-2 items)
 * - Crossfade transitions
 * - 10-second display duration for images
 * - Automatic switching when section changes
 * - Tab visibility: suspends cycling when hidden, resumes when visible
 */

export class MediaController {
  constructor(routeMapping) {
    this.routeMapping = routeMapping;
    this.currentSection = null;
    this.currentMedia = null;
    this.nextMedia = null;
    
    // Media state for each section (tracks what's been shown)
    this.sectionStates = {};
    
    // Display settings
    this.imageDuration = 10000; // 10 seconds for images
    this.crossfadeDuration = 1000; // 1 second crossfade
    
    // Preload queue
    this.preloadCache = new Map();
    this.maxCacheSize = 3; // Keep max 3 items preloaded
    
    // Tab visibility — when paused, no new media is loaded or displayed
    this.isPaused = false;
    this.imageTimer = null;
    
    // Callbacks for UI updates
    this.onMediaChange = null;
    this.onMediaReady = null;
    
    // Initialize section states
    this.initializeSectionStates();
  }
  
  /**
   * Initialize media state for all sections
   */
  initializeSectionStates() {
    const sections = this.routeMapping.getAllSections();
    
    sections.forEach(section => {
      this.sectionStates[section.id] = {
        available: [...section.mediaPoolCombined], // Copy of all media items
        shown: [],
        currentlyPlaying: null
      };
    });
    
    console.log('Media controller initialized with', sections.length, 'sections');
  }
  
  /**
   * Start media playback for a given section
   */
  async start(sectionId) {
    this.currentSection = sectionId;
    console.log('Starting media playback for section:', sectionId);
    
    const mediaItem = this.pickNextMedia(sectionId);
    if (!mediaItem) {
      console.error('No media available for section:', sectionId);
      return;
    }
    
    await this.displayMedia(mediaItem);
    this.preloadNext(sectionId);
  }
  
  /**
   * Pick next media item from section's available pool
   * Implements no-repeat logic
   */
  pickNextMedia(sectionId) {
    const state = this.sectionStates[sectionId];
    
    if (state.available.length === 0) {
      console.log(`All media shown for ${sectionId}, resetting pool`);
      state.available = [...state.shown];
      state.shown = [];
      this.shuffleArray(state.available);
    }
    
    const randomIndex = Math.floor(Math.random() * state.available.length);
    const item = state.available[randomIndex];
    
    state.available.splice(randomIndex, 1);
    state.shown.push(item);
    state.currentlyPlaying = item;
    
    return item;
  }
  
  /**
   * Display a media item (video or image)
   */
  async displayMedia(mediaItem) {
    // Don't load anything while paused (tab hidden)
    if (this.isPaused) {
      console.log('MediaController: Skipping display, tab is hidden');
      return;
    }
    
    this.currentMedia = mediaItem;
    console.log('Displaying:', mediaItem.type, mediaItem.url);
    
    if (this.onMediaChange) {
      this.onMediaChange(mediaItem);
    }
    
    // Clear any previous image timer
    if (this.imageTimer) {
      clearTimeout(this.imageTimer);
      this.imageTimer = null;
    }
    
    if (mediaItem.type === 'image') {
      this.imageTimer = setTimeout(() => {
        this.imageTimer = null;
        this.transitionToNext();
      }, this.imageDuration);
    }
    // Videos trigger transitionToNext() on 'ended' event (handled by media-display)
  }
  
  /**
   * Transition to next media item
   */
  async transitionToNext() {
    // Don't transition while paused
    if (this.isPaused) {
      console.log('MediaController: Skipping transition, tab is hidden');
      return;
    }
    
    const currentContext = this.getCurrentContext();
    if (!currentContext) return;
    
    const newSectionId = currentContext.section.id;
    
    if (newSectionId !== this.currentSection) {
      console.log('Section changed from', this.currentSection, 'to', newSectionId);
      this.currentSection = newSectionId;
    }
    
    const nextMedia = this.pickNextMedia(this.currentSection);
    if (!nextMedia) return;
    
    await this.displayMedia(nextMedia);
    this.preloadNext(this.currentSection);
  }
  
  /**
   * Pause media cycling (called when tab hidden)
   * Only affects visual media — audio is untouched
   */
  pause() {
    if (this.isPaused) return;
    this.isPaused = true;
    
    // Cancel pending image timer
    if (this.imageTimer) {
      clearTimeout(this.imageTimer);
      this.imageTimer = null;
    }
    
    console.log('MediaController: Paused (tab hidden)');
  }
  
  /**
   * Resume media cycling (called when tab visible again)
   * Loads a fresh media item immediately
   */
  resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    
    console.log('MediaController: Resuming (tab visible)');
    
    // Clear stale preload cache (resources may have been freed by browser)
    this.preloadCache.clear();
    
    // Force load a fresh media item if we have a current section
    if (this.currentSection) {
      // Small delay to let browser re-allocate resources
      setTimeout(() => {
        if (!this.isPaused) {
          this.transitionToNext();
        }
      }, 200);
    }
  }
  
  /**
   * Preload next media item
   */
  async preloadNext(sectionId) {
    if (this.isPaused) return;
    
    const state = this.sectionStates[sectionId];
    if (state.available.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * state.available.length);
    const nextItem = state.available[randomIndex];
    
    if (this.preloadCache.has(nextItem.url)) return;
    
    if (this.preloadCache.size >= this.maxCacheSize) {
      const firstKey = this.preloadCache.keys().next().value;
      this.preloadCache.delete(firstKey);
    }
    
    console.log('Preloading:', nextItem.type, nextItem.url);
    
    if (nextItem.type === 'video') {
      const video = document.createElement('video');
      video.src = nextItem.url;
      video.preload = 'auto';
      this.preloadCache.set(nextItem.url, video);
    } else if (nextItem.type === 'image') {
      const img = new Image();
      img.src = nextItem.url;
      this.preloadCache.set(nextItem.url, img);
    }
    
    this.nextMedia = nextItem;
  }
  
  /**
   * Set state manager reference for context access
   */
  setStateManager(stateManager) {
    this.stateManager = stateManager;
  }
  
  /**
   * Get current context from state manager
   */
  getCurrentContext() {
    if (this.stateManager && this.stateManager.currentContext) {
      return this.stateManager.currentContext;
    }
    return null;
  }
  
  /**
   * Handle section change
   */
  onSectionChange(newSectionId) {
    if (this.currentSection === newSectionId) return;
    
    console.log('Media controller: Section changed to', newSectionId);
    this.currentSection = newSectionId;
    
    this.preloadCache.clear();
    if (!this.isPaused) {
      this.preloadNext(newSectionId);
    }
  }
  
  /**
   * Force immediate transition (for testing/debugging)
   */
  forceNext() {
    this.transitionToNext();
  }
  
  /**
   * Shuffle array in place (Fisher-Yates algorithm)
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  
  /**
   * Get current media state
   */
  getState() {
    return {
      currentSection: this.currentSection,
      currentMedia: this.currentMedia,
      nextMedia: this.nextMedia,
      isPaused: this.isPaused,
      cacheSize: this.preloadCache.size,
      sectionStates: Object.fromEntries(
        Object.entries(this.sectionStates).map(([id, state]) => [
          id,
          {
            available: state.available.length,
            shown: state.shown.length
          }
        ])
      )
    };
  }
  
  /**
   * Reset all section states (for testing)
   */
  reset() {
    this.initializeSectionStates();
    this.preloadCache.clear();
    this.currentMedia = null;
    this.nextMedia = null;
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    if (this.imageTimer) {
      clearTimeout(this.imageTimer);
      this.imageTimer = null;
    }
    this.preloadCache.clear();
    this.currentMedia = null;
    this.nextMedia = null;
  }
}
