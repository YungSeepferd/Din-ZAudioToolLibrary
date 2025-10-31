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
  import ChordGenerator from '$components/chord-generator/ChordGenerator.svelte';

  // Create audio state instance
  const audioState = createAudioState();

  let isReady = $state(false);
  let error = $state(null);
  let currentView = $state('piano'); // 'piano' | 'chords'

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
   * Switch between Piano and Chord Generator views
   */
  function switchView(view) {
    currentView = view;
  }
</script>

<main>
  <div class="container">
    <!-- Header Section -->
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">🎹 LoFi Piano</h1>
        <p class="app-subtitle">Nostalgic warm piano for lo-fi beats</p>
      </div>
      
      {#if isReady}
        <!-- Tab Navigation -->
        <div class="view-tabs" role="tablist">
          <button
            class="tab"
            class:active={currentView === 'piano'}
            onclick={() => switchView('piano')}
            role="tab"
            aria-selected={currentView === 'piano'}
            aria-controls="piano-panel"
          >
            Piano
          </button>
          <button
            class="tab"
            class:active={currentView === 'chords'}
            onclick={() => switchView('chords')}
            role="tab"
            aria-selected={currentView === 'chords'}
            aria-controls="chords-panel"
          >
            Chord Generator
          </button>
        </div>
        
        <!-- Status Info -->
        <div class="status-info">
          <span class="status-indicator">● Live</span>
          <span class="note-count">
            {audioState.pianoState.activeNotes.size} notes
          </span>
        </div>
      {/if}
    </header>

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
      <!-- Main Content with View Switching -->
      <div class="app-content">
        {#if currentView === 'piano'}
          <div class="piano-view" id="piano-panel" role="tabpanel">
            <ControlPanel {audioState} />
            <div class="keyboard-wrapper">
              <PianoKeyboard {audioState} />
            </div>
          </div>
        {:else if currentView === 'chords'}
          <div class="chords-view" id="chords-panel" role="tabpanel">
            <ChordGenerator {audioState} />
          </div>
        {/if}
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
  /* ========================================
     LAYOUT CONTAINER - Vintage Aesthetic
     ======================================== */
  
  main {
    min-height: 100vh;
    padding: var(--space-6);
    background: var(--bg-primary);
  }

  .container {
    max-width: var(--container-2xl);
    width: 100%;
    margin: 0 auto;
  }

  /* ========================================
     HEADER & NAVIGATION
     ======================================== */
  
  .app-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding-bottom: var(--space-6);
    margin-bottom: var(--space-8);
    border-bottom: 2px solid var(--border-color);
  }

  .header-content {
    text-align: center;
  }

  .app-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
    margin: 0 0 var(--space-2) 0;
    letter-spacing: var(--letter-spacing-wide);
  }

  .app-subtitle {
    font-size: var(--font-size-base);
    color: var(--text-secondary);
    margin: 0;
    font-weight: var(--font-weight-normal);
  }

  /* Tab Navigation */
  .view-tabs {
    display: flex;
    justify-content: center;
    gap: var(--space-2);
    padding: 0;
  }

  .tab {
    padding: var(--space-3) var(--space-6);
    background: var(--bg-secondary);
    color: var(--text-secondary);
    border: var(--border-default);
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    cursor: pointer;
    transition: var(--transition-colors);
    letter-spacing: var(--letter-spacing-wide);
  }

  .tab:hover {
    background: var(--accent);
    color: var(--text-primary);
    border-color: var(--accent-hover);
  }

  .tab.active {
    background: var(--accent);
    color: var(--text-primary);
    border-color: var(--accent-hover);
    box-shadow: var(--shadow-md);
  }

  .tab:focus-visible {
    outline: var(--border-width-normal) solid var(--accent);
    outline-offset: 2px;
  }

  /* Status Info */
  .status-info {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--space-4);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }

  .status-indicator {
    color: var(--color-success);
    font-weight: var(--font-weight-semibold);
  }

  .note-count {
    padding: var(--space-1) var(--space-3);
    background: var(--bg-secondary);
    border-radius: var(--border-radius-sm);
    border: var(--border-default);
    font-weight: var(--font-weight-medium);
    font-family: var(--font-family-mono);
  }

  /* ========================================
     MAIN CONTENT VIEWS
     ======================================== */
  
  .app-content {
    width: 100%;
  }

  .piano-view,
  .chords-view {
    display: flex;
    flex-direction: column;
    gap: var(--gap-sections);
    animation: fadeIn var(--transition-base) var(--ease-out);
  }

  .keyboard-wrapper {
    width: 100%;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* ========================================
     ERROR STATE
     ======================================== */
  
  .error-state {
    text-align: center;
    padding: var(--space-16);
    color: var(--color-error);
  }

  .error-icon {
    font-size: 4rem;
    margin: 0;
  }

  .error-state h2 {
    color: var(--color-error);
    margin: var(--space-4) 0;
    font-weight: var(--font-weight-bold);
  }

  .error-message {
    color: var(--color-error);
    font-family: var(--font-family-mono);
    background: var(--bg-secondary);
    padding: var(--space-4);
    border-radius: var(--border-radius-md);
    border: var(--border-width-thin) solid var(--color-error);
    margin: var(--space-4) auto;
    max-width: 600px;
    font-size: var(--font-size-sm);
  }

  .error-help {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    margin-top: var(--space-4);
  }

  /* ========================================
     LOADING STATE
     ======================================== */
  
  .loading {
    text-align: center;
    color: var(--text-secondary);
    padding: var(--space-16);
  }

  .spinner {
    width: 50px;
    height: 50px;
    margin: 0 auto var(--space-6);
    border: 4px solid var(--border-color);
    border-top-color: var(--accent);
    border-radius: var(--border-radius-full);
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading p {
    margin: var(--space-2) 0;
    color: var(--text-primary);
    font-size: var(--font-size-base);
  }

  .loading-hint {
    font-size: var(--font-size-sm);
    color: var(--text-muted);
    font-style: italic;
  }

  /* ========================================
     RESPONSIVE DESIGN
     ======================================== */
  
  @media (max-width: 1024px) {
    main {
      padding: var(--space-4);
    }

    .app-header {
      gap: var(--space-3);
    }

    .app-title {
      font-size: var(--font-size-xl);
    }
  }

  @media (max-width: 768px) {
    main {
      padding: var(--space-3);
    }

    .app-header {
      gap: var(--space-3);
      margin-bottom: var(--space-6);
    }

    .app-title {
      font-size: var(--font-size-lg);
    }

    .app-subtitle {
      font-size: var(--font-size-sm);
    }

    .view-tabs {
      flex-direction: column;
      gap: var(--space-2);
    }

    .tab {
      width: 100%;
    }

    .status-info {
      flex-direction: column;
      gap: var(--space-2);
    }

    .piano-view,
    .chords-view {
      gap: var(--gap-controls);
    }
  }

  /* ========================================
     ACCESSIBILITY
     ======================================== */
  
  @media (prefers-reduced-motion: reduce) {
    .piano-view,
    .chords-view {
      animation: none;
    }

    .spinner {
      animation: spin 2s linear infinite;
    }
  }
</style>
