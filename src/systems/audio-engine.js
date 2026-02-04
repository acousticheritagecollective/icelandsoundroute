/**
 * AUDIO ENGINE
 * 
 * Manages continuous sequential audio playback across file boundaries.
 * Audio follows the timeline, not the other way around.
 * 
 * FEATURES:
 * - Gapless playback between tracks
 * - Preloading of current + next track
 * - Seeking to arbitrary positions
 * - Sync correction when drift is detected
 * - Web Audio API integration (for future analysis/effects)
 * 
 * ARCHITECTURE:
 * - Uses HTML5 Audio elements for streaming
 * - Routes through Web Audio API for future extensibility
 * - Maintains queue of current + upcoming audio
 */

export class AudioEngine {
  constructor(routeMapping) {
    this.routeMapping = routeMapping;
    this.audioContext = null;
    this.currentAudio = null;
    this.nextAudio = null;
    this.currentFileInfo = null;
    this.isPlaying = false;
    this.masterGainNode = null;
    this.analyser = null; // For frequency analysis
    
    // Preload tracking
    this.preloadedFiles = new Set();
    
    // Sync checking
    this.lastSyncCheck = 0;
    this.syncCheckInterval = 5000; // Check sync every 5 seconds
    this.syncThreshold = 0.5; // Resync if drift exceeds 0.5 seconds
  }
  
  /**
   * Initialize audio engine
   * Creates Web Audio context and sets up routing
   */
  async initialize() {
    try {
      // Create Web Audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create master gain node for volume control
      this.masterGainNode = this.audioContext.createGain();
      this.masterGainNode.connect(this.audioContext.destination);
      
      // Create analyser node for frequency visualization
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64; // Small size for 15 bars
      this.analyser.smoothingTimeConstant = 0.8;
      this.masterGainNode.connect(this.analyser);
      
      console.log('Audio engine initialized');
      console.log('  Sample rate:', this.audioContext.sampleRate);
      console.log('  State:', this.audioContext.state);
      
      return true;
    } catch (error) {
      console.error('Failed to initialize audio engine:', error);
      return false;
    }
  }
  
  /**
   * Get frequency data for visualization
   * Returns array of values 0-255
   */
  getFrequencyData() {
    if (!this.analyser) return null;
    
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);
    
