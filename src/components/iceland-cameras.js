/**
 * ICELAND LIVE CAMERAS COMPONENT
 * 
 * Rotates through REAL live webcams from Iceland every 15 seconds
 * Uses multiple fallback strategies to ensure cameras load
 */

export class IcelandCameras {
  constructor(container) {
    this.container = container;
    this.currentCameraIndex = 0;
    this.rotationInterval = null;
    this.refreshInterval = null;
    this.isPlaying = false;
    
    // Real Iceland webcams from multiple reliable sources
    this.cameras = [
      {
        name: 'Reykjavik - Perlan',
        url: 'https://cdn.mbl.is/live/hd-01.jpg'
      },
      {
        name: 'Reykjavik Harbor',
        url: 'https://cdn.mbl.is/live/hd-02.jpg'
      },
      {
        name: 'Hallgrímskirkja Church',
        url: 'https://cdn.mbl.is/live/hd-03.jpg'
      },
      {
        name: 'Esja Mountain View',
        url: 'https://cdn.mbl.is/live/hd-04.jpg'
      },
      {
        name: 'Reykjavik Panorama',
        url: 'https://cdn.mbl.is/live/hd-05.jpg'
      }
    ];
    
    // CORS proxy as fallback
    this.corsProxy = 'https://corsproxy.io/?';
    
    this.initialize();
  }
  
  /**
   * Initialize the camera viewer
   */
  initialize() {
    this.container.innerHTML = `
      <div class="iceland-cameras" style="
        width: 100%; 
        height: 100%; 
        position: relative; 
        background: #1a1d1e; 
        overflow: hidden;
      ">
        <img 
          id="camera-image"
          style="
            width: 100%; 
            height: 100%; 
            object-fit: cover; 
            border-radius: 0px; 
            display: block;
            transition: opacity 0.8s ease-in-out;
          "
          alt="Iceland Live Camera">
        
        <div id="camera-loading" style="
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(26, 29, 30, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-family: 'Helvetica Neue', Arial, sans-serif;
          font-size: 0.9rem;
          opacity: 1;
          transition: opacity 0.3s ease;
          z-index: 5;
        ">
          <div style="text-align: center;">
            <div>Loading live camera...</div>
            <div style="font-size: 0.7rem; margin-top: 8px; opacity: 0.6;">Please wait</div>
          </div>
        </div>
        
        <div class="camera-label" style="
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 0.85rem;
          font-family: 'Helvetica Neue', Arial, sans-serif;
          backdrop-filter: blur(5px);
          z-index: 10;
        ">
          <div id="camera-name" style="font-weight: 600;">Live Camera</div>
          <div id="camera-counter" style="font-size: 0.75rem; opacity: 0.8; margin-top: 2px;">1 / 5</div>
        </div>
        
        <div style="
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(217, 69, 69, 0.9);
          color: white;
          padding: 4px 8px;
          border-radius: 3px;
          font-size: 0.7rem;
          font-family: 'Helvetica Neue', Arial, sans-serif;
          font-weight: 600;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 5px;
        ">
          <span id="live-dot" style="
            width: 6px;
            height: 6px;
            background: white;
            border-radius: 50%;
            animation: pulse 2s infinite;
          "></span>
          LIVE
        </div>
      </div>
      
      <style>
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      </style>
    `;
    
    console.log('✓ Iceland cameras initialized (waiting for Tune In)');
  }
  
  /**
   * Start playing cameras
   */
  start() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.loadCamera(0);
    this.startRotation();
    this.startRefresh();
    
