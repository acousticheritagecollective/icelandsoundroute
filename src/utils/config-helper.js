/**
 * CONFIGURATION HELPER UTILITY
 * 
 * Helper functions to process GPS data and generate route configuration.
 * This file contains utilities to convert GPS tracks into the format needed
 * for route-config.js
 */

/**
 * Parse GPX file content and extract coordinates
 * 
 * @param {string} gpxContent - Raw GPX XML content
 * @returns {Array} Array of [lat, lng] coordinates
 */
export function parseGPX(gpxContent) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(gpxContent, 'text/xml');
  
  const trackPoints = doc.querySelectorAll('trkpt');
  const coordinates = [];
  
  trackPoints.forEach(point => {
    const lat = parseFloat(point.getAttribute('lat'));
    const lng = parseFloat(point.getAttribute('lon'));
    coordinates.push([lat, lng]);
  });
  
  console.log(`Parsed ${coordinates.length} points from GPX`);
  return coordinates;
}

/**
 * Parse KML file content and extract coordinates
 * 
 * @param {string} kmlContent - Raw KML XML content
 * @returns {Array} Array of [lat, lng] coordinates
 */
export function parseKML(kmlContent) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(kmlContent, 'text/xml');
  
  const coordinatesText = doc.querySelector('coordinates')?.textContent || '';
  const coordinates = [];
  
  // KML format: lng,lat,alt (space-separated)
  const points = coordinatesText.trim().split(/\s+/);
  
  points.forEach(point => {
    const [lng, lat] = point.split(',').map(parseFloat);
    if (!isNaN(lat) && !isNaN(lng)) {
      coordinates.push([lat, lng]);
    }
  });
  
  console.log(`Parsed ${coordinates.length} points from KML`);
  return coordinates;
}

/**
 * Parse GeoJSON and extract coordinates
 * 
 * @param {object|string} geojson - GeoJSON object or JSON string
 * @returns {Array} Array of [lat, lng] coordinates
 */
export function parseGeoJSON(geojson) {
  if (typeof geojson === 'string') {
    geojson = JSON.parse(geojson);
  }
  
  const coordinates = [];
  
  // Handle LineString
  if (geojson.type === 'LineString') {
    geojson.coordinates.forEach(([lng, lat]) => {
      coordinates.push([lat, lng]);
    });
  }
  // Handle Feature with LineString geometry
  else if (geojson.type === 'Feature' && geojson.geometry.type === 'LineString') {
    geojson.geometry.coordinates.forEach(([lng, lat]) => {
      coordinates.push([lat, lng]);
    });
  }
  // Handle MultiLineString or GeometryCollection
  else if (geojson.type === 'GeometryCollection') {
    geojson.geometries.forEach(geometry => {
      if (geometry.type === 'LineString') {
        geometry.coordinates.forEach(([lng, lat]) => {
          coordinates.push([lat, lng]);
        });
      }
    });
  }
  
  console.log(`Parsed ${coordinates.length} points from GeoJSON`);
  return coordinates;
}

/**
 * Simplify path by reducing number of points
 * Uses Douglas-Peucker algorithm
 * 
 * @param {Array} coordinates - Array of [lat, lng] coordinates
 * @param {number} tolerance - Simplification tolerance (0.0001 = ~11 meters)
 * @returns {Array} Simplified coordinates
 */
export function simplifyPath(coordinates, tolerance = 0.001) {
  if (coordinates.length <= 2) return coordinates;
  
  function perpendicularDistance(point, lineStart, lineEnd) {
    const [x, y] = point;
    const [x1, y1] = lineStart;
    const [x2, y2] = lineEnd;
    
    const dx = x2 - x1;
    const dy = y2 - y1;
    
    const norm = Math.sqrt(dx * dx + dy * dy);
    if (norm === 0) return Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1));
    
    const t = ((x - x1) * dx + (y - y1) * dy) / (norm * norm);
    
    let px, py;
    if (t < 0) {
      px = x1;
      py = y1;
    } else if (t > 1) {
      px = x2;
      py = y2;
    } else {
      px = x1 + t * dx;
      py = y1 + t * dy;
    }
    
    return Math.sqrt((x - px) * (x - px) + (y - py) * (y - py));
  }
  
  function douglasPeucker(points, tolerance) {
    if (points.length <= 2) return points;
    
    let maxDistance = 0;
    let index = 0;
    
    for (let i = 1; i < points.length - 1; i++) {
      const distance = perpendicularDistance(
        points[i],
        points[0],
        points[points.length - 1]
      );
      
      if (distance > maxDistance) {
        maxDistance = distance;
        index = i;
      }
    }
    
    if (maxDistance > tolerance) {
      const left = douglasPeucker(points.slice(0, index + 1), tolerance);
      const right = douglasPeucker(points.slice(index), tolerance);
      
      return left.slice(0, -1).concat(right);
    } else {
      return [points[0], points[points.length - 1]];
    }
  }
  
  const simplified = douglasPeucker(coordinates, tolerance);
  console.log(`Simplified from ${coordinates.length} to ${simplified.length} points`);
  
  return simplified;
}

