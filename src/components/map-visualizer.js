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
    this.pendingRouteData = null; // Store route data if map not ready
    
    this.initialize();
  }
  
  /**
   * Initialize Leaflet map
   */
  initialize() {
    // Wait a moment for DOM to be fully ready
    setTimeout(() => {
      try {
        // Create Leaflet map centered on Iceland
        this.map = L.map(this.container, {
          zoomControl: true,
          attributionControl: true
        }).setView([64.9631, -19.0208], 6); // Iceland center
        
        // Add OpenStreetMap tiles with dark theme
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          opacity: 1
        }).addTo(this.map);
        
        // Force map to recalculate size
        setTimeout(() => {
          this.map.invalidateSize();
        }, 100);
        
        console.log('Map visualizer initialized with OpenStreetMap');
        
        // If route data was already provided, load it now
        if (this.pendingRouteData) {
          this.loadRoute(this.pendingRouteData);
          this.pendingRouteData = null;
        }
        
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }, 100);
  }
  
  /**
   * Load route data and create visualization
   * 
   * @param {Array} sections - Array of section objects from route mapping
   */
  loadRoute(sections) {
    // If map isn't ready yet, store data for later
    if (!this.map) {
      console.log('Map not ready, storing route data for later');
      this.pendingRouteData = sections;
      return;
    }
    
    console.log('Loading route with', sections.length, 'sections');
    
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'];
    
    // Create polyline for each section
    sections.forEach((section, index) => {
      const latLngs = section.geoPath.map(([lat, lng]) => [lat, lng]);
      
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
      radius: 8,
      fillColor: '#ffffff',
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
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
    if (this.map) {
      this.map.remove();
    }
  }
}
