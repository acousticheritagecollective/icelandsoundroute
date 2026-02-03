/**
 * ROUTE MAPPING SYSTEM
 * 
 * Translates timeline position into:
 * - Current section
 * - Current audio file and offset
 * - Geographic position along route
 * - Available media pool
 * 
 * PROCESS:
 * 1. Receives route configuration
 * 2. Pre-calculates section boundaries and cumulative offsets
 * 3. Given timeline position, returns all relevant context
 */

export class RouteMapping {
  constructor(routeConfig) {
    this.sections = routeConfig.sections;
    this.processedSections = [];
    this.totalDuration = 0;
    
    this.processConfiguration();
  }
  
  /**
   * Process route configuration and pre-calculate boundaries
   * This happens once on initialization
   */
  processConfiguration() {
    let cumulativeTime = 0;
    let cumulativeDistance = 0;
    
    this.processedSections = this.sections.map((section, sectionIndex) => {
      // Calculate section duration from audio files
      const sectionDuration = section.audioFiles.reduce(
        (sum, file) => sum + file.duration,
        0
      );
      
      // Calculate section distance (for geographic interpolation)
      const sectionDistance = this.calculatePathDistance(section.geoPath);
      
      // Process audio files with cumulative offsets
      let audioFileOffset = 0;
      const processedAudioFiles = section.audioFiles.map((file, fileIndex) => {
        const processed = {
          ...file,
          index: fileIndex,
          startTime: cumulativeTime + audioFileOffset,
          endTime: cumulativeTime + audioFileOffset + file.duration,
          offsetInSection: audioFileOffset
        };
        audioFileOffset += file.duration;
        return processed;
      });
      
      // Create processed section object
      const processed = {
        ...section,
        index: sectionIndex,
        duration: sectionDuration,
        startTime: cumulativeTime,
        endTime: cumulativeTime + sectionDuration,
        distance: sectionDistance,
        startDistance: cumulativeDistance,
        endDistance: cumulativeDistance + sectionDistance,
        audioFiles: processedAudioFiles,
        // Combine media pool into single array for easier random selection
        mediaPoolCombined: [
          ...section.mediaPool.videos.map(url => ({ url, type: 'video' })),
          ...section.mediaPool.images.map(url => ({ url, type: 'image' }))
        ]
      };
      
      cumulativeTime += sectionDuration;
      cumulativeDistance += sectionDistance;
      
      return processed;
    });
    
    this.totalDuration = cumulativeTime;
    this.totalDistance = cumulativeDistance;
    
    console.log('Route mapping initialized:');
    console.log(`  Total duration: ${this.totalDuration}s (${(this.totalDuration / 60).toFixed(1)} min)`);
    console.log(`  Total distance: ${this.totalDistance.toFixed(2)} km`);
    console.log(`  Sections: ${this.processedSections.length}`);
  }
  
  /**
   * Calculate approximate distance of a path in kilometers
   * Using Haversine formula for lat/lng distance
   * 
   * @param {Array} path - Array of [lat, lng] coordinates
   * @returns {number} Distance in kilometers
   */
  calculatePathDistance(path) {
    let totalDistance = 0;
    
    for (let i = 0; i < path.length - 1; i++) {
      const [lat1, lng1] = path[i];
      const [lat2, lng2] = path[i + 1];
      totalDistance += this.haversineDistance(lat1, lng1, lat2, lng2);
    }
    
    return totalDistance;
  }
  
  /**
   * Calculate distance between two lat/lng points using Haversine formula
   * 
   * @returns {number} Distance in kilometers
   */
  haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
  
