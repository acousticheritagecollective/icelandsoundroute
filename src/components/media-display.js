/**
 * MEDIA DISPLAY COMPONENT
 * 
 * Handles visual rendering of videos and images with crossfade transitions.
 * Manages two layers (current and next) for smooth transitions.
 * 
 * FEATURES:
 * - Crossfade transitions between media
 * - Support for both video and image
 * - Responsive sizing (cover mode)
 * - Event handling for media end
 */

export class MediaDisplay {
  constructor(container, mediaController) {
    this.container = container;
    this.mediaController = mediaController;
    
    // Display layers
    this.currentLayer = null;
    this.nextLayer = null;
    
    // Settings
    this.crossfadeDuration = 1000; // 1 second
    
    this.initialize();
    this.wireMediaController();
  }
  
  /**
   * Initialize display layers
   */
  initialize() {
    // Create two layers for crossfading
    this.currentLayer = this.createLayer('current');
    this.nextLayer = this.createLayer('next');
    
    this.container.appendChild(this.currentLayer.element);
    this.container.appendChild(this.nextLayer.element);
    
    // Initially show current layer
    this.currentLayer.element.style.opacity = '1';
    this.nextLayer.element.style.opacity = '0';
  }
  
  /**
   * Create a display layer
   */
  createLayer(id) {
    const element = document.createElement('div');
    element.className = 'media-layer';
    element.id = `media-layer-${id}`;
    
    // Styling
    element.style.position = 'absolute';
    element.style.top = '0';
    element.style.left = '0';
    element.style.width = '100%';
    element.style.height = '100%';
    element.style.transition = `opacity ${this.crossfadeDuration}ms ease-in-out`;
    element.style.display = 'flex';
    element.style.alignItems = 'center';
    element.style.justifyContent = 'center';
    element.style.overflow = 'hidden';
    element.style.backgroundColor = '#000';
    
    return {
      element,
      mediaElement: null,
      currentMedia: null
    };
  }
  
  /**
   * Wire up media controller callbacks
   */
  wireMediaController() {
    this.mediaController.onMediaChange = (mediaItem) => {
      this.displayMedia(mediaItem);
    };
  }
  
  /**
   * Display new media item with crossfade
   */
  async displayMedia(mediaItem) {
    console.log('MediaDisplay: Showing', mediaItem.type, mediaItem.url);
    
    // Create media element based on type
    let mediaElement;
    if (mediaItem.type === 'video') {
      mediaElement = await this.createVideoElement(mediaItem.url);
    } else {
      mediaElement = await this.createImageElement(mediaItem.url);
    }
    
    // Determine which layer to use (swap between current and next)
    const targetLayer = this.currentLayer.element.style.opacity === '1' 
      ? this.nextLayer 
      : this.currentLayer;
    
    const oldLayer = targetLayer === this.currentLayer 
      ? this.nextLayer 
      : this.currentLayer;
    
    // Clear old content from target layer
    if (targetLayer.mediaElement) {
      if (targetLayer.mediaElement.tagName === 'VIDEO') {
        targetLayer.mediaElement.pause();
      }
      targetLayer.element.innerHTML = '';
    }
    
    // Add new media to target layer
    targetLayer.element.appendChild(mediaElement);
    targetLayer.mediaElement = mediaElement;
    targetLayer.currentMedia = mediaItem;
    
    // Crossfade
    await this.crossfade(oldLayer.element, targetLayer.element);
    
    // Set up event handlers
    if (mediaItem.type === 'video') {
      mediaElement.addEventListener('ended', () => {
        this.onMediaEnded();
      });
      
      // Start playing
      try {
        await mediaElement.play();
      } catch (error) {
        console.error('Error playing video:', error);
      }
    } else {
      // Image - will auto-transition after duration (handled by media controller)
    }
  }
  
  /**
   * Create video element
   */
  async createVideoElement(url) {
    const video = document.createElement('video');
    video.src = url;
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';
    video.muted = true; // Videos are visual only, audio comes from audio engine
    video.playsInline = true;
    video.preload = 'auto';
    
    return video;
  }
  
  /**
   * Create image element
   */
  async createImageElement(url) {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      img.src = url;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    });
  }
  
  /**
   * Crossfade between two layers
   */
  async crossfade(fadeOut, fadeIn) {
    return new Promise((resolve) => {
      // Start fade
      fadeOut.style.opacity = '0';
      fadeIn.style.opacity = '1';
      
      // Wait for transition to complete
      setTimeout(() => {
        resolve();
      }, this.crossfadeDuration);
    });
  }
  
  /**
   * Handle media ended event
   */
  onMediaEnded() {
    console.log('Media ended, transitioning to next...');
    this.mediaController.transitionToNext();
  }
  
  /**
   * Get current display state
   */
  getState() {
    return {
      currentLayer: this.currentLayer.currentMedia,
      nextLayer: this.nextLayer.currentMedia
    };
  }
  
  /**
   * Clean up
   */
  destroy() {
    if (this.currentLayer.mediaElement?.tagName === 'VIDEO') {
      this.currentLayer.mediaElement.pause();
    }
    if (this.nextLayer.mediaElement?.tagName === 'VIDEO') {
      this.nextLayer.mediaElement.pause();
    }
    
    this.container.innerHTML = '';
  }
}