    console.log('✓ Iceland cameras started');
  }
  
  /**
   * Load camera with multiple fallback strategies
   */
  async loadCamera(index) {
    const camera = this.cameras[index];
    const img = document.getElementById('camera-image');
    const nameEl = document.getElementById('camera-name');
    const counterEl = document.getElementById('camera-counter');
    const loadingEl = document.getElementById('camera-loading');
    
    if (!img || !camera) return;
    
    // Show loading
    if (loadingEl) loadingEl.style.opacity = '1';
    
    // Update labels immediately
    if (nameEl) nameEl.textContent = camera.name;
    if (counterEl) counterEl.textContent = `${index + 1} / ${this.cameras.length}`;
    
    const timestamp = new Date().getTime();
    
    // Strategy 1: Try direct URL
    const directUrl = `${camera.url}?t=${timestamp}`;
    const loaded = await this.tryLoadImage(img, directUrl, loadingEl);
    
    if (loaded) {
      console.log(`✓ Camera ${index + 1} loaded direct: ${camera.name}`);
      return;
    }
    
    // Strategy 2: Try with CORS proxy
    console.log(`Trying CORS proxy for camera ${index + 1}...`);
    const proxyUrl = this.corsProxy + encodeURIComponent(directUrl);
    const proxiedLoaded = await this.tryLoadImage(img, proxyUrl, loadingEl);
    
    if (proxiedLoaded) {
      console.log(`✓ Camera ${index + 1} loaded via proxy: ${camera.name}`);
      return;
    }
    
    // Strategy 3: Skip to next camera
    console.warn(`Camera ${index + 1} unavailable, skipping...`);
    if (loadingEl) {
      loadingEl.innerHTML = `
        <div style="text-align: center;">
          <div>Camera unavailable</div>
          <div style="font-size: 0.7rem; margin-top: 8px; opacity: 0.6;">Loading next...</div>
        </div>
      `;
    }
    
    setTimeout(() => {
      const nextIndex = (index + 1) % this.cameras.length;
      this.currentCameraIndex = nextIndex;
      this.loadCamera(nextIndex);
    }, 2000);
  }
  
  /**
   * Try to load an image and return success status
   */
  tryLoadImage(imgElement, url, loadingEl) {
    return new Promise((resolve) => {
      const preloader = new Image();
      preloader.crossOrigin = 'anonymous';
      
      const timeout = setTimeout(() => {
        preloader.onload = null;
        preloader.onerror = null;
        resolve(false);
      }, 8000); // 8 second timeout
      
      preloader.onload = () => {
        clearTimeout(timeout);
        
        // Fade transition
        imgElement.style.opacity = '0.3';
        setTimeout(() => {
          imgElement.src = preloader.src;
          imgElement.style.opacity = '1';
          if (loadingEl) loadingEl.style.opacity = '0';
        }, 300);
        
        resolve(true);
      };
      
      preloader.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };
      
      preloader.src = url;
    });
  }
  
  /**
   * Start rotation
   */
  startRotation() {
    if (this.rotationInterval) return;
    
    this.rotationInterval = setInterval(() => {
      this.currentCameraIndex = (this.currentCameraIndex + 1) % this.cameras.length;
      this.loadCamera(this.currentCameraIndex);
    }, 15000);
  }
  
  /**
   * Start refresh
   */
  startRefresh() {
    if (this.refreshInterval) return;
    
    this.refreshInterval = setInterval(() => {
      const camera = this.cameras[this.currentCameraIndex];
      const img = document.getElementById('camera-image');
      
      if (camera && img && img.complete) {
        const timestamp = new Date().getTime();
        const url = `${camera.url}?t=${timestamp}`;
        
        // Silent refresh
        const refreshImg = new Image();
        refreshImg.crossOrigin = 'anonymous';
        refreshImg.onload = () => {
          img.src = refreshImg.src;
        };
        refreshImg.src = url;
      }
    }, 5000);
  }
  
  /**
   * Stop rotation
   */
  stopRotation() {
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
      this.rotationInterval = null;
    }
  }
  
  /**
   * Stop refresh
   */
  stopRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }
  
  /**
   * Update
   */
  update(context) {
    // Cameras run independently
  }
  
  /**
   * Clean up
   */
  destroy() {
    this.stopRotation();
    this.stopRefresh();
    this.isPlaying = false;
    this.container.innerHTML = '';
  }
}
