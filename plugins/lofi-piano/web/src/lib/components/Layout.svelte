<!--
  Main Layout Component

  Renders the complete LoFi Piano UI including:
  - Piano keyboard
  - Control panel with effect parameters
  - Audio state management
-->

<script>
  import { onMount } from 'svelte';
  import { unlockAudioContext } from '$audio/context.js';
  import { createAudioState } from '$stores/audio-state.svelte.js';
  import PianoKeyboard from '$components/piano/PianoKeyboard.svelte';
  import ControlPanel from '$components/controls/ControlPanel.svelte';

  // Create audio state instance
  const audioState = createAudioState();

  let isReady = false;
  let error = null;
  let showControls = true;

  onMount(async () => {
    try {
      // Unlock AudioContext for iOS/mobile browsers
      await unlockAudioContext();

      // Initialize audio system
      await audioState.init();

      isReady = true;
      console.log('✓ LoFi Piano initialized');
      console.log('  - Audio context ready');
      console.log('  - Effect chain connected');
      console.log('  - Ready to play');
    } catch (err) {
      console.error('Failed to initialize audio:', err);
      error = err.message;
    }
  });

  /**
   * Toggle control panel visibility
   */
  function toggleControls() {
    showControls = !showControls;
  }
</script>

<main>
  <div class="container">
    <!-- Header Section -->
    <div class="header">
      <h1>🎹 LoFi Piano</h1>
      <p class="subtitle">Nostalgic warm piano for lo-fi hip-hop beats</p>

      {#if isReady}
        <div class="status-bar">
          <span class="status-indicator active">● Live</span>
          <span class="note-count">
            {audioState.pianoState.activeNotes.size} notes playing
          </span>
          <button class="toggle-btn" on:click={toggleControls}>
            {showControls ? '▼ Hide Controls' : '▶ Show Controls'}
          </button>
        </div>
      {/if}
    </div>

    {#if error}
      <!-- Error State -->
      <div class="error-state">
        <p class="error-icon">⚠️</p>
        <h2>Audio Initialization Failed</h2>
        <p class="error-message">{error}</p>
        <p class="error-help">
          Try refreshing the page or check browser console for details.
        </p>
      </div>
    {:else if isReady}
      <!-- Main Content -->
      <div class="content">
        <!-- Control Panel Section -->
        {#if showControls}
          <div class="controls-section">
            <ControlPanel {audioState} />
          </div>
        {/if}

        <!-- Piano Keyboard Section -->
        <div class="keyboard-section">
          <PianoKeyboard {audioState} />
        </div>

        <!-- Info Section -->
        <div class="info-section">
          <div class="info-card">
            <h3>🎵 Getting Started</h3>
            <ul>
              <li>Click piano keys to play notes</li>
              <li>Use QWERTY keys (Z-M) for keyboard playing</li>
              <li>Adjust controls above to shape your sound</li>
              <li>Drag across keys for glissando effect</li>
            </ul>
          </div>

          <div class="info-card">
            <h3>🎛️ Quick Tips</h3>
            <ul>
              <li><strong>Saturation:</strong> Adds warm, tape-like color</li>
              <li><strong>Compression:</strong> Controls dynamics</li>
              <li><strong>Reverb:</strong> Adds space and ambience</li>
              <li><strong>Envelope:</strong> Shapes note attack and decay</li>
            </ul>
          </div>
        </div>
      </div>
    {:else}
      <!-- Loading State -->
      <div class="loading">
        <div class="spinner"></div>
        <p>Initializing audio system...</p>
        <p class="loading-hint">Click anywhere to unlock audio (iOS/mobile)</p>
      </div>
    {/if}
  </div>
</main>

<style>
  main {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
  }

  .container {
    max-width: 1400px;
    width: 100%;
    background: rgba(30, 41, 59, 0.8);
    border-radius: 16px;
    padding: 2rem;
    border: 1px solid rgba(100, 116, 139, 0.2);
    backdrop-filter: blur(10px);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }

  .header {
    text-align: center;
    margin-bottom: 2rem;
    border-bottom: 2px solid rgba(100, 116, 139, 0.3);
    padding-bottom: 1.5rem;
  }

  h1 {
    font-size: 2.5rem;
    margin: 0;
    color: #f1f5f9;
    font-weight: 700;
  }

  .subtitle {
    margin: 0.5rem 0 0;
    color: #cbd5e1;
    font-size: 1rem;
  }

  .status-bar {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    margin-top: 1rem;
    padding-top: 1rem;
  }

  .status-indicator {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #94a3b8;
  }

  .status-indicator.active {
    color: #22c55e;
  }

  .note-count {
    font-size: 0.875rem;
    color: #cbd5e1;
    font-weight: 500;
    padding: 0.25rem 0.75rem;
    background: rgba(96, 165, 250, 0.1);
    border-radius: var(--border-radius-sm);
  }

  .toggle-btn {
    padding: 0.5rem 1rem;
    background: rgba(96, 165, 250, 0.1);
    color: var(--accent);
    border: 1px solid rgba(96, 165, 250, 0.3);
    border-radius: var(--border-radius-sm);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .toggle-btn:hover {
    background: rgba(96, 165, 250, 0.2);
    border-color: rgba(96, 165, 250, 0.5);
  }

  .toggle-btn:active {
    transform: scale(0.98);
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .controls-section {
    width: 100%;
  }

  .keyboard-section {
    width: 100%;
  }

  .info-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
  }

  .info-card {
    background: rgba(15, 23, 42, 0.4);
    border: 1px solid rgba(96, 165, 250, 0.1);
    border-radius: var(--border-radius-md);
    padding: 1.5rem;
  }

  .info-card h3 {
    margin: 0 0 1rem 0;
    color: var(--accent);
    font-size: 1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .info-card ul {
    margin: 0;
    padding-left: 1.5rem;
    color: var(--text-secondary);
    font-size: 0.875rem;
    line-height: 1.6;
  }

  .info-card li {
    margin-bottom: 0.5rem;
  }

  .info-card strong {
    color: var(--text-primary);
    font-weight: 600;
  }

  .error-state {
    text-align: center;
    padding: 4rem 2rem;
    color: #fca5a5;
  }

  .error-icon {
    font-size: 4rem;
    margin: 0;
  }

  .error-state h2 {
    color: #fca5a5;
    margin: 1rem 0;
  }

  .error-message {
    color: #fecaca;
    font-family: 'Monaco', 'Courier New', monospace;
    background: rgba(239, 68, 68, 0.1);
    padding: 1rem;
    border-radius: var(--border-radius-sm);
    border: 1px solid rgba(239, 68, 68, 0.3);
    margin: 1rem 0;
  }

  .error-help {
    color: #cbd5e1;
    font-size: 0.875rem;
  }

  .loading {
    text-align: center;
    color: #cbd5e1;
    padding: 4rem 2rem;
  }

  .spinner {
    width: 50px;
    height: 50px;
    margin: 0 auto 1.5rem;
    border: 4px solid rgba(96, 165, 250, 0.2);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading p {
    margin: 0.5rem 0;
    color: #cbd5e1;
    font-size: 1rem;
  }

  .loading-hint {
    font-size: 0.875rem;
    color: #94a3b8;
    font-style: italic;
  }

  /* Responsive design */
  @media (max-width: 1024px) {
    .container {
      padding: 1.5rem;
    }

    h1 {
      font-size: 2rem;
    }

    .status-bar {
      flex-direction: column;
      gap: 0.75rem;
    }
  }

  @media (max-width: 768px) {
    main {
      padding: 1rem;
    }

    .container {
      padding: 1rem;
    }

    h1 {
      font-size: 1.75rem;
    }

    .subtitle {
      font-size: 0.875rem;
    }

    .info-section {
      grid-template-columns: 1fr;
    }

    .content {
      gap: 1.5rem;
    }
  }
</style>
