<script>
  /**
   * ChordDisplay.svelte
   *
   * PURPOSE:
   * Display all 7 diatonic chords available in the selected key/scale.
   * Allows user to select, preview, and play individual chords.
   *
   * DESIGN PHILOSOPHY:
   * - Visual grid showing all available harmonically-related chords
   * - One chord is highlighted as "selected"
   * - Each chord shows: Roman numeral, quality, harmonic function, notes
   * - Play button for quick chord preview
   * - Tooltip showing harmonic context and educational info
   * - Numbers-free design (shows note names, not MIDI numbers)
   *
   * MUSIC THEORY CONTEXT:
   * The 7 diatonic chords are built from each scale degree using only
   * notes from the same scale. This guarantees harmonic compatibility.
   * Example C Major scale → I, ii, iii, IV, V, vi, vii°
   *
   * SVELTE 5 PATTERNS:
   * - $props() for component input (rootMidi, scaleType, audioState, callbacks)
   * - $state() for local state (selectedChordRoman, hoveredChord)
   * - $derived() for computed values (diatonicChords)
   * - $effect() to broadcast changes to parent
   *
   * USAGE:
   * <ChordDisplay
   *   rootMidi={60}
   *   scaleType="major"
   *   bind:selectedChordRoman
   *   onChordSelect={handleChordSelect}
   *   onChordPlay={handleChordPlay}
   * />
   */

  import {
    generateDiatonicChords,
    analyzeChordFunction,
    midiToNoteName
  } from '@audio/music-theory';

  // ===== COMPONENT PROPS (Svelte 5 $props rune) =====
  let {
    rootMidi = 60,
    scaleType = 'major',
    selectedChordRoman = undefined,
    audioState = undefined,
    onChordSelect = undefined,
    onChordPlay = undefined
  } = $props();

  // ===== LOCAL REACTIVE STATE (Svelte 5 $state rune) =====
  // selectedChordRoman: Which chord is currently selected (I, ii, iii, etc.)
  // hoveredChord: Which chord user is hovering over (for visual feedback)
  let hoveredChord = $state(undefined);

  // ===== DERIVED STATE (Svelte 5 $derived rune) =====

  // diatonicChords: All 7 chords in current key
  let diatonicChords = $derived(
    generateDiatonicChords(rootMidi, scaleType)
  );

  // selectedChord: Full chord object of selected Roman numeral
  let selectedChord = $derived.by(() => {
    if (!selectedChordRoman) return null;
    return diatonicChords.find(c => c.roman === selectedChordRoman);
  });

  // selectedChordFunction: Harmonic function of selected chord
  let selectedChordFunction = $derived.by(() => {
    if (!selectedChordRoman) return null;
    return analyzeChordFunction(selectedChordRoman, scaleType);
  });

  // selectedChordNotes: Human-readable note names of selected chord
  let selectedChordNotes = $derived.by(() => {
    if (!selectedChord) return [];
    return selectedChord.notes.map(midi => midiToNoteName(midi, true));
  });

  // ===== EFFECTS (Svelte 5 $effect rune) =====

  // Broadcast selection change to parent
  $effect(() => {
    if (selectedChordRoman && onChordSelect) {
      onChordSelect(selectedChordRoman);
    }
  });

  // Auto-select first chord if none selected
  $effect(() => {
    if (!selectedChordRoman && diatonicChords.length > 0) {
      selectedChordRoman = diatonicChords[0].roman;
    }
  });

  // ===== HELPER FUNCTIONS =====

  /**
   * Handle chord selection
   * @param {string} roman - Roman numeral (e.g., 'I', 'IV', 'V')
   * @private
   */
  function selectChord(roman) {
    selectedChordRoman = roman;
  }

  /**
   * Play the selected chord
   * Calls onChordPlay with the MIDI notes
   * @param {Object} chord - Chord object with notes array
   * @private
   */
  function playChord(chord) {
    if (onChordPlay && chord.notes) {
      // Play for 1 second at default velocity
      onChordPlay(chord.notes, 1.0);
    }
  }

  /**
   * Get descriptive name for harmonic function
   * @param {Object} funcInfo - Function info from analyzeChordFunction
   * @returns {string} Human-readable function description
   * @private
   */
  function getFunctionDescription(funcInfo) {
    if (!funcInfo) return 'Unknown function';

    const parts = [funcInfo.primary];
    if (funcInfo.secondary && funcInfo.secondary.length > 0) {
      parts.push(`(${funcInfo.secondary.join(', ')})`);
    }
    return parts.join(' ');
  }

  /**
   * Get CSS class for function type (for color coding)
   * @param {string} primary - Primary harmonic function
   * @returns {string} CSS class name
   * @private
   */
  function getFunctionClass(primary) {
    switch (primary) {
      case 'tonic':
        return 'function-tonic';
      case 'subdominant':
        return 'function-subdominant';
      case 'dominant':
        return 'function-dominant';
      case 'pre-dominant':
        return 'function-predominant';
      default:
        return 'function-other';
    }
  }
