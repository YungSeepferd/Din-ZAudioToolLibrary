<script>
  /**
   * ProgressionBuilder.svelte
   *
   * PURPOSE:
   * Create and play chord progressions. Allows building sequences of chords,
   * selecting from templates, and hearing them with proper voice leading.
   *
   * DESIGN PHILOSOPHY:
   * - Drag-and-drop chord builder for intuitive progression creation
   * - One-click access to classic progressions (templates)
   * - Real-time playback with visual feedback (which chord is playing)
   * - Tempo control for different song styles
   * - Voice leading analysis showing progression quality
   * - Educational: Shows Roman numerals, teaches harmonic function
   *
   * MUSIC THEORY CONTEXT:
   * A progression is a sequence of chords connected by voice leading.
   * Common patterns: I-IV-V-I (classic), vi-IV-I-V (pop), ii-V-I (jazz)
   * Voice leading ensures smooth, professional transitions between chords.
   *
   * SVELTE 5 PATTERNS:
   * - $props() for input (rootMidi, scaleType, audioState, templates)
   * - $state() for progression, playback state, tempo
   * - $derived() for computed values (currentProgressionChords, analysis)
   * - $effect() to broadcast changes and handle playback
   *
   * USAGE:
   * <ProgressionBuilder
   *   {rootMidi}
   *   {scaleType}
   *   {audioState}
   *   onProgressionChange={(prog) => { /* handle update */ }}
   * />
   */

  import { onMount } from 'svelte';
  import {
    generateProgression,
    analyzeVoiceLeading,
    getAvailableProgressions,
    getProgressionTemplate,
    generateDiatonicChords,
    analyzeChordFunction,
    midiToNoteName
  } from '@audio/music-theory';

  // ===== COMPONENT PROPS (Svelte 5 $props rune) =====
  let {
    rootMidi = 60,
    scaleType = 'major',
    audioState = undefined,
    onProgressionChange = undefined
  } = $props();

  // ===== LOCAL REACTIVE STATE (Svelte 5 $state rune) =====
  let progression = $state(['I', 'IV', 'V', 'I']); // Current progression as Roman numerals
  let isPlaying = $state(false);
  let currentChordIndex = $state(-1); // Which chord is playing (-1 = none)
  let tempo = $state(90); // BPM (beats per minute)
  let chordDuration = $state(1); // Duration per chord in beats
  let loopEnabled = $state(false); // Should progression loop when finished
  let customChord = $state('I'); // For adding chords

  // ===== DERIVED STATE (Svelte 5 $derived rune) =====

  // allDiatonicChords: All 7 available chords for this key
  let allDiatonicChords = $derived(
    generateDiatonicChords(rootMidi, scaleType)
  );

  // availableChordRomans: Just the Roman numerals (I, ii, iii, etc.)
  let availableChordRomans = $derived(
    allDiatonicChords.map(c => c.roman)
  );

  // currentProgressionChords: Full chord objects for current progression
  let currentProgressionChords = $derived.by(() => {
    try {
      return generateProgression(rootMidi, scaleType, progression);
    } catch (error) {
      console.error('Error generating progression:', error);
      return [];
    }
  });

  // voiceLeadingAnalysis: Quality analysis of voice leading
  let voiceLeadingAnalysis = $derived.by(() => {
    if (currentProgressionChords.length === 0) return null;
    return analyzeVoiceLeading(currentProgressionChords);
  });

  // availableProgressions: List of progression templates (keys)
  let availableProgressions = $derived(getAvailableProgressions());

  // playbackPosition: Formatted display of current playback position
  let playbackPosition = $derived.by(() => {
    if (currentChordIndex === -1) return '—';
    return `${currentChordIndex + 1} / ${progression.length}`;
  });

  // ===== EFFECTS (Svelte 5 $effect rune) =====

  // Broadcast progression changes to parent
  $effect(() => {
    if (onProgressionChange) {
      onProgressionChange(progression);
    }
  });

  // Auto-stop playback when progression changes
  $effect(() => {
    if (isPlaying) {
      stopPlayback();
    }
  });

  // ===== HELPER FUNCTIONS =====

  /**
   * Add a chord to the progression
   * @param {string} roman - Roman numeral to add
   * @private
   */
  function addChord(roman) {
    if (availableChordRomans.includes(roman)) {
      progression = [...progression, roman];
    }
  }

  /**
   * Remove a chord from progression by index
   * @param {number} index - Index to remove
   * @private
   */
  function removeChord(index) {
    progression = progression.filter((_, i) => i !== index);
    if (currentChordIndex >= progression.length) {
      currentChordIndex = -1;
    }
  }

  /**
   * Load a progression from template
   * @param {string} templateKey - Template name from PROGRESSION_TEMPLATES
   * @private
   */
  function loadTemplate(templateKey) {
    const template = getProgressionTemplate(templateKey);
    if (template && template.roman) {
      progression = [...template.roman];
      currentChordIndex = -1;
      if (isPlaying) stopPlayback();
    }
  }

  /**
   * Clear the progression
   * @private
   */
  function clearProgression() {
    progression = [];
    currentChordIndex = -1;
    if (isPlaying) stopPlayback();
  }

  /**
   * Start playback of the progression
   * @private
   */
  async function playProgression() {
    if (progression.length === 0) return;
    if (isPlaying) return; // Already playing

    isPlaying = true;
    const durationMs = (chordDuration * 60000) / tempo; // Convert beats to ms at given tempo

    // Play loop
    do {
      for (let i = 0; i < progression.length; i++) {
        currentChordIndex = i;
        const chord = currentProgressionChords[i];

        if (audioState && chord && chord.notes) {
          // Play the chord
          audioState.playChord(chord.notes, chordDuration);
        }

        // Wait for duration
        await new Promise(resolve => setTimeout(resolve, durationMs));

        // Check if playback was stopped
        if (!isPlaying) {
          currentChordIndex = -1;
          return;
        }
      }

      // If not looping, exit
      if (!loopEnabled) {
        break;
      }
    } while (isPlaying);

    isPlaying = false;
    currentChordIndex = -1;
  }

  /**
   * Stop playback
   * @private
   */
  function stopPlayback() {
    isPlaying = false;
    currentChordIndex = -1;
    if (audioState && audioState.stopAll) {
      audioState.stopAll();
    }
  }

  /**
   * Get template display name
   * @param {string} key - Template key
   * @returns {string} Display name
   * @private
   */
  function getTemplateName(key) {
    const template = getProgressionTemplate(key);
    return template?.name || key;
  }

  /**
   * Get quality indicator class based on voice leading
   * @returns {string} CSS class name
   * @private
   */
  function getQualityClass() {
    if (!voiceLeadingAnalysis) return '';
    switch (voiceLeadingAnalysis.quality) {
      case 'excellent':
        return 'quality-excellent';
      case 'good':
        return 'quality-good';
      case 'fair':
        return 'quality-fair';
      default:
        return '';
    }
  }

  /**
   * Get quality description
   * @returns {string} Readable description
   * @private
   */
  function getQualityDescription() {
    if (!voiceLeadingAnalysis) return '';
    switch (voiceLeadingAnalysis.quality) {
      case 'excellent':
        return 'Excellent voice leading - very smooth transitions';
      case 'good':
        return 'Good voice leading - smooth transitions';
      case 'fair':
        return 'Fair voice leading - some larger jumps';
      default:
        return 'Unknown quality';
    }
  }
