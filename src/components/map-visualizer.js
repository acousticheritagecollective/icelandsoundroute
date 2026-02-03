/**
 * MAP VISUALIZER COMPONENT
 * 
 * Displays Iceland map with route path and current position indicator.
 * Updates in real-time as audio plays through the timeline.
 * 
 * FEATURES:
 * - SVG-based map rendering
 * - Route path visualization (all 4 sections)
 * - Current position indicator (animated dot)
 * - Section highlighting
 * - Responsive sizing
 */

export class MapVisualizer {
  constructor(container) {
    this.container = container;
    this.svg = null;
    this.routePath = null;
    this.positionMarker = null;
    this.sectionPaths = [];
    
    // Map projection settings
    this.projection = {
      // Iceland bounds (approximate)
      minLat: 63.3,
      maxLat: 66.5,
      minLng: -24.5,
      maxLng: -13.5,
      width: 800,
      height: 600
    };
    
    this.currentContext = null;
    
    this.initialize();
  }
  
  /**
   * Initialize SVG and map elements
   */
  initialize() {
    // Create SVG
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', '100%');
    this.svg.setAttribute('height', '100%');
    this.svg.setAttribute('viewBox', `0 0 ${this.projection.width} ${this.projection.height}`);
    this.svg.style.backgroundColor = '#1a1a1a';
    
    this.container.appendChild(this.svg);
    
    console.log('Map visualizer initialized');
  }
  
  /**
   * Load route data and create visualization
   * 
   * @param {Array} sections - Array of section objects from route mapping
   */
  loadRoute(sections) {
    console.log('Loading route with', sections.length, 'sections');
    
    // Create path for each section
    sections.forEach((section, index) => {
      const pathElement = this.createSectionPath(section, index);
      this.sectionPaths.push({
        section,
        element: pathElement
      });
      this.svg.appendChild(pathElement);
    });
    
    // Create position marker
    this.positionMarker = this.createPositionMarker();
    this.svg.appendChild(this.positionMarker);
  }
  
  /**
   * Create SVG path for a section
   */
  createSectionPath(section, index) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    // Convert geo coordinates to SVG coordinates
    const pathData = this.geoPathToSVGPath(section.geoPath);
    path.setAttribute('d', pathData);
    
    // Styling
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24']; // Different color per section
    path.setAttribute('stroke', colors[index % colors.length]);
    path.setAttribute('stroke-width', '3');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('opacity', '0.3'); // Dim by default
    path.setAttribute('data-section-id', section.id);
    
    return path;
  }
  
  /**
   * Convert geographic path to SVG path data
   */
  geoPathToSVGPath(geoPath) {
    const points = geoPath.map(([lat, lng]) => this.projectToSVG(lat, lng));
    
    // Create SVG path data (M = move to, L = line to)
    let pathData = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathData += ` L ${points[i].x} ${points[i].y}`;
    }
    
    return pathData;
  }
  
  /**
   * Project lat/lng to SVG coordinates
   * Simple linear projection (good enough for Iceland's size)
   */
  projectToSVG(lat, lng) {
    const x = ((lng - this.projection.minLng) / (this.projection.maxLng - this.projection.minLng)) 
              * this.projection.width;
    
    // Flip Y axis (SVG Y increases downward, but latitude increases upward)
    const y = ((this.projection.maxLat - lat) / (this.projection.maxLat - this.projection.minLat)) 
              * this.projection.height;
    
    return { x, y };
  }
  
  /**
   * Create position marker (animated dot)
   */
  createPositionMarker() {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Outer glow circle
    const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    glow.setAttribute('r', '12');
    glow.setAttribute('fill', '#ffffff');
    glow.setAttribute('opacity', '0.3');
    group.appendChild(glow);
    
    // Main dot
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('r', '6');
    dot.setAttribute('fill', '#ffffff');
    group.appendChild(dot);
    
    // Pulse animation (CSS would be better, but this works)
    setInterval(() => {
      glow.setAttribute('r', '12');
      glow.setAttribute('opacity', '0.3');
      
      // Animate to larger size
      const startTime = performance.now();
      const duration = 1500;
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const radius = 12 + (8 * progress);
        const opacity = 0.3 * (1 - progress);
        
        glow.setAttribute('r', radius.toString());
        glow.setAttribute('opacity', opacity.toString());
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }, 1500);
    
    return group;
  }
  
  /**
   * Update visualization based on current context
   * Called on each timeline update
   * 
   * @param {object} context - Context from route mapping
   */
  update(context) {
    if (!context) return;
    
    this.currentContext = context;
    
    // Update position marker
    const svgPos = this.projectToSVG(context.geo.latitude, context.geo.longitude);
    this.positionMarker.setAttribute('transform', `translate(${svgPos.x}, ${svgPos.y})`);
    
    // Highlight current section
    this.sectionPaths.forEach(({ section, element }) => {
      if (section.id === context.section.id) {
        element.setAttribute('opacity', '1.0'); // Full opacity for active section
        element.setAttribute('stroke-width', '4');
      } else {
        element.setAttribute('opacity', '0.3'); // Dim for inactive sections
        element.setAttribute('stroke-width', '3');
      }
    });
  }
  
  /**
   * Get current state
   */
  getState() {
    return {
      currentContext: this.currentContext,
      sectionsLoaded: this.sectionPaths.length
    };
  }
  
  /**
   * Clean up
   */
  destroy() {
    this.container.innerHTML = '';
  }
}