</script>

<!-- ===== COMPONENT TEMPLATE ===== -->
<div class="chord-display" role="region" aria-label="Diatonic Chords">
  <!-- Header -->
  <div class="display-header">
    <h3 class="display-title">Available Chords</h3>
    <p class="display-subtitle">All 7 chords from {scaleType} scale (harmonically matched)</p>
  </div>

  <!-- Chords Grid -->
  <div class="chords-grid">
    {#each diatonicChords as chord (chord.roman)}
      {@const chordFunc = analyzeChordFunction(chord.roman, scaleType)}
      {@const isSelected = chord.roman === selectedChordRoman}
      {@const isHovered = chord.roman === hoveredChord}

      <button
        class="chord-card {chordFunc?.primary ? `function-${chordFunc.primary}` : ''}"
        class:selected={isSelected}
        class:hovered={isHovered}
        data-chord={chord.roman}
        onclick={() => selectChord(chord.roman)}
        onmouseenter={() => (hoveredChord = chord.roman)}
        onmouseleave={() => (hoveredChord = undefined)}
        aria-pressed={isSelected}
        title={`${chord.roman} chord - ${chord.quality} - ${chord.function}`}
      >
        <!-- Roman Numeral (Main Display) -->
        <div class="chord-roman">{chord.roman}</div>

        <!-- Chord Quality (Major, Minor, Diminished, etc.) -->
        <div class="chord-quality">{chord.quality}</div>

        <!-- Harmonic Function Badge -->
        <div class="chord-function {getFunctionClass(chordFunc?.primary)}">
          {chordFunc?.primary || 'Unknown'}
        </div>

        <!-- MIDI Notes (shown on hover/selection) -->
        {#if isSelected || isHovered}
          <div class="chord-notes">
            {chord.notes.map(midi => midiToNoteName(midi, true)).join(' ')}
          </div>
        {/if}
      </button>
    {/each}
  </div>

  <!-- Selected Chord Details Panel -->
  {#if selectedChord}
    <div class="chord-details" role="region" aria-live="polite" aria-label="Selected chord details">
      <div class="details-header">
        <h4 class="selected-chord-name">{selectedChord.roman} - {selectedChord.quality}</h4>
        <button
          class="play-button"
          onclick={() => playChord(selectedChord)}
          disabled={!onChordPlay}
          aria-label={`Play ${selectedChord.roman} chord`}
          title="Play this chord"
        >
          <span class="play-icon">▶</span>
          <span class="play-text">Play</span>
        </button>
      </div>

      <!-- Chord Information Grid -->
      <div class="details-info">
        <!-- Notes -->
        <div class="detail-item">
          <span class="detail-label">Notes:</span>
          <span class="detail-value">{selectedChordNotes.join(' - ')}</span>
        </div>

        <!-- MIDI Numbers -->
        <div class="detail-item">
          <span class="detail-label">MIDI:</span>
          <span class="detail-value">{selectedChord.notes.join(', ')}</span>
        </div>

        <!-- Degree -->
        <div class="detail-item">
          <span class="detail-label">Degree:</span>
          <span class="detail-value">Scale degree {selectedChord.degree}</span>
        </div>

        <!-- Harmonic Function -->
        <div class="detail-item">
          <span class="detail-label">Function:</span>
          <span
            class="detail-value {getFunctionClass(selectedChordFunction?.primary)}"
          >
            {getFunctionDescription(selectedChordFunction)}
          </span>
        </div>
      </div>

      <!-- Function Description -->
      {#if selectedChordFunction}
        <div class="function-description">
          <div class="description-title">Harmonic Function</div>
          <div class="description-text">
            {#if selectedChordFunction.primary === 'tonic'}
              This chord is the <strong>home base</strong>. It sounds resolved and stable.
              Most progressions start and end here.
            {:else if selectedChordFunction.primary === 'subdominant'}
              This chord moves <strong>away from home</strong>. It's stable but creates forward
              motion, typically leading toward the dominant.
            {:else if selectedChordFunction.primary === 'dominant'}
              This chord creates <strong>tension</strong> that wants to resolve. It's unstable
              and typically moves to the tonic (home).
            {:else if selectedChordFunction.primary === 'pre-dominant'}
              This is a <strong>transition chord</strong>. It's stable like the tonic but leads
              naturally toward the dominant.
            {:else if selectedChordFunction.primary === 'relative'}
              This is a <strong>relative chord</strong>. It shares notes with the tonic but has
              a different character or emotional quality.
            {:else}
              This chord has a unique harmonic function in the progression.
            {/if}
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Quick Tips -->
  <div class="chord-tips">
    <div class="tips-title">💡 Tips</div>
    <ul class="tips-list">
      <li>All 7 chords share the same scale - they sound great together</li>
      <li>Click a chord to select it and see details</li>
      <li>Use progressions like I-IV-V-I or vi-IV-I-V for classic sounds</li>
      <li>The color indicates harmonic function (Tonic, Subdominant, Dominant)</li>
    </ul>
  </div>
</div>

<!-- ===== STYLES ===== -->
<style>
  .chord-display {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, #f5f1e8 0%, #e8e3d8 100%);
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .display-header {
    border-bottom: 2px solid rgba(139, 69, 19, 0.2);
    padding-bottom: 0.75rem;
  }

  .display-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #5c3317;
    margin: 0 0 0.25rem 0;
  }

  .display-subtitle {
    font-size: 0.85rem;
    color: #8b6f47;
    margin: 0;
    font-weight: 500;
  }

  /* Chords Grid */
  .chords-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.75rem;
  }

  .chord-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem;
    background: white;
    border: 2px solid #d4c4b0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .chord-card:hover {
    border-color: #8b6f47;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .chord-card.selected {
    background: linear-gradient(135deg, #d4a574 0%, #c99056 100%);
    border-color: #8b6f47;
    color: white;
    box-shadow: 0 6px 16px rgba(139, 69, 19, 0.3);
  }

  .chord-card.hovered {
    border-color: #b89968;
  }

  /* Function-based coloring */
  .chord-card.function-tonic {
    --accent-color: #8b6f47;
  }

  .chord-card.function-subdominant {
    --accent-color: #a87f4a;
  }

  .chord-card.function-dominant {
    --accent-color: #c99056;
  }

  .chord-card.function-predominant {
    --accent-color: #9e7c4f;
  }

  .chord-card.function-other {
    --accent-color: #a88555;
  }

  .chord-card:not(.selected):hover {
    border-color: var(--accent-color, #8b6f47);
    background: rgba(212, 165, 116, 0.05);
  }

  .chord-roman {
    font-size: 1.5rem;
    font-weight: 700;
    color: inherit;
  }

  .chord-card.selected .chord-roman {
    color: #fffaf3;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .chord-quality {
    font-size: 0.75rem;
    font-weight: 600;
    color: #8b6f47;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .chord-card.selected .chord-quality {
    color: rgba(255, 255, 255, 0.85);
  }

  .chord-function {
    font-size: 0.65rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: 3px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    background: rgba(139, 69, 19, 0.1);
    color: #5c3317;
    margin-top: 0.25rem;
  }

  .chord-card.selected .chord-function {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  .chord-notes {
    font-size: 0.75rem;
    color: #6b5d4f;
    font-weight: 500;
    margin-top: 0.25rem;
    opacity: 0.8;
    animation: fadeIn 0.2s ease;
  }

  .chord-card.selected .chord-notes {
    color: rgba(255, 255, 255, 0.9);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-0.25rem);
    }
    to {
      opacity: 0.8;
      transform: translateY(0);
    }
  }

  /* Selected Chord Details */
  .chord-details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 8px;
    border-left: 4px solid #8b6f47;
  }

  .details-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .selected-chord-name {
    font-size: 1.25rem;
    font-weight: 600;
    color: #5c3317;
    margin: 0;
  }

  .play-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: linear-gradient(135deg, #d4a574 0%, #c99056 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .play-button:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
  }

  .play-button:active:not(:disabled) {
    transform: scale(0.98);
  }

  .play-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .play-icon {
    font-size: 0.8rem;
  }

  .details-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.75rem;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .detail-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #5c3317;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .detail-value {
    font-size: 0.9rem;
    font-weight: 500;
    color: #6b5d4f;
  }

  .detail-value.function-tonic {
    color: #8b6f47;
  }

  .detail-value.function-subdominant {
    color: #a87f4a;
  }

  .detail-value.function-dominant {
    color: #c99056;
  }

  .detail-value.function-predominant {
    color: #9e7c4f;
  }

  /* Function Description */
  .function-description {
    padding: 0.75rem;
    background: rgba(212, 165, 116, 0.1);
    border-radius: 6px;
    border-left: 3px solid #8b6f47;
  }

  .description-title {
    font-size: 0.8rem;
    font-weight: 600;
    color: #5c3317;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    margin-bottom: 0.4rem;
  }

  .description-text {
    font-size: 0.85rem;
    color: #6b5d4f;
    line-height: 1.5;
    margin: 0;
  }

  .description-text strong {
    color: #5c3317;
    font-weight: 600;
  }

  /* Tips Section */
  .chord-tips {
    padding: 0.75rem 1rem;
    background: rgba(139, 69, 19, 0.05);
    border-radius: 6px;
    border-left: 3px solid #b89968;
  }

  .tips-title {
    font-size: 0.8rem;
    font-weight: 600;
    color: #5c3317;
    margin-bottom: 0.5rem;
  }

  .tips-list {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin: 0;
    padding-left: 1.25rem;
    font-size: 0.8rem;
    color: #6b5d4f;
  }

  .tips-list li {
    line-height: 1.4;
  }
</style>