</script>

<!-- ===== COMPONENT TEMPLATE ===== -->
<div class="progression-builder" role="region" aria-label="Chord Progression Builder">
  <!-- Header -->
  <div class="builder-header">
    <h3 class="builder-title">Build a Progression</h3>
    <p class="builder-subtitle">Create chord sequences and play them back</p>
  </div>

  <!-- Progression Controls -->
  <div class="progression-controls">
    <!-- Template Selector -->
    <div class="control-group">
      <label for="template-select" class="control-label">Load Template</label>
      <select
        id="template-select"
        value=""
        onchange={(e) => e.target.value && loadTemplate(e.target.value)}
        aria-label="Load progression template"
      >
        <option value="">Choose a template...</option>
        {#each availableProgressions as templateKey}
          <option value={templateKey}>{getTemplateName(templateKey)}</option>
        {/each}
      </select>
    </div>

    <!-- Add Chord Controls -->
    <div class="control-group">
      <label for="chord-select" class="control-label">Add Chord</label>
      <div class="add-chord-row">
        <select
          id="chord-select"
          bind:value={customChord}
          aria-label="Select chord to add"
        >
          {#each availableChordRomans as roman}
            <option value={roman}>{roman}</option>
          {/each}
        </select>
        <button
          class="add-btn"
          onclick={() => addChord(customChord)}
          aria-label="Add chord to progression"
        >
          +
        </button>
      </div>
    </div>

    <!-- Control Buttons -->
    <div class="control-group">
      <label class="control-label">Actions</label>
      <div class="button-group">
        <button
          class="action-btn clear-btn"
          onclick={() => clearProgression()}
          disabled={progression.length === 0}
          aria-label="Clear progression"
          title="Remove all chords"
        >
          Clear
        </button>
      </div>
    </div>
  </div>

  <!-- Progression Display -->
  <div class="progression-display">
    <div class="progression-title">Progression</div>

    {#if progression.length === 0}
      <div class="progression-empty">
        <p>No chords yet. Load a template or add chords to get started.</p>
      </div>
    {:else}
      <div class="progression-sequence">
        {#each progression as roman, index (index)}
          {@const chord = currentProgressionChords[index]}
          {@const func = analyzeChordFunction(roman, scaleType)}
          {@const isPlaying = index === currentChordIndex}
          {@const notes = chord
            ? chord.notes.map(m => midiToNoteName(m, true)).join(' ')
            : '?'}

          <div
            class="progression-item"
            class:playing={isPlaying}
            data-roman={roman}
          >
            <!-- Chord Card -->
            <div class="item-chord">
              <div class="item-roman">{roman}</div>
              <div class="item-quality">{chord?.quality || '?'}</div>
            </div>

            <!-- Chord Details -->
            <div class="item-details">
              <div class="item-notes" title={notes}>{notes}</div>
              <div class="item-function" title={func?.primary || 'Unknown'}>
                {func?.primary || '?'}
              </div>
            </div>

            <!-- Remove Button -->
            <button
              class="item-remove"
              onclick={() => removeChord(index)}
              aria-label={`Remove ${roman} chord`}
              title="Remove this chord"
            >
              ×
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Playback Controls -->
  <div class="playback-section">
    <div class="playback-controls">
      <button
        class="play-btn"
        onclick={() => playProgression()}
        disabled={progression.length === 0 || isPlaying || !audioState}
        aria-label="Play progression"
        title="Play the progression"
      >
        <span class="btn-icon">▶</span>
        <span class="btn-text">Play</span>
      </button>

      <button
        class="stop-btn"
        onclick={() => stopPlayback()}
        disabled={!isPlaying}
        aria-label="Stop playback"
        title="Stop playing"
      >
        <span class="btn-icon">⏹</span>
        <span class="btn-text">Stop</span>
      </button>

      <div class="position-display">
        Position: <span class="position-value">{playbackPosition}</span>
      </div>
    </div>

    <!-- Tempo and Duration Controls -->
    <div class="tempo-controls">
      <div class="tempo-item">
        <label for="tempo-input" class="tempo-label">Tempo (BPM)</label>
        <input
          id="tempo-input"
          type="range"
          min="40"
          max="200"
          step="1"
          bind:value={tempo}
          aria-label="Tempo in beats per minute"
        />
        <span class="tempo-value">{tempo}</span>
      </div>

      <div class="tempo-item">
        <label for="duration-input" class="tempo-label">Duration (beats)</label>
        <input
          id="duration-input"
          type="range"
          min="0.5"
          max="4"
          step="0.5"
          bind:value={chordDuration}
          aria-label="Chord duration in beats"
        />
        <span class="tempo-value">{chordDuration}</span>
      </div>

      <div class="loop-control">
        <label for="loop-checkbox" class="loop-label">
          <input
            id="loop-checkbox"
            type="checkbox"
            bind:checked={loopEnabled}
            aria-label="Loop progression"
          />
          <span>Loop</span>
        </label>
      </div>
    </div>
  </div>

  <!-- Voice Leading Analysis -->
  {#if voiceLeadingAnalysis && progression.length > 1}
    <div class="voice-leading-analysis {getQualityClass()}">
      <div class="analysis-title">Voice Leading Analysis</div>
      <div class="analysis-content">
        <div class="analysis-item">
          <span class="analysis-label">Quality:</span>
          <span class="analysis-value">{getQualityDescription()}</span>
        </div>

        <div class="analysis-item">
          <span class="analysis-label">Total Movement:</span>
          <span class="analysis-value">{voiceLeadingAnalysis.totalDistance} semitones</span>
        </div>

        <div class="analysis-item">
          <span class="analysis-label">Average per Transition:</span>
          <span class="analysis-value">{voiceLeadingAnalysis.averageDistance.toFixed(1)} semitones</span>
        </div>

        {#if voiceLeadingAnalysis.suggestions && voiceLeadingAnalysis.suggestions.length > 0}
          <div class="analysis-suggestions">
            {#each voiceLeadingAnalysis.suggestions as suggestion}
              <div class="suggestion-item">💡 {suggestion}</div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Tips -->
  <div class="builder-tips">
    <div class="tips-title">💡 Tips</div>
    <ul class="tips-list">
      <li>Start with a template to see common progressions</li>
      <li>Voice leading automatically applies optimal chord inversions</li>
      <li>Adjust tempo to match the mood (slow = 60-80 BPM, fast = 120-160 BPM)</li>
      <li>Loop to practice the progression repeatedly</li>
      <li>Notice how voice leading quality affects the smoothness</li>
    </ul>
  </div>
</div>

<!-- ===== STYLES ===== -->
<style>
  .progression-builder {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, #f5f1e8 0%, #e8e3d8 100%);
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .builder-header {
    border-bottom: 2px solid rgba(139, 69, 19, 0.2);
    padding-bottom: 0.75rem;
  }

  .builder-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #5c3317;
    margin: 0 0 0.25rem 0;
  }

  .builder-subtitle {
    font-size: 0.85rem;
    color: #8b6f47;
    margin: 0;
    font-weight: 500;
  }

  /* Controls */
  .progression-controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
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

  select {
    padding: 0.75rem;
    font-size: 0.9rem;
    border: 2px solid #d4c4b0;
    border-radius: 6px;
    background: white;
    color: #5c3317;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  select:hover {
    border-color: #b89968;
    box-shadow: 0 2px 8px rgba(139, 69, 19, 0.1);
  }

  select:focus {
    outline: none;
    border-color: #8b6f47;
    box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
  }

  .add-chord-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.5rem;
  }

  .add-btn {
    width: 2.75rem;
    height: 2.75rem;
    padding: 0;
    font-size: 1.5rem;
    border: 2px solid #d4c4b0;
    border-radius: 6px;
    background: white;
    color: #8b6f47;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .add-btn:hover:not(:disabled) {
    border-color: #b89968;
    background: linear-gradient(135deg, #d4a574 0%, #c99056 100%);
    color: white;
  }

  .add-btn:active:not(:disabled) {
    transform: scale(0.95);
  }

  .add-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .button-group {
    display: flex;
    gap: 0.5rem;
  }

  .action-btn {
    flex: 1;
    padding: 0.75rem;
    font-size: 0.85rem;
    font-weight: 600;
    border: 2px solid #d4c4b0;
    border-radius: 6px;
    background: white;
    color: #5c3317;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .action-btn:hover:not(:disabled) {
    border-color: #b89968;
    background: rgba(212, 165, 116, 0.1);
  }

  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .clear-btn {
    border-color: #d4a574;
  }

  .clear-btn:hover:not(:disabled) {
    background: rgba(212, 165, 116, 0.15);
    color: #c99056;
  }

  /* Progression Display */
  .progression-display {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 8px;
    border: 1px solid #d4c4b0;
  }

  .progression-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: #5c3317;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .progression-empty {
    padding: 1.5rem;
    text-align: center;
    color: #8b6f47;
    font-style: italic;
  }

  .progression-empty p {
    margin: 0;
  }

  .progression-sequence {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.75rem;
  }

  .progression-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
    background: white;
    border: 2px solid #d4c4b0;
    border-radius: 6px;
    position: relative;
    transition: all 0.2s ease;
  }

  .progression-item:hover {
    border-color: #8b6f47;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .progression-item.playing {
    background: linear-gradient(135deg, #fffaf3 0%, #fff8e7 100%);
    border-color: #c99056;
    box-shadow: 0 4px 12px rgba(201, 144, 86, 0.3);
    animation: pulse 1s ease-in-out;
  }

  @keyframes pulse {
    0%,
    100% {
      box-shadow: 0 4px 12px rgba(201, 144, 86, 0.3);
    }
    50% {
      box-shadow: 0 6px 16px rgba(201, 144, 86, 0.5);
    }
  }

  .item-chord {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  .item-roman {
    font-size: 1.25rem;
    font-weight: 700;
    color: #5c3317;
  }

  .item-quality {
    font-size: 0.7rem;
    font-weight: 600;
    color: #8b6f47;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .item-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .item-notes {
    font-size: 0.75rem;
    color: #6b5d4f;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-function {
    font-size: 0.65rem;
    color: #8b6f47;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .item-remove {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;
    border: none;
    background: rgba(201, 144, 86, 0.2);
    color: #c99056;
    font-size: 1.25rem;
    line-height: 1;
    cursor: pointer;
    border-radius: 3px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .item-remove:hover {
    background: rgba(201, 144, 86, 0.4);
    color: #8b4513;
  }

  /* Playback Controls */
  .playback-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    background: rgba(139, 69, 19, 0.05);
    border-radius: 8px;
    border: 1px solid #d4c4b0;
  }

  .playback-controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .play-btn,
  .stop-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
    font-weight: 600;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .play-btn {
    background: linear-gradient(135deg, #d4a574 0%, #c99056 100%);
    color: white;
  }

  .play-btn:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
  }

  .play-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .stop-btn {
    background: rgba(201, 144, 86, 0.2);
    color: #c99056;
  }

  .stop-btn:hover:not(:disabled) {
    background: rgba(201, 144, 86, 0.3);
  }

  .stop-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-icon {
    font-size: 0.8rem;
  }

  .position-display {
    margin-left: auto;
    font-size: 0.85rem;
    color: #5c3317;
    font-weight: 500;
  }

  .position-value {
    font-weight: 700;
    color: #8b6f47;
  }

  /* Tempo Controls */
  .tempo-controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
    align-items: end;
  }

  .tempo-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .tempo-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: #5c3317;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  input[type='range'] {
    width: 100%;
    height: 6px;
    background: #d4c4b0;
    border-radius: 3px;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
    cursor: pointer;
  }

  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    background: linear-gradient(135deg, #d4a574 0%, #c99056 100%);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(139, 69, 19, 0.3);
    transition: all 0.2s ease;
  }

  input[type='range']::-webkit-slider-thumb:hover {
    transform: scale(1.15);
    box-shadow: 0 4px 12px rgba(139, 69, 19, 0.4);
  }

  input[type='range']::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background: linear-gradient(135deg, #d4a574 0%, #c99056 100%);
    border-radius: 50%;
    border: none;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(139, 69, 19, 0.3);
    transition: all 0.2s ease;
  }

  input[type='range']::-moz-range-thumb:hover {
    transform: scale(1.15);
    box-shadow: 0 4px 12px rgba(139, 69, 19, 0.4);
  }

  .tempo-value {
    font-weight: 700;
    color: #8b6f47;
    text-align: center;
  }

  .loop-control {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .loop-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    font-weight: 500;
    color: #5c3317;
    cursor: pointer;
  }

  input[type='checkbox'] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #c99056;
  }

  /* Voice Leading Analysis */
  .voice-leading-analysis {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 8px;
    border-left: 4px solid #8b6f47;
  }

  .voice-leading-analysis.quality-excellent {
    border-left-color: #4caf50;
    background: rgba(76, 175, 80, 0.05);
  }

  .voice-leading-analysis.quality-good {
    border-left-color: #8bc34a;
    background: rgba(139, 195, 74, 0.05);
  }

  .voice-leading-analysis.quality-fair {
    border-left-color: #ffc107;
    background: rgba(255, 193, 7, 0.05);
  }

  .analysis-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: #5c3317;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .analysis-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .analysis-item {
    display: flex;
    gap: 0.5rem;
    font-size: 0.85rem;
  }

  .analysis-label {
    font-weight: 600;
    color: #5c3317;
    min-width: 120px;
  }

  .analysis-value {
    color: #6b5d4f;
    font-weight: 500;
  }

  .analysis-suggestions {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(139, 69, 19, 0.1);
  }

  .suggestion-item {
    font-size: 0.8rem;
    color: #6b5d4f;
  }

  /* Tips */
  .builder-tips {
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
