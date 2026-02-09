/**
 * UI COMPONENT
 * 
 * Handles user interaction and displays loading/error states.
 * 
 * FEATURES:
 * - "Tune In" button (for autoplay policy compliance)
 * - Loading indicator
 * - Error messages
 * - Optional debug info panel
 */

export class UI {
  constructor(container, stateManager) {
    this.container = container;
    this.stateManager = stateManager;
    
    this.tuneInButton = null;
    this.loadingIndicator = null;
    this.errorDisplay = null;
    this.debugPanel = null;
    
    this.showDebug = false; // Set to true for development
    
    this.initialize();
  }
  
  /**
   * Initialize UI elements
   */
  initialize() {
    // Create tune-in overlay (shown initially)
    this.createTuneInOverlay();
    
    // Create loading indicator (hidden initially)
    this.createLoadingIndicator();
    
    // Create error display (hidden initially)
    this.createErrorDisplay();
    
    // Create debug panel if enabled
    if (this.showDebug) {
      this.createDebugPanel();
    }
  }
  
  /**
   * Create tune-in button overlay
   */
  createTuneInOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'tune-in-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.75);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(10px);
    `;
    
    // Title
    const title = document.createElement('h1');
    title.textContent = 'OUR ICELAND SONIC ROUTE';
    title.style.cssText = `
      color: #E5EBEE;
      font-family: 'Barlow Condensed', 'Helvetica Neue', Helvetica, sans-serif;
      font-size: 3rem;
      font-weight: 300;
      margin-bottom: 2rem;
      text-align: center;
    `;
    overlay.appendChild(title);
    
    // Subtitle
    const subtitle = document.createElement('p');
    subtitle.textContent = 'A continuous binaural journey across Iceland, recorded in 2025. By Ginebra Raventós, Ɇ₥łⱠłØ ₥₳ⱤӾ, Edgardo Gómez and Joan Lavandeira';
    subtitle.style.cssText = `
      color: rgba(232, 241, 242, 0.8);
      font-family: 'Barlow Condensed', 'Helvetica Neue', Helvetica, sans-serif;
      font-size: 1.0rem;
      margin-bottom: 3rem;
      text-align: center;
    `;
    overlay.appendChild(subtitle);
    
    // Tune In button
    const button = document.createElement('button');
    button.textContent = 'Tune In';
    button.id = 'tune-in-button';
    button.style.cssText = `
      padding: 1.5rem 4rem;
      font-size: 1.2rem;
      font-family: 'Barlow Condensed', 'Helvetica Neue', Helvetica, sans-serif;
      font-weight: 500;
color: rgba(0, 26, 35, 0.8);
      background: rgba(232, 241, 242, 0.8);
      border: none;
      border-radius: 50px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 2px;
    `;
    
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.05)';
      button.style.boxShadow = '0 10px 30px rgba(255, 255, 255, 0.3)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = 'none';
    });
    
    button.addEventListener('click', async () => {
      await this.onTuneIn();
    });
    
    overlay.appendChild(button);
    
    this.tuneInButton = button;
    this.container.appendChild(overlay);
  }
  
  /**
   * Create loading indicator
   */
  createLoadingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'loading-indicator';
    indicator.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 1.2rem;
      text-align: center;
      display: none;
      z-index: 999;
    `;
    
    indicator.innerHTML = `
      <div style="margin-bottom: 1rem;">Loading...</div>
      <div style="width: 200px; height: 3px; background: rgba(255,255,255,0.2); border-radius: 2px; overflow: hidden;">
        <div style="width: 0%; height: 100%; background: white; animation: loading 2s infinite;"></div>
      </div>
    `;
    