    return dataArray;
  }
  
  /**
   * Start playback at a specific timeline position
   * 
   * @param {number} position - Timeline position in seconds
   */
  async startAtPosition(position) {
    // Resume audio context if suspended (for autoplay policies)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    
    // Get context for this position
    const context = this.routeMapping.getContextAtPosition(position);
    if (!context) {
      console.error('Cannot start: no context for position', position);
      return false;
    }
    
    console.log('Starting audio at position:', position);
    console.log('  Section:', context.section.name);
    console.log('  Audio file:', context.audio.file.url);
    console.log('  Offset in file:', context.audio.offsetInFile.toFixed(2), 'seconds');
    
    // Load and play current file
    await this.loadAndPlayFile(
      context.audio.file,
      context.audio.offsetInFile
    );
    
    this.currentFileInfo = context.audio.file;
    this.isPlaying = true;
    
    // Preload next file
    this.preloadNextFile(position);
    
    return true;
  }
  
  /**
   * Load and play an audio file at a specific offset
   * 
   * @param {object} fileInfo - Audio file info from route mapping
   * @param {number} offset - Offset in seconds to start playback
   */
  async loadAndPlayFile(fileInfo, offset = 0) {
    // Create new audio element
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'auto';
    
    // Create media element source and connect to Web Audio API
    const source = this.audioContext.createMediaElementSource(audio);
    source.connect(this.masterGainNode);
    
    // Set up event listeners
    audio.addEventListener('ended', () => this.onAudioEnded());
    audio.addEventListener('error', (e) => this.onAudioError(e, fileInfo));
    
    // Load the file
    audio.src = fileInfo.url;
    
    try {
      await audio.load();
      
      // Seek to offset
      if (offset > 0) {
        audio.currentTime = offset;
      }
      
      // Play
      await audio.play();
      
      // Store as current audio
      if (this.currentAudio) {
        this.currentAudio.pause();
      }
      this.currentAudio = audio;
      
      console.log(`Playing: ${fileInfo.url} at ${offset.toFixed(2)}s`);
      
    } catch (error) {
      console.error('Error loading/playing audio file:', error);
      throw error;
    }
  }
  
  /**
   * Preload next audio file
   * 
   * @param {number} currentPosition - Current timeline position
   */
  async preloadNextFile(currentPosition) {
    const context = this.routeMapping.getContextAtPosition(currentPosition);
    if (!context) return;
    
    // Find next file
    const currentFileIndex = context.audio.file.index;
    const currentSectionIndex = context.section.index;
    
    let nextFile = null;
    
    // Check if there's another file in current section
    if (currentFileIndex < context.section.audioFiles?.length - 1) {
      // Next file is in same section
      const section = this.routeMapping.getSectionByIndex(currentSectionIndex);
      nextFile = section.audioFiles[currentFileIndex + 1];
    } else {
      // Need to go to next section
      const nextSection = this.routeMapping.getSectionByIndex(currentSectionIndex + 1);
      if (nextSection) {
        nextFile = nextSection.audioFiles[0];
      } else {
        // We're at the last file of last section - next is first file of first section
        const firstSection = this.routeMapping.getSectionByIndex(0);
        nextFile = firstSection.audioFiles[0];
      }
    }
    
    if (!nextFile) return;
    
    // Check if already preloaded
    if (this.preloadedFiles.has(nextFile.url)) {
      return;
    }
    
    console.log('Preloading next file:', nextFile.url);
    
    // Create audio element for preloading
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'auto';
    audio.src = nextFile.url;
    
    this.nextAudio = audio;
    this.preloadedFiles.add(nextFile.url);
  }
  
  /**
   * Handle audio file ended event
   * Automatically transition to next file
   */
  onAudioEnded() {
    console.log('Current audio file ended, transitioning to next...');
    
    // If we have next audio preloaded, play it
    if (this.nextAudio) {
      const audio = this.nextAudio;
      
      // Create source and connect
      const source = this.audioContext.createMediaElementSource(audio);
      source.connect(this.masterGainNode);
      
      audio.play().catch(error => {
        console.error('Error playing next audio:', error);
      });
      
      this.currentAudio = audio;
      this.nextAudio = null;
    }
  }
  
  /**
   * Handle audio error
   */
  onAudioError(event, fileInfo) {
    console.error('Audio error:', event);
    console.error('File:', fileInfo.url);
    // Could implement retry logic here
  }
  
  /**
   * Sync audio playback to expected timeline position
   * Called periodically to correct drift
   * 
   * @param {number} expectedPosition - Where audio should be according to timeline
   */
  syncToPosition(expectedPosition) {
    if (!this.currentAudio || !this.isPlaying) return;
    
    const context = this.routeMapping.getContextAtPosition(expectedPosition);
    if (!context) return;
    
    // Check if we're still playing the correct file
    if (context.audio.file.url !== this.currentFileInfo?.url) {
      console.warn('Audio file mismatch detected. Reloading...');
      this.startAtPosition(expectedPosition);
      return;
    }
    
    // Check if current time matches expected offset
    const expectedOffset = context.audio.offsetInFile;
    const actualOffset = this.currentAudio.currentTime;
    const drift = Math.abs(expectedOffset - actualOffset);
    
    if (drift > this.syncThreshold) {
      console.warn(`Audio drift detected: ${drift.toFixed(2)}s. Correcting...`);
      this.currentAudio.currentTime = expectedOffset;
    }
  }
  
  /**
   * Update audio engine based on timeline position
   * Called on each timeline update
   * 
   * @param {object} timelineData - Data from timeline engine
   */
  update(timelineData) {
    if (!this.isPlaying) return;
    
    // Periodic sync check
    const now = performance.now();
    if (now - this.lastSyncCheck > this.syncCheckInterval) {
      this.syncToPosition(timelineData.position);
      this.lastSyncCheck = now;
    }
  }
  
  /**
   * Pause playback
   */
  pause() {
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
    this.isPlaying = false;
  }
  
  /**
   * Resume playback
   */
  async resume() {
    if (this.currentAudio) {
      await this.currentAudio.play();
    }
    this.isPlaying = true;
  }
  
  /**
   * Set master volume
   * 
   * @param {number} volume - Volume level (0-1)
   */
  setVolume(volume) {
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }
  
  /**
   * Get current playback state
   * 
   * @returns {object} State information
   */
  getState() {
    return {
      isPlaying: this.isPlaying,
      currentFile: this.currentFileInfo?.url || null,
      currentTime: this.currentAudio?.currentTime || 0,
      volume: this.masterGainNode?.gain.value || 1,
      audioContextState: this.audioContext?.state || 'unknown'
    };
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (this.nextAudio) {
      this.nextAudio.pause();
      this.nextAudio = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.preloadedFiles.clear();
  }
}
