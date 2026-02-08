/**
 * MAP VISUALIZER COMPONENT
 * 
 * Displays OpenStreetMap with route path and current position indicator.
 * Updates in real-time as audio plays through the timeline.
 * 
 * Uses Leaflet.js for map rendering with OpenStreetMap tiles.
 */

export class MapVisualizer {
  constructor(container) {
    this.container = container;
    this.map = null;
    this.routeLayers = [];
    this.positionMarker = null;
    this.currentContext = null;
    this.pendingRouteData = null;
    this.zoomLevel = 0; // 0 = Iceland, 1 = Zone, 2 = Current location
    this.zoomInterval = null;
    this.allCoordinates = []; // Store all route coordinates
    
    this.initialize();
  }
  
  /**
   * Initialize Leaflet map
   */
  initialize() {
    setTimeout(() => {
      try {
        // Create Leaflet map centered on Iceland
        this.map = L.map(this.container, {
          zoomControl: false,
          attributionControl: false
        }).setView([64.9631, -19.0208], 6);
        
        // Add satellite imagery tiles
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 19,
          attribution: '',
          className: 'map-satellite-blend'
        }).addTo(this.map);
        
        // Add CSS for blending with background
        const style = document.createElement('style');
        style.textContent = `
          .map-satellite-blend {
            filter: grayscale(100%) contrast(1.3);
           mix-blend-mode: screen;
 //           opacity: 0.5;
          }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
          this.map.invalidateSize();
        }, 100);
        
        console.log('Map visualizer initialized with desaturated satellite imagery');
        
        if (this.pendingRouteData) {
          this.loadRoute(this.pendingRouteData);
          this.pendingRouteData = null;
        }
        
        // Start zoom cycle
        this.startZoomCycle();
        
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }, 100);
  }
  
  /**
   * Start the 3-level zoom cycle (every 10 seconds)
   */
  startZoomCycle() {
    this.zoomInterval = setInterval(() => {
      if (!this.currentContext || !this.map) return;
      
      // Get current position from context
      const lat = this.currentContext.geo?.latitude;
      const lng = this.currentContext.geo?.longitude;
      
      if (!lat || !lng) return;
      
      this.zoomLevel = (this.zoomLevel + 1) % 3;
      
      switch(this.zoomLevel) {
        case 0: // Close-up on current position
          this.map.setView([lat, lng], 14, {
            animate: true,
            duration: 2
          });
          break;
        case 1: // Medium zoom on current position
          this.map.setView([lat, lng], 11, {
            animate: true,
            duration: 2
          });
          break;
        case 2: // Far zoom on current position (but not full island)
          this.map.setView([lat, lng], 9, {
            animate: true,
            duration: 2
          });
          break;
      }
    }, 10000);
  }
  
  /**
   * Load route data and create visualization
   * 
   * @param {Array} sections - Array of section objects from route mapping
   */
  loadRoute(sections) {
    if (!this.map) {
      console.log('Map not ready, storing route data for later');
      this.pendingRouteData = sections;
      return;
    }
    
    console.log('Loading route with', sections.length, 'sections');
    
    const colors = ['#ECF1F4', '#E6EBEE', '#F8FAFB', '#F8FAFB'];
    
    // Store all coordinates for zone zoom
    this.allCoordinates = [];
    
    // Create polyline for each section
    sections.forEach((section, index) => {
      const latLngs = section.geoPath.map(([lat, lng]) => [lat, lng]);
      this.allCoordinates.push(...latLngs);
      
      const polyline = L.polyline(latLngs, {
        color: colors[index % colors.length],
        weight: 4,
        opacity: 0.6,
        smoothFactor: 1
      }).addTo(this.map);
      
      this.routeLayers.push({
        section,
        layer: polyline
      });
    });
    
    // Create position marker (pulsing circle)
    this.positionMarker = L.circleMarker([64.1466, -21.9426], {
      radius: 6,
      fillColor: '#ffffff',
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.6
    }).addTo(this.map);
    
    // Fit map to show all routes
    const allLatLngs = sections.flatMap(s => s.geoPath.map(([lat, lng]) => [lat, lng]));
    const bounds = L.latLngBounds(allLatLngs);
    this.map.fitBounds(bounds, { padding: [20, 20] });
  }
  
  /**
   * Update visualization based on current context
   * 
   * @param {object} context - Context from route mapping
   */
  update(context) {
    if (!context || !this.map || !this.positionMarker) return;
    
    this.currentContext = context;
    
    // Update position marker
    this.positionMarker.setLatLng([context.geo.latitude, context.geo.longitude]);
    
    // Highlight current section
    this.routeLayers.forEach(({ section, layer }) => {
      if (section.id === context.section.id) {
        layer.setStyle({
          opacity: 1.0,
          weight: 6
        });
      } else {
        layer.setStyle({
          opacity: 0.4,
          weight: 4
        });
      }
    });
  }
  
  /**
   * Get current state
   */
  getState() {
    return {
      currentContext: this.currentContext,
      sectionsLoaded: this.routeLayers.length
    };
  }
  
  /**
   * Clean up
   */
  destroy() {
    if (this.zoomInterval) {
      clearInterval(this.zoomInterval);
    }
    if (this.map) {
      this.map.remove();
    }
  }
}
