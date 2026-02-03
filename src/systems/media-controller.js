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
 * 
 * ARCHITECTURE:
 * - Maintains state for each section (available/shown items)
 * - Preloads minimal assets to save bandwidth
 * - Handles both video and image types seamlessly
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
   * 
   * @param {string} sectionId - Section ID
   */
  async start(sectionId) {
    this.currentSection = sectionId;
    console.log('Starting media playback for section:', sectionId);
    
    // Pick first media item
    const mediaItem = this.pickNextMedia(sectionId);
    if (!mediaItem) {
      console.error('No media available for section:', sectionId);
      return;
    }
    
    // Load and display it
    await this.displayMedia(mediaItem);
    
    // Preload next item
    this.preloadNext(sectionId);
  }
  
  /**
   * Pick next media item from section's available pool
   * Implements no-repeat logic
   * 
   * @param {string} sectionId - Section ID
   * @returns {object} Media item {url, type}
   */
  pickNextMedia(sectionId) {
    const state = this.sectionStates[sectionId];
    
    // If no items available, reset (move all shown back to available)
    if (state.available.length === 0) {
      console.log(`All media shown for ${sectionId}, resetting pool`);
      state.available = [...state.shown];
      state.shown = [];
      
      // Shuffle for variety
      this.shuffleArray(state.available);
    }
    
    // Pick random item from available
    const randomIndex = Math.floor(Math.random() * state.available.length);
    const item = state.available[randomIndex];
    
    // Move from available to shown
    state.available.splice(randomIndex, 1);
    state.shown.push(item);
    
    state.currentlyPlaying = item;
    
    return item;
  }
  
  /**
   * Display a media item (video or image)
   * 
   * @param {object} mediaItem - {url, type}
   */
  async displayMedia(mediaItem) {
    this.currentMedia = mediaItem;
    
    console.log('Displaying:', mediaItem.type, mediaItem.url);
    
    // Notify UI to display this media
    if (this.onMediaChange) {
      this.onMediaChange(mediaItem);
    }
    
    // Set up automatic transition to next item
    if (mediaItem.type === 'image') {
      // Images display for fixed duration
      setTimeout(() => {
        this.transitionToNext();
      }, this.imageDuration);
    }
    // Videos will trigger transitionToNext() on 'ended' event (handled by UI)
  }
  
  /**
   * Transition to next media item
   */
  async transitionToNext() {
    // Check if section changed
    const currentContext = this.getCurrentContext();
    if (!currentContext) return;
    
    const newSectionId = currentContext.section.id;
    
    // If section changed, switch pools
    if (newSectionId !== this.currentSection) {
      console.log('Section changed from', this.currentSection, 'to', newSectionId);
      this.currentSection = newSectionId;
    }
    
    // Pick next media from current section
    const nextMedia = this.pickNextMedia(this.currentSection);
    if (!nextMedia) return;
    
    // Display it
    await this.displayMedia(nextMedia);
    
    // Preload next
    this.preloadNext(this.currentSection);
  }
  
  /**
   * Preload next media item
   * Only keeps 2-3 items cached to save bandwidth
   * 
   * @param {string} sectionId - Section ID
   */
  async preloadNext(sectionId) {
    // Peek at what would be next without removing from available
    const state = this.sectionStates[sectionId];
    
    if (state.available.length === 0) return; // Will reset on next pick
    
    // Pick a random item to preload (don't remove it yet)
    const randomIndex = Math.floor(Math.random() * state.available.length);
    const nextItem = state.available[randomIndex];
    
    // Check if already in cache
    if (this.preloadCache.has(nextItem.url)) {
      return;
    }
    
    // Clean cache if too large
    if (this.preloadCache.size >= this.maxCacheSize) {
      const firstKey = this.preloadCache.keys().next().value;
      this.preloadCache.delete(firstKey);
    }
    
    console.log('Preloading:', nextItem.type, nextItem.url);
    
    // Preload based on type
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
   * Used to detect section changes
   */
  getCurrentContext() {
    if (this.stateManager && this.stateManager.currentContext) {
      return this.stateManager.currentContext;
    }
    return null;
  }
  
  /**
   * Handle section change
   * Called by state manager when timeline crosses section boundary
   * 
   * @param {string} newSectionId - New section ID
   */
  onSectionChange(newSectionId) {
    if (this.currentSection === newSectionId) return;
    
    console.log('Media controller: Section changed to', newSectionId);
    this.currentSection = newSectionId;
    
    // Note: We don't immediately cut the current media
    // We let it finish, then next item will be from new section
    // This creates a smoother transition
    
    // But we do clear preload cache and preload from new section
    this.preloadCache.clear();
    this.preloadNext(newSectionId);
  }
  
  /**
   * Force immediate transition (for testing/debugging)
   */
  forceNext() {
    this.transitionToNext();
  }
  
  /**
   * Shuffle array in place (Fisher-Yates algorithm)
   * 
   * @param {Array} array - Array to shuffle
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  
  /**
   * Get current media state
   * 
   * @returns {object} Current state
   */
  getState() {
    return {
      currentSection: this.currentSection,
      currentMedia: this.currentMedia,
      nextMedia: this.nextMedia,
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
    this.preloadCache.clear();
    this.currentMedia = null;
    this.nextMedia = null;
  }
}
