<script>
  /**
   * ChordSelector.svelte
   *
   * PURPOSE:
   * Interactive component for selecting the musical key (root note) and scale type.
   * Displays all 12 chromatic notes and 13 available scale types.
   *
   * DESIGN PHILOSOPHY:
   * - Clean, minimal interface following lofi-piano aesthetic
   * - Numbers-free design (no MIDI numbers shown)
   * - Visual feedback showing current key and scale
   * - Comprehensive scale information on hover/selection
   * - Svelte 5 Runes for reactive state management
   *
   * MUSIC THEORY CONTEXT:
   * The root note + scale type define a key. For example:
   * - C Major: All white piano keys (C, D, E, F, G, A, B)
   * - D Minor: Same as F Major (relative minor)
   * - G Dorian: Different mode of C Major
   *
   * SVELTE 5 PATTERNS:
   * - $props() for component input (rootMidi, scaleType, callbacks)
   * - $state() for local reactive state (showScaleInfo)
   * - $derived() for computed values (currentKeyName, currentScaleInfo)
   * - $effect() for side effects (broadcasting changes to parent)
   *
   * USAGE:
   * <ChordSelector
   *   bind:rootMidi={currentKey}
   *   bind:scaleType={currentScale}
   *   onKeyChange={(midi) => console.log('Key changed to', midi)}
   *   onScaleChange={(type) => console.log('Scale changed to', type)}
   * />
   */

  import { onMount } from 'svelte';
  import {
    getAvailableScales,
    getScaleInfo,
    midiToNoteName,
    MIDI_REFERENCE_NOTES
  } from '@audio/music-theory';

  // ===== COMPONENT PROPS (Svelte 5 $props rune) =====
  // rootMidi: MIDI note number for the root (e.g., 60 = C5, Middle C)
  // scaleType: Scale type (e.g., 'major', 'minorNatural', 'dorian')
  // onKeyChange: Callback fired when user changes root note
  // onScaleChange: Callback fired when user changes scale type
  let {
    rootMidi = 60,
    scaleType = 'major',
    onKeyChange = undefined,
    onScaleChange = undefined
  } = $props();

  // ===== LOCAL REACTIVE STATE (Svelte 5 $state rune) =====
  // showScaleInfo: Toggle for displaying scale metadata (pattern, usage, etc.)
  let showScaleInfo = $state(false);

  // ===== CONSTANTS =====
  // 12 chromatic notes (C to B) - these repeat every octave
  const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Standard octave context for UI display (C4 = Middle C, C5 = one octave higher)
  // We'll show octave numbers relative to Middle C (C5 = MIDI 60)
  const DISPLAY_OCTAVE_START = 4;

  // ===== DERIVED STATE (Svelte 5 $derived rune) =====
  // These auto-update whenever rootMidi or scaleType change

  // currentKeyName: Human-readable key name (e.g., "C5 Major", "F# Harmonic Minor")
  let currentKeyName = $derived.by(() => {
    const noteName = midiToNoteName(rootMidi, true);
    const scaleName = getScaleInfo(scaleType)?.name || 'Unknown';
    return `${noteName} ${scaleName}`;
  });

  // currentScaleInfo: Metadata for current scale (intervals, pattern, description)
  let currentScaleInfo = $derived(getScaleInfo(scaleType));

  // availableScales: All 13 available scale types
  let availableScales = $derived(getAvailableScales());

  // noteName: Derived note name of current rootMidi
  let noteName = $derived(midiToNoteName(rootMidi, true));

  // noteIndex: Which chromatic note (0-11) is the root
  let noteIndex = $derived(rootMidi % 12);

  // octaveNumber: Which octave (used for display)
  let octaveNumber = $derived(Math.floor(rootMidi / 12) - 1);

  // ===== EFFECTS (Svelte 5 $effect rune) =====
  // These run when their dependencies change

  // Broadcast key change to parent
  $effect(() => {
    if (onKeyChange) {
      onKeyChange(rootMidi);
    }
  });

  // Broadcast scale change to parent
  $effect(() => {
    if (onScaleChange) {
      onScaleChange(scaleType);
    }
  });

  // ===== HELPER FUNCTIONS =====

  /**
   * Handle root note selection from dropdown
   * User selects a note name (C, C#, D, etc.)
   * We keep the same octave and just change the semitone
   *
   * @param {string} note - Chromatic note name (C, C#, D, etc.)
   * @private
   */
  function handleNoteSelect(note) {
    const noteIdx = CHROMATIC_NOTES.indexOf(note);
    if (noteIdx >= 0) {
      // Keep same octave, change note
      rootMidi = octaveNumber * 12 + 12 + noteIdx;
    }
  }

  /**
   * Handle octave change from input (if user can change it)
   * This adjusts which octave the root note is in
   *
   * @param {number} newOctave - New octave number
   * @private
   */
  function handleOctaveChange(newOctave) {
    // Keep same note, change octave
    rootMidi = (newOctave + 1) * 12 + noteIndex;

    // Clamp to valid MIDI range (0-127)
    rootMidi = Math.max(0, Math.min(127, rootMidi));
  }

  /**
   * Format scale info for display
   * Returns a readable description of the current scale
   *
   * @returns {string} Formatted scale information
   * @private
   */
  function formatScaleInfo() {
    if (!currentScaleInfo) return '';

    const parts = [];
    parts.push(`Pattern: ${currentScaleInfo.pattern}`);
    if (currentScaleInfo.commonUsage) {
      parts.push(`Usage: ${currentScaleInfo.commonUsage.substring(0, 100)}...`);
    }
    return parts.join('\n');
  }
