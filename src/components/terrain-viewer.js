/**
 * 3D TERRAIN VIEWER COMPONENT
 * 
 * Displays 3D terrain visualization using Cesium.js (free, open source).
 * Updates in real-time to show terrain at current route position.
 */

export class TerrainViewer {
  constructor(container) {
    this.container = container;
    this.viewer = null;
    this.currentPosition = null;
    
    this.initialize();
  }
  
  /**
   * Initialize Cesium viewer
   */
  initialize() {
    // Wait for Cesium to be available
    const initWhenReady = () => {
      if (typeof Cesium === 'undefined') {
        console.log('Waiting for Cesium library...');
        setTimeout(initWhenReady, 200);
        return;
      }
      
      console.log('Cesium available, setting up viewer...');
      this.setupViewer();
    };
    
    initWhenReady();
  }
  
  /**
   * Set up the Cesium viewer
   */
  async setupViewer() {
    try {
      // Create OpenStreetMap imagery provider (completely free, no token)
      const osmProvider = new Cesium.OpenStreetMapImageryProvider({
        url: 'https://a.tile.openstreetmap.org/'
      });
      
      // Create Cesium viewer with OSM imagery
      this.viewer = new Cesium.Viewer(this.container, {
        imageryProvider: osmProvider,
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        fullscreenButton: false,
        vrButton: false,
        infoBox: false,
        selectionIndicator: false,
        creditContainer: document.createElement('div'), // Hide credits
      });
      
      // Set initial view to Iceland
      this.viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(-21.9426, 64.1466, 15000),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-45),
          roll: 0.0
        }
      });
      
      // Enable lighting for better visuals
      this.viewer.scene.globe.enableLighting = true;
      
      console.log('✓ Cesium 3D viewer initialized with OpenStreetMap');
      
    } catch (error) {
      console.error('✗ Failed to initialize Cesium:', error);
    }
  }
  
  /**
   * Update viewer based on current context
   * 
   * @param {object} context - Context from route mapping
   */
  update(context) {
    if (!context || !this.viewer) return;
    
    const lat = context.geo.latitude;
    const lng = context.geo.longitude;
    
    // Don't update if position hasn't changed much
    if (this.currentPosition) {
      const distance = Math.sqrt(
        Math.pow(lat - this.currentPosition.lat, 2) + 
        Math.pow(lng - this.currentPosition.lng, 2)
      );
      if (distance < 0.005) return; // ~500m threshold
    }
    
    console.log(`Updating 3D view to: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    
    // Fly camera to new position with smooth animation
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lng, lat, 5000),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),
        roll: 0.0
      },
      duration: 2.0 // 2 second animation
    });
    
    this.currentPosition = { lat, lng };
  }
  
  /**
   * Handle window resize
   */
  resize() {
    // Cesium handles this automatically
  }
  
  /**
   * Clean up
   */
  destroy() {
    if (this.viewer) {
      this.viewer.destroy();
    }
  }
}
