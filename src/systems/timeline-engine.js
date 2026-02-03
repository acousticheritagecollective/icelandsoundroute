/**
 * TIMELINE ENGINE
 * 
 * The master clock and single source of truth for the entire installation.
 * Calculates absolute position in the 4-hour audio timeline based on time-of-day.
 * 
 * RESPONSIBILITIES:
 * - Calculate entry point based on current time (24h cycle → 4h audio loop)
 * - Maintain absolute timeline position (0 to totalDuration seconds)
 * - Emit position updates at regular intervals
 * - All other systems react to timeline position
 * 
 * IMPORTANT: Audio playback follows the timeline, not the other way around.
 * If audio drifts, we resync audio to match timeline position.
 */

export class TimelineEngine {
  constructor(totalDuration) {
    this.totalDuration = totalDuration; // Total audio duration in seconds
    this.startTime = null;              // When playback started (timestamp)
    this.startPosition = null;          // What timeline position we started at
    this.isPlaying = false;
    this.updateInterval = null;
    this.listeners = [];
    
    // For sync checking
    this.lastSyncCheck = 0;
    this.syncCheckInterval = 5000; // Check every 5 seconds
  }
  
  /**
   * Calculate the current timeline position based on time-of-day
   * Maps 24-hour day cycle to 4-hour audio loop
   * 
   * @returns {number} Position in seconds (0 to totalDuration)
   */
  calculatePositionFromTimeOfDay() {
    const now = new Date();
    
    // Get seconds since midnight
    const secondsSinceMidnight = 
      now.getHours() * 3600 + 
      now.getMinutes() * 60 + 
      now.getSeconds() + 
      now.getMilliseconds() / 1000;
    
    // Map 24 hours (86400 seconds) to audio duration using modulo
    // This creates a repeating cycle: audio loops 6 times per day if duration is 4 hours
    const position = secondsSinceMidnight % this.totalDuration;
    
    return position;
  }
  
  /**
   * Start the timeline
   * Calculates entry point and begins emitting position updates
   */
  start() {
    if (this.isPlaying) return;
    
    // Calculate where we should be right now
    this.startPosition = this.calculatePositionFromTimeOfDay();
    this.startTime = performance.now();
    this.isPlaying = true;
    
    console.log(`Timeline started at position: ${this.startPosition.toFixed(2)}s`);
    
    // Emit initial position immediately
    this.emitUpdate();
    
    // Start update loop (60fps for smooth visualization)
    this.updateInterval = setInterval(() => {
      this.emitUpdate();
      this.checkSync();
    }, 1000 / 60);
  }
  
  /**
   * Stop the timeline
   */
  stop() {
    if (!this.isPlaying) return;
    
    this.isPlaying = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    console.log('Timeline stopped');
  }
  
  /**
   * Get current timeline position
   * 
   * @returns {number} Current position in seconds
   */
  getCurrentPosition() {
    if (!this.isPlaying) {
      return this.startPosition || 0;
    }
    
    // Calculate elapsed time since start
    const elapsed = (performance.now() - this.startTime) / 1000;
    
    // Add elapsed time to start position
    let position = this.startPosition + elapsed;
    
    // Handle wraparound (timeline loops)
    position = position % this.totalDuration;
    
    return position;
  }
  
  /**
   * Get current position as a percentage (0-1)
   * 
   * @returns {number} Position as percentage of total duration
   */
  getCurrentProgress() {
    return this.getCurrentPosition() / this.totalDuration;
  }
  
  /**
   * Emit position update to all listeners
   */
  emitUpdate() {
    const position = this.getCurrentPosition();
    const progress = this.getCurrentProgress();
    
    const data = {
      position,      // Absolute position in seconds
      progress,      // Position as percentage (0-1)
      totalDuration: this.totalDuration,
      timestamp: performance.now()
    };
    
    // Notify all registered listeners
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in timeline listener:', error);
      }
    });
  }
  
  /**
   * Check if we need to resync based on time-of-day
   * Useful for catching clock changes or long-running sessions
   */
  checkSync() {
    const now = performance.now();
    if (now - this.lastSyncCheck < this.syncCheckInterval) return;
    
    this.lastSyncCheck = now;
    
    // Calculate what position we SHOULD be at based on time-of-day
    const expectedPosition = this.calculatePositionFromTimeOfDay();
    const currentPosition = this.getCurrentPosition();
    
    // If drift exceeds 2 seconds, resync
    const drift = Math.abs(expectedPosition - currentPosition);
    if (drift > 2.0) {
      console.warn(`Timeline drift detected: ${drift.toFixed(2)}s. Resyncing...`);
      this.resync();
    }
  }
  
  /**
   * Resync timeline to time-of-day
   * Called when drift is detected or manually
   */
  resync() {
    this.startPosition = this.calculatePositionFromTimeOfDay();
    this.startTime = performance.now();
    console.log(`Timeline resynced to position: ${this.startPosition.toFixed(2)}s`);
    this.emitUpdate();
  }
  
  /**
   * Register a listener for timeline updates
   * 
   * @param {Function} callback - Function to call on each update
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  /**
   * Seek to a specific position (for testing/debugging)
   * In production, timeline is driven by time-of-day only
   * 
   * @param {number} position - Position in seconds
   */
  seekTo(position) {
    this.startPosition = position % this.totalDuration;
    this.startTime = performance.now();
    console.log(`Timeline seeked to position: ${this.startPosition.toFixed(2)}s`);
    this.emitUpdate();
  }
  
  /**
   * Get diagnostic information
   * 
   * @returns {object} Diagnostic data
   */
  getDiagnostics() {
    return {
      isPlaying: this.isPlaying,
      currentPosition: this.getCurrentPosition(),
      currentProgress: this.getCurrentProgress(),
      totalDuration: this.totalDuration,
      startPosition: this.startPosition,
      timeOfDayPosition: this.calculatePositionFromTimeOfDay(),
      drift: Math.abs(
        this.getCurrentPosition() - this.calculatePositionFromTimeOfDay()
      )
    };
  }
}