</script>

<!-- ===== COMPONENT TEMPLATE ===== -->
<div class="chord-selector" role="region" aria-label="Key and Scale Selector">
  <!-- Header: Current Key Display -->
  <div class="selector-header">
    <h2 class="current-key">{currentKeyName}</h2>
    <p class="subtitle">Select your musical key and scale</p>
  </div>

  <!-- Main Selection Area -->
  <div class="selector-controls">
    <!-- Root Note Selection -->
    <div class="control-group">
      <label for="note-select" class="control-label">Root Note</label>
      <select
        id="note-select"
        value={noteName.substring(0, noteName.length - 1)}
        onchange={(e) => handleNoteSelect(e.target.value)}
        aria-label="Select root note (C to B)"
      >
        {#each CHROMATIC_NOTES as note}
          <option value={note}>{note}</option>
        {/each}
      </select>
    </div>

    <!-- Octave Adjustment (Optional - for advanced users) -->
    <div class="control-group">
      <label for="octave-input" class="control-label">Octave</label>
      <div class="octave-controls">
        <button
          class="octave-btn"
          onclick={() => handleOctaveChange(octaveNumber - 1)}
          disabled={rootMidi < 12}
          aria-label="Lower octave"
          title="Lower by one octave"
        >
          −
        </button>
        <input
          id="octave-input"
          type="number"
          value={octaveNumber}
          onchange={(e) => handleOctaveChange(parseInt(e.target.value))}
          min="0"
          max="10"
          aria-label="Select octave (0-10)"
        />
        <button
          class="octave-btn"
          onclick={() => handleOctaveChange(octaveNumber + 1)}
          disabled={rootMidi > 115}
          aria-label="Raise octave"
          title="Raise by one octave"
        >
          +
        </button>
      </div>
    </div>

    <!-- Scale Type Selection -->
    <div class="control-group">
      <label for="scale-select" class="control-label">Scale Type</label>
      <select
        id="scale-select"
        value={scaleType}
        onchange={(e) => (scaleType = e.target.value)}
        aria-label="Select scale type (Major, Minor, Modes, Pentatonic, etc.)"
      >
        {#each availableScales as scale}
          <option value={scale}>{getScaleInfo(scale).name}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Scale Information Toggle -->
  <div class="info-section">
    <button
      class="info-toggle"
      onclick={() => (showScaleInfo = !showScaleInfo)}
      aria-expanded={showScaleInfo}
      aria-controls="scale-info"
    >
      <span class="toggle-icon">{showScaleInfo ? '▼' : '▶'}</span>
      Scale Information
    </button>

    <!-- Scale Info Details (collapsible) -->
    {#if showScaleInfo && currentScaleInfo}
      <div id="scale-info" class="scale-info">
        <div class="info-item">
          <span class="info-label">Pattern:</span>
          <span class="info-value">{currentScaleInfo.pattern}</span>
        </div>

        <div class="info-item">
          <span class="info-label">Notes:</span>
          <span class="info-value">{currentScaleInfo.degrees.join(' - ')}</span>
        </div>

        {#if currentScaleInfo.description}
          <div class="info-item">
            <span class="info-label">Feel:</span>
            <span class="info-value">{currentScaleInfo.description}</span>
          </div>
        {/if}

        {#if currentScaleInfo.commonUsage}
          <div class="info-item full-width">
            <span class="info-label">Common Usage:</span>
            <p class="info-text">{currentScaleInfo.commonUsage}</p>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Quick Reference: Piano Key Layout -->
  <div class="visual-reference">
    <div class="reference-label">Piano Keys in {noteName.substring(0, noteName.length - 1)} {currentScaleInfo.name}</div>
    <div class="keyboard-preview">
      {#each CHROMATIC_NOTES as note, idx}
        <!-- Check if this note is in the current scale -->
        {@const midiNote = octaveNumber * 12 + 12 + idx}
        {@const isInScale = currentScaleInfo?.intervals.includes(idx)}
        <div
          class="key-preview"
          class:in-scale={isInScale}
          class:root-note={note === noteName.substring(0, noteName.length - 1)}
          title={`${note} ${isInScale ? '(in scale)' : '(not in scale)'}`}
        >
          {note}
        </div>
      {/each}
    </div>
  </div>
</div>

<!-- ===== STYLES ===== -->
<style>
  .chord-selector {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, #f5f1e8 0%, #e8e3d8 100%);
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  .selector-header {
    text-align: center;
    border-bottom: 2px solid rgba(139, 69, 19, 0.2);
    padding-bottom: 1rem;
  }

  .current-key {
    font-size: 1.75rem;
    font-weight: 600;
    color: #5c3317;
    margin: 0 0 0.25rem 0;
    letter-spacing: 0.5px;
  }

  .subtitle {
    font-size: 0.875rem;
    color: #8b6f47;
    margin: 0;
    font-weight: 500;
  }

  .selector-controls {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  @media (max-width: 600px) {
    .selector-controls {
      grid-template-columns: 1fr;
    }
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .control-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #5c3317;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  select,
  input[type='number'] {
    padding: 0.75rem;
    font-size: 1rem;
    border: 2px solid #d4c4b0;
    border-radius: 6px;
    background: white;
    color: #5c3317;
    font-weight: 500;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  select:hover,
  input[type='number']:hover {
    border-color: #b89968;
    box-shadow: 0 2px 8px rgba(139, 69, 19, 0.1);
  }

  select:focus,
  input[type='number']:focus {
    outline: none;
    border-color: #8b6f47;
    box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
  }

  /* Octave Controls */
  .octave-controls {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0.5rem;
    align-items: center;
  }

  .octave-btn {
    width: 2.5rem;
    height: 2.75rem;
    padding: 0;
    font-size: 1.25rem;
    border: 2px solid #d4c4b0;
    border-radius: 6px;
    background: white;
    color: #5c3317;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .octave-btn:hover:not(:disabled) {
    border-color: #b89968;
    background: #fffaf3;
  }

  .octave-btn:active:not(:disabled) {
    transform: scale(0.95);
  }

  .octave-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  #octave-input {
    text-align: center;
    font-weight: 600;
  }

  /* Scale Information Section */
  .info-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .info-toggle {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: rgba(139, 69, 19, 0.05);
    border: 1px solid #d4c4b0;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    color: #5c3317;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .info-toggle:hover {
    background: rgba(139, 69, 19, 0.1);
    border-color: #b89968;
  }

  .toggle-icon {
    font-size: 0.75rem;
    transition: transform 0.2s ease;
  }

  .info-toggle[aria-expanded='true'] .toggle-icon {
    transform: rotate(0deg);
  }

  .scale-info {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 6px;
    border-left: 4px solid #8b6f47;
    animation: slideDown 0.2s ease;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-0.5rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .info-item {
    display: flex;
    gap: 0.75rem;
    font-size: 0.875rem;
  }

  .info-item.full-width {
    flex-direction: column;
    gap: 0.25rem;
  }

  .info-label {
    font-weight: 600;
    color: #5c3317;
    min-width: 80px;
    text-align: right;
  }

  .info-item.full-width .info-label {
    text-align: left;
    min-width: auto;
  }

  .info-value,
  .info-text {
    color: #6b5d4f;
    font-weight: 500;
  }

  .info-text {
    margin: 0;
    line-height: 1.4;
  }

  /* Visual Reference */
  .visual-reference {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    background: rgba(139, 69, 19, 0.05);
    border-radius: 6px;
  }

  .reference-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #5c3317;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .keyboard-preview {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 0.35rem;
  }

  .key-preview {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border: 2px solid #d4c4b0;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 600;
    color: #8b6f47;
    transition: all 0.2s ease;
  }

  .key-preview.in-scale {
    background: linear-gradient(135deg, #fff8e7 0%, #fffaf3 100%);
    border-color: #8b6f47;
    color: #5c3317;
    font-weight: 700;
  }

  .key-preview.root-note {
    background: linear-gradient(135deg, #d4a574 0%, #c99056 100%);
    border-color: #8b6f47;
    color: white;
    box-shadow: 0 2px 6px rgba(139, 69, 19, 0.3);
  }

  .key-preview.in-scale.root-note {
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      box-shadow: 0 2px 6px rgba(139, 69, 19, 0.3);
    }
    50% {
      box-shadow: 0 4px 12px rgba(139, 69, 19, 0.5);
    }
  }
</style>