/**
 * Split path into sections based on waypoints
 * 
 * @param {Array} coordinates - Full path coordinates
 * @param {Array} waypoints - Section boundary waypoints [lat, lng]
 * @returns {Array} Array of section paths
 */
export function splitPathBySections(coordinates, waypoints) {
  const sections = [];
  
  // Find indices of closest points to each waypoint
  const waypointIndices = waypoints.map(waypoint => {
    let minDistance = Infinity;
    let minIndex = 0;
    
    coordinates.forEach((coord, index) => {
      const distance = haversineDistance(
        waypoint[0], waypoint[1],
        coord[0], coord[1]
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        minIndex = index;
      }
    });
    
    return minIndex;
  });
  
  // Split path at waypoint indices
  for (let i = 0; i < waypointIndices.length - 1; i++) {
    const start = waypointIndices[i];
    const end = waypointIndices[i + 1];
    sections.push(coordinates.slice(start, end + 1));
  }
  
  // Add final section (last waypoint to end)
  const lastIndex = waypointIndices[waypointIndices.length - 1];
  sections.push(coordinates.slice(lastIndex));
  
  console.log(`Split path into ${sections.length} sections`);
  sections.forEach((section, i) => {
    console.log(`  Section ${i + 1}: ${section.length} points`);
  });
  
  return sections;
}

/**
 * Haversine distance between two lat/lng points (in kilometers)
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Generate configuration template from processed data
 * 
 * @param {Array} sectionPaths - Array of section paths
 * @param {Array} sectionNames - Optional section names
 * @returns {string} JavaScript configuration code
 */
export function generateConfigTemplate(sectionPaths, sectionNames = null) {
  const names = sectionNames || sectionPaths.map((_, i) => `Section ${i + 1}`);
  
  let config = 'export const routeConfig = {\n  sections: [\n';
  
  sectionPaths.forEach((path, index) => {
    config += `    {\n`;
    config += `      id: 'section_${index + 1}',\n`;
    config += `      name: '${names[index]}',\n`;
    config += `      geoPath: [\n`;
    
    // Write coordinates
    path.forEach(([lat, lng], i) => {
      const comma = i < path.length - 1 ? ',' : '';
      config += `        [${lat.toFixed(6)}, ${lng.toFixed(6)}]${comma}\n`;
    });
    
    config += `      ],\n`;
    config += `      audioFiles: [\n`;
    config += `        // TODO: Add your audio files here\n`;
    config += `      ],\n`;
    config += `      mediaPool: {\n`;
    config += `        videos: [\n`;
    config += `          // TODO: Add your video files here\n`;
    config += `        ],\n`;
    config += `        images: [\n`;
    config += `          // TODO: Add your image files here\n`;
    config += `        ]\n`;
    config += `      }\n`;
    config += `    }${index < sectionPaths.length - 1 ? ',' : ''}\n`;
  });
  
  config += '  ]\n};\n';
  
  return config;
}

/**
 * Example usage:
 * 
 * // Load GPX file
 * const gpxContent = await fetch('route.gpx').then(r => r.text());
 * const coordinates = parseGPX(gpxContent);
 * 
 * // Simplify
 * const simplified = simplifyPath(coordinates, 0.001);
 * 
 * // Split into 4 sections (provide 5 waypoints: start + 3 boundaries + end)
 * const waypoints = [
 *   [64.1466, -21.9426], // Reykjavik (start)
 *   [63.9333, -20.9833], // Selfoss
 *   [63.4186, -19.0059], // Vik
 *   [64.2539, -15.2082], // Hofn
 *   [64.1466, -21.9426]  // Reykjavik (end)
 * ];
 * const sections = splitPathBySections(simplified, waypoints);
 * 
 * // Generate config
 * const sectionNames = [
 *   'Reykjavik to Selfoss',
 *   'Selfoss to Vik',
 *   'Vik to Hofn',
 *   'Hofn to Reykjavik'
 * ];
 * const config = generateConfigTemplate(sections, sectionNames);
 * 
 * // Copy to route-config.js
 * console.log(config);
 */