    // Add loading animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes loading {
        0% { width: 0%; margin-left: 0%; }
        50% { width: 50%; margin-left: 25%; }
        100% { width: 0%; margin-left: 100%; }
      }
    `;
    document.head.appendChild(style);
    
    this.loadingIndicator = indicator;
    this.container.appendChild(indicator);
  }
  
  /**
   * Create error display
   */
  createErrorDisplay() {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'error-display';
    errorDiv.style.cssText = `
      position: fixed;
      top: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 0, 0, 0.9);
      color: white;
      padding: 1rem 2rem;
      border-radius: 8px;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      display: none;
      z-index: 1001;
      max-width: 80%;
      text-align: center;
    `;
    
    this.errorDisplay = errorDiv;
    this.container.appendChild(errorDiv);
  }
  
  /**
   * Create debug panel (for development)
   */
  createDebugPanel() {
    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.style.cssText = `
      position: fixed;
      bottom: 1rem;
      left: 1rem;
      background: rgba(0, 0, 0, 0.8);
      color: #00ff00;
      padding: 1rem;
      font-family: 'Courier New', monospace;
      font-size: 0.8rem;
      border-radius: 8px;
      z-index: 999;
      max-width: 400px;
    `;
    
    this.debugPanel = panel;
    this.container.appendChild(panel);
    
    // Update debug info every second
    setInterval(() => {
      this.updateDebugPanel();
    }, 1000);
  }
  
  /**
   * Handle tune-in button click
   */
  async onTuneIn() {
    const overlay = document.getElementById('tune-in-overlay');
    const button = this.tuneInButton;
    
    // Disable button
    button.disabled = true;
    button.textContent = 'Loading...';
    button.style.opacity = '0.5';
    
    try {
      // Show loading indicator
      this.showLoading(true);
      
      // Start playback
      const success = await this.stateManager.start();
      
      if (success) {
        // Start Iceland cameras
        if (this.icelandCameras) {
          this.icelandCameras.start();
        }
        
        // Fade out overlay
        overlay.style.transition = 'opacity 1s ease';
        overlay.style.opacity = '0';
        
        setTimeout(() => {
          overlay.remove();
        }, 1000);
        
        this.showLoading(false);
      } else {
        throw new Error('Failed to start playback');
      }
      
    } catch (error) {
      console.error('Error starting playback:', error);
      this.showError('Failed to start playback. Please refresh and try again.');
      
      // Re-enable button
      button.disabled = false;
      button.textContent = 'Tune In';
      button.style.opacity = '1';
      
      this.showLoading(false);
    }
  }
  
  /**
   * Show/hide loading indicator
   */
  showLoading(show) {
    if (this.loadingIndicator) {
      this.loadingIndicator.style.display = show ? 'block' : 'none';
    }
  }
  
  /**
   * Show error message
   */
  showError(message, duration = 5000) {
    if (this.errorDisplay) {
      this.errorDisplay.textContent = message;
      this.errorDisplay.style.display = 'block';
      
      if (duration > 0) {
        setTimeout(() => {
          this.errorDisplay.style.display = 'none';
        }, duration);
      }
    }
  }
  
  /**
   * Update debug panel
   */
  updateDebugPanel() {
    if (!this.debugPanel) return;
    
    const state = this.stateManager.getState();
    
    const info = `
      <div style="margin-bottom: 0.5rem; font-weight: bold;">RADIO INSTALLATION DEBUG</div>
      <div>Status: ${state.isPlaying ? 'PLAYING' : 'STOPPED'}</div>
      <div>Position: ${state.timeline?.currentPosition?.toFixed(2) || 0}s</div>
      <div>Progress: ${((state.timeline?.currentProgress || 0) * 100).toFixed(1)}%</div>
      <div>Section: ${state.currentContext?.section?.name || 'N/A'}</div>
      <div>Audio: ${state.audio?.currentFile?.split('/').pop() || 'N/A'}</div>
      <div>Media: ${state.media?.currentMedia?.url?.split('/').pop() || 'N/A'}</div>
      <div>Cache: ${state.media?.cacheSize || 0} items</div>
    `;
    
    this.debugPanel.innerHTML = info;
  }
  
  /**
   * Clean up
   */
  destroy() {
    const overlay = document.getElementById('tune-in-overlay');
    if (overlay) overlay.remove();
    if (this.loadingIndicator) this.loadingIndicator.remove();
    if (this.errorDisplay) this.errorDisplay.remove();
    if (this.debugPanel) this.debugPanel.remove();
  }
}