  /**
   * Get all context for a given timeline position
   * This is the main method other systems will call
   * 
   * @param {number} position - Timeline position in seconds
   * @returns {object} Complete context object
   */
  getContextAtPosition(position) {
    // Find current section
    const section = this.findSectionAtPosition(position);
    if (!section) {
      console.error('No section found for position:', position);
      return null;
    }
    
    // Find current audio file
    const audioFile = this.findAudioFileAtPosition(position, section);
    if (!audioFile) {
      console.error('No audio file found for position:', position);
      return null;
    }
    
    // Calculate offset within current audio file
    const offsetInFile = position - audioFile.startTime;
    
    // Calculate position along geographic path
    const positionInSection = position - section.startTime;
    const progressInSection = positionInSection / section.duration;
    const geoPosition = this.interpolateGeoPosition(section.geoPath, progressInSection);
    
    // Calculate overall progress
    const overallProgress = position / this.totalDuration;
    
    return {
      // Timeline info
      position,
      overallProgress,
      
      // Section info
      section: {
        id: section.id,
        index: section.index,
        name: section.name,
        duration: section.duration,
        progressInSection
      },
      
      // Audio info
      audio: {
        file: audioFile,
        offsetInFile,
        shouldBePlaying: true
      },
      
      // Geographic info
      geo: {
        latitude: geoPosition[0],
        longitude: geoPosition[1],
        path: section.geoPath
      },
      
      // Media pool for this section
      mediaPool: section.mediaPoolCombined,
      mediaPoolVideos: section.mediaPool.videos,
      mediaPoolImages: section.mediaPool.images
    };
  }
  
  /**
   * Find which section contains a given timeline position
   * 
   * @param {number} position - Timeline position in seconds
   * @returns {object} Section object
   */
  findSectionAtPosition(position) {
    return this.processedSections.find(
      section => position >= section.startTime && position < section.endTime
    );
  }
  
  /**
   * Find which audio file should be playing at a given position
   * 
   * @param {number} position - Timeline position in seconds
   * @param {object} section - Section object (optional, for efficiency)
   * @returns {object} Audio file object
   */
  findAudioFileAtPosition(position, section = null) {
    if (!section) {
      section = this.findSectionAtPosition(position);
    }
    if (!section) return null;
    
    return section.audioFiles.find(
      file => position >= file.startTime && position < file.endTime
    );
  }
  
  /**
   * Interpolate position along a geographic path
   * 
   * @param {Array} path - Array of [lat, lng] coordinates
   * @param {number} progress - Progress along path (0-1)
   * @returns {Array} [lat, lng] interpolated position
   */
  interpolateGeoPosition(path, progress) {
    if (progress <= 0) return path[0];
    if (progress >= 1) return path[path.length - 1];
    
    // Calculate cumulative distances along path
    const distances = [0];
    let totalDist = 0;
    
    for (let i = 0; i < path.length - 1; i++) {
      const [lat1, lng1] = path[i];
      const [lat2, lng2] = path[i + 1];
      const segmentDist = this.haversineDistance(lat1, lng1, lat2, lng2);
      totalDist += segmentDist;
      distances.push(totalDist);
    }
    
    // Find target distance
    const targetDist = progress * totalDist;
    
    // Find which segment we're in
    let segmentIndex = 0;
    for (let i = 0; i < distances.length - 1; i++) {
      if (targetDist >= distances[i] && targetDist < distances[i + 1]) {
        segmentIndex = i;
        break;
      }
    }
    
    // Interpolate within segment
    const segmentStart = distances[segmentIndex];
    const segmentEnd = distances[segmentIndex + 1];
    const segmentProgress = (targetDist - segmentStart) / (segmentEnd - segmentStart);
    
    const [lat1, lng1] = path[segmentIndex];
    const [lat2, lng2] = path[segmentIndex + 1];
    
    const lat = lat1 + (lat2 - lat1) * segmentProgress;
    const lng = lng1 + (lng2 - lng1) * segmentProgress;
    
    return [lat, lng];
  }
  
  /**
   * Get section by ID
   * 
   * @param {string} sectionId - Section ID
   * @returns {object} Section object
   */
  getSectionById(sectionId) {
    return this.processedSections.find(s => s.id === sectionId);
  }
  
  /**
   * Get section by index
   * 
   * @param {number} index - Section index (0-3)
   * @returns {object} Section object
   */
  getSectionByIndex(index) {
    return this.processedSections[index];
  }
  
  /**
   * Get all sections
   * 
   * @returns {Array} Array of processed section objects
   */
  getAllSections() {
    return this.processedSections;
  }
  
  /**
   * Get total duration
   * 
   * @returns {number} Total duration in seconds
   */
  getTotalDuration() {
    return this.totalDuration;
  }
}
