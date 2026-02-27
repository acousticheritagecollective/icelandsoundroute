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
 * - Error recovery: skips broken media, retries on failure
 * - Tab visibility: pauses videos when hidden, recovers when visible
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
    
    // Error tracking
    this.consecutiveErrors = 0;
    this.maxConsecutiveErrors = 3;
    
    this.initialize();
    this.wireMediaController();
  }
  
  /**
   * Initialize display layers
   */
  initialize() {
    this.currentLayer = this.createLayer('current');
    this.nextLayer = this.createLayer('next');
    
    this.container.appendChild(this.currentLayer.element);
    this.container.appendChild(this.nextLayer.element);
    
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
   * Pause all video elements (called when tab goes hidden)
   */
  pauseVideos() {
    [this.currentLayer, this.nextLayer].forEach(layer => {
      if (layer.mediaElement?.tagName === 'VIDEO') {
        try { layer.mediaElement.pause(); } catch (e) { /* ignore */ }
      }
    });
  }
  
  /**
   * Clean up a layer's video element properly to free resources
   */
  cleanupLayerVideo(layer) {
    if (layer.mediaElement?.tagName === 'VIDEO') {
      try {
        layer.mediaElement.pause();
        layer.mediaElement.removeAttribute('src');
        layer.mediaElement.load(); // forces resource release
      } catch (e) { /* ignore */ }
    }
  }
  
  /**
   * Display new media item with crossfade
   */
  async displayMedia(mediaItem) {
    console.log('MediaDisplay: Showing', mediaItem.type, mediaItem.url);
    
    // Create media element
    let mediaElement;
    try {
      if (mediaItem.type === 'video') {
        mediaElement = await this.createVideoElement(mediaItem.url);
      } else {
        mediaElement = await this.createImageElement(mediaItem.url);
      }
      // Success — reset error counter
      this.consecutiveErrors = 0;
    } catch (error) {
      console.warn('MediaDisplay: Failed to load media, skipping:', error.message);
      this.consecutiveErrors++;
      
      if (this.consecutiveErrors < this.maxConsecutiveErrors) {
        // Skip to next after short delay
        setTimeout(() => this.mediaController.transitionToNext(), 500);
      } else {
        // Too many errors, wait longer then retry
        console.warn('MediaDisplay: Multiple failures, waiting 5s before retry');
        setTimeout(() => {
          this.consecutiveErrors = 0;
          this.mediaController.transitionToNext();
        }, 5000);
      }
      return;
    }
    
    // Determine which layer to swap into
    const targetLayer = this.currentLayer.element.style.opacity === '1'
      ? this.nextLayer
      : this.currentLayer;
    
    const oldLayer = targetLayer === this.currentLayer
      ? this.nextLayer
      : this.currentLayer;
    
    // Clean up target layer
    this.cleanupLayerVideo(targetLayer);
    targetLayer.element.innerHTML = '';
    
    // Place new media
    targetLayer.element.appendChild(mediaElement);
    targetLayer.mediaElement = mediaElement;
    targetLayer.currentMedia = mediaItem;
    
    // Crossfade
    await this.crossfade(oldLayer.element, targetLayer.element);
    
    // Clean up old layer video after crossfade
    this.cleanupLayerVideo(oldLayer);
    
    // Start video playback + wire events
    if (mediaItem.type === 'video') {
      // Wire ended → next
      mediaElement.addEventListener('ended', () => {
        this.onMediaEnded();
      });
      
      // Wire error during playback → skip to next
      mediaElement.addEventListener('error', () => {
        console.warn('MediaDisplay: Video playback error, skipping to next');
        this.mediaController.transitionToNext();
      });
      
      try {
        await mediaElement.play();
      } catch (error) {
        console.warn('MediaDisplay: play() rejected, skipping:', error.message);
        setTimeout(() => this.mediaController.transitionToNext(), 500);
      }
    }
  }
  
  /**
   * Create video element with load validation
   */
  async createVideoElement(url) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.crossOrigin = 'anonymous';
      video.style.filter = 'saturate(1.4) contrast(1.1)';
      
      let settled = false;
      
      const onCanPlay = () => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(video);
      };
      
      const onError = () => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error(`Failed to load video: ${url}`));
      };
      
      const cleanup = () => {
        video.removeEventListener('canplay', onCanPlay);
        video.removeEventListener('error', onError);
        clearTimeout(timeout);
      };
      
      // Timeout: if video hasn't loaded in 10s, try to resolve anyway
      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(video);
      }, 10000);
      
      video.addEventListener('canplay', onCanPlay);
      video.addEventListener('error', onError);
      video.src = url;
    });
  }
  
  /**
   * Create image element with load validation
   */
  async createImageElement(url) {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.filter = 'saturate(1.4) contrast(1.1)';
      
      const timeout = setTimeout(() => {
        reject(new Error(`Timeout loading image: ${url}`));
      }, 10000);
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve(img);
      };
      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(`Failed to load image: ${url}`));
      };
      
      img.src = url;
    });
  }
  
  /**
   * Crossfade between two layers
   */
  async crossfade(fadeOut, fadeIn) {
    return new Promise((resolve) => {
      fadeOut.style.opacity = '0';
      fadeIn.style.opacity = '1';
      setTimeout(resolve, this.crossfadeDuration);
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
      nextLayer: this.nextLayer.currentMedia,
      consecutiveErrors: this.consecutiveErrors
    };
  }
  
  /**
   * Clean up
   */
  destroy() {
    [this.currentLayer, this.nextLayer].forEach(layer => {
      this.cleanupLayerVideo(layer);
    });
    this.container.innerHTML = '';
  }
}
