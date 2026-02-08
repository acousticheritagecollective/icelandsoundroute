/**
 * STREET VIEW VIEWER COMPONENT
 * 
 * Displays street-level imagery from Mapillary based on current GPS position
 * Shows closest available street view image to the current location
 */

export class StreetViewViewer {
  constructor(container) {
    this.container = container;
    this.currentImage = null;
    this.viewer = null;
    this.lastFetchTime = 0;
    this.fetchInterval = 5000; // Only fetch every 5 seconds
    this.lastPosition = null;
    
    this.initialize();
  }
  
  /**
   * Initialize the street view viewer
   */
  initialize() {
    this.container.innerHTML = `
      <div id="streetview-container" style="width: 100%; height: 100%; position: relative; background: rgba(0, 0, 0, 0.3);">
        <div id="streetview-loading" style="display: flex; align-items: center; justify-content: center; height: 100%; color: rgba(232, 232, 232, 0.3); font-size: 0.75rem;">
          Waiting for location...
        </div>
        <img id="streetview-image" style="width: 100%; height: 100%; object-fit: cover; display: none; filter: grayscale(60%) contrast(1.1);" />
      </div>
    `;
    
    console.log('✓ Street view viewer initialized');
  }
  
  /**
   * Update street view based on current GPS position
   */
  async update(context) {
    if (!context || !context.geo) return;
    
    const { latitude, longitude } = context.geo;
    
    // Throttle: only fetch every 5 seconds
    const now = Date.now();
    if (now - this.lastFetchTime < this.fetchInterval) {
      return;
    }
    
    // Skip if position hasn't changed much (within ~50 meters)
    if (this.lastPosition) {
      const latDiff = Math.abs(latitude - this.lastPosition.lat);
      const lngDiff = Math.abs(longitude - this.lastPosition.lng);
      if (latDiff < 0.0005 && lngDiff < 0.0005) {
        return;
      }
    }
    
    this.lastFetchTime = now;
    this.lastPosition = { lat: latitude, lng: longitude };
    
    try {
      // Mapillary API - search for images near coordinates
      const url = `https://graph.mapillary.com/images?access_token=MLY|5374826515890433|a5d1836e3aeb3c40949dd9f6df0c6a24&fields=id,thumb_1024_url,computed_geometry&bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&limit=1`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.log('Street view: Rate limited or no data');
        this.showNoImageAvailable();
        return;
      }
      
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const image = data.data[0];
        this.showImage(image.thumb_1024_url);
      } else {
        this.showNoImageAvailable();
      }
      
    } catch (error) {
      console.log('Street view: Fetch failed');
      this.showNoImageAvailable();
    }
  }
  
  /**
   * Display street view image
   */
  showImage(url) {
    const img = document.getElementById('streetview-image');
    const loading = document.getElementById('streetview-loading');
    
    if (img && loading) {
      img.src = url;
      img.style.display = 'block';
      loading.style.display = 'none';
    }
  }
  
  /**
   * Show message when no image available
   */
  showNoImageAvailable() {
    const img = document.getElementById('streetview-image');
    const loading = document.getElementById('streetview-loading');
    
    if (img && loading) {
      img.style.display = 'none';
      loading.style.display = 'flex';
      loading.textContent = '—';
    }
  }
  
  /**
   * Clean up
   */
  destroy() {
    // Nothing to clean up
  }
}
