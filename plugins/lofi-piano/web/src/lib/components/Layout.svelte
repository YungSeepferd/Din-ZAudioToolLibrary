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
  let isChordGeneratorOpen = $state(false); // Collapsible chord generator

  // Initialize audio system on component mount (without unlocking yet)
  onMount(async () => {
    try {
      // Initialize audio system (creates AudioContext but doesn't unlock it)
      await audioState.init();

      isReady = true;
      console.log('✓ LoFi Piano initialized');
      console.log('  - Audio context created');
      console.log('  - Effect chain connected');
      console.log('  - Waiting for user interaction to unlock audio');
    } catch (err) {
      console.error('Failed to initialize audio:', err);
      error = err.message;
    }
  });

  /**
   * Unlock AudioContext on user interaction
   * MUST be called in response to user event (click, touch, etc.)
   */
  async function handleUserInteraction() {
    if (isReady && !error) {
      try {
        await unlockAudioContext();
      } catch (err) {
        console.error('Failed to unlock audio:', err);
        error = err.message;
      }
    }
  }

  /**
   * Toggle chord generator visibility
   */
  function toggleChordGenerator() {
    isChordGeneratorOpen = !isChordGeneratorOpen;
  }
</script>

<main onclick={handleUserInteraction}>
  <div class="container">
    <!-- Header Section -->
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">🎹 LoFi Piano</h1>
        <p class="app-subtitle">Nostalgic warm piano for lo-fi beats</p>
      </div>

      {#if isReady}
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
      <!-- Main Content - Unified Single Screen -->
      <div class="app-content">
        <!-- Piano Section (Always Visible) -->
        <section class="piano-section" aria-label="Piano keyboard and controls">
          <ControlPanel {audioState} />
          <div class="keyboard-wrapper">
            <PianoKeyboard {audioState} />
          </div>
        </section>

        <!-- Chord Generator Section (Collapsible) -->
        <section class="chord-section" aria-label="Chord generator tools">
          <button
            class="section-toggle"
            onclick={toggleChordGenerator}
            aria-expanded={isChordGeneratorOpen}
            aria-controls="chord-generator-panel"
          >
            <span class="toggle-icon" class:expanded={isChordGeneratorOpen}>▶</span>
            <span class="toggle-title">Chord Generator</span>
            <span class="toggle-hint">
              {isChordGeneratorOpen ? 'Hide' : 'Show'} chord building tools
            </span>
          </button>

          {#if isChordGeneratorOpen}
            <div
              class="chord-panel"
              id="chord-generator-panel"
              role="region"
              aria-label="Chord generator content"
            >
              <ChordGenerator {audioState} />
            </div>
          {/if}
        </section>
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
     MAIN CONTENT - UNIFIED LAYOUT
     ======================================== */

  .app-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--gap-sections);
  }

  /* Piano Section (Always Visible) */
  .piano-section {
    display: flex;
    flex-direction: column;
    gap: var(--gap-sections);
    animation: fadeIn var(--transition-base) var(--ease-out);
  }

  .keyboard-wrapper {
    width: 100%;
  }

  /* Chord Generator Section (Collapsible) */
  .chord-section {
    margin-top: var(--space-4);
  }

  .section-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-6);
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: var(--border-default);
    border-radius: var(--border-radius-lg);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    cursor: pointer;
    transition: var(--transition-colors);
    letter-spacing: var(--letter-spacing-wide);
    text-align: left;
  }

  .section-toggle:hover {
    background: var(--accent);
    border-color: var(--accent-hover);
    box-shadow: var(--shadow-md);
  }

  .section-toggle:focus-visible {
    outline: var(--border-width-normal) solid var(--accent);
    outline-offset: 2px;
  }

  .toggle-icon {
    font-size: var(--font-size-sm);
    transition: transform 0.2s var(--ease-out);
    flex-shrink: 0;
  }

  .toggle-icon.expanded {
    transform: rotate(90deg);
  }

  .toggle-title {
    flex: 1;
    font-weight: var(--font-weight-bold);
  }

  .toggle-hint {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    font-weight: var(--font-weight-normal);
  }

  .chord-panel {
    margin-top: var(--space-4);
    animation: slideDown 0.3s var(--ease-out);
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

  @keyframes slideDown {
    from {
      opacity: 0;
      max-height: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      max-height: 2000px;
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

    .section-toggle {
      padding: var(--space-3) var(--space-4);
      font-size: var(--font-size-base);
    }

    .toggle-hint {
      display: none;
    }

    .status-info {
      flex-direction: column;
      gap: var(--space-2);
    }

    .piano-section {
      gap: var(--gap-controls);
    }
  }

  /* ========================================
     ACCESSIBILITY
     ======================================== */

  @media (prefers-reduced-motion: reduce) {
    .piano-section,
    .chord-panel {
      animation: none;
    }

    .toggle-icon {
      transition: none;
    }

    .spinner {
      animation: spin 2s linear infinite;
    }
  }
</style>
