<script>
  /**
   * PianoKeyboard Component
   *
   * A full 88-key piano keyboard UI with:
   * - Mouse and touch support
   * - MIDI note playback integration
   * - Visual feedback for active keys
   * - Octave range control
   * - Keyboard integration (QWERTY playing)
   *
   * @component
   */

  import { onMount } from 'svelte';

  /**
   * Component props using Svelte 5 $props()
   */
  let {
    audioState = undefined,
    startNote = 12,
    keyCount = 88,
    showNoteNames = true,
    showOctaveNumbers = true
  } = $props();

  let keyboardElement = $state();
  let isMouseDown = $state(false);
  let activeKeys = $state(new Map()); // Map of MIDI note -> element
  let keyboardMapping = createKeyboardMapping();

  // Musical note names (C to B)
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  /**
   * Create keyboard key to MIDI note mapping
   * Allows playing piano with QWERTY keyboard
   *
   * @private
   * @returns {Object} Mapping of keyboard keys to MIDI notes
   */
  function createKeyboardMapping() {
    // QWERTY layout for two octaves starting at C
    return {
      'z': 48, // C3
      's': 49, // C#3
      'x': 50, // D3
      'd': 51, // D#3
      'c': 52, // E3
      'v': 53, // F3
      'g': 54, // F#3
      'b': 55, // G3
      'h': 56, // G#3
      'n': 57, // A3
      'j': 58, // A#3
      'm': 59, // B3
      ',': 60, // C4 (middle C)
      'l': 61, // C#4
      '.': 62, // D4
      ';': 63, // D#4
      '/': 64  // E4
    };
  }

  /**
   * Get note name and octave for MIDI note
   *
   * @private
   * @param {number} midiNote - MIDI note number (0-127)
   * @returns {Object} { name: string, octave: number }
   */
  function getNoteInfo(midiNote) {
    const octave = Math.floor(midiNote / 12) - 1;
    const noteName = noteNames[midiNote % 12];
    return { name: noteName, octave };
  }

  /**
   * Check if note is black key
   *
   * @private
   * @param {number} midiNote - MIDI note number
   * @returns {boolean} True if black key
   */
  function isBlackKey(midiNote) {
    const noteInOctave = midiNote % 12;
    return [1, 3, 6, 8, 10].includes(noteInOctave);
  }

  /**
   * Handle mouse/touch down on key
   *
   * @private
   */
  function handleKeyDown(e) {
    if (!audioState) return;

    const midiNote = parseInt(e.currentTarget.dataset.note);
    const velocity = 100;

    audioState.playNote(midiNote, velocity);
    activeKeys.set(midiNote, e.currentTarget);
    e.currentTarget.classList.add('active');
    isMouseDown = true;
  }

  /**
   * Handle mouse/touch up on key
   *
   * @private
   */
  function handleKeyUp(e) {
    if (!audioState) return;

    const midiNote = parseInt(e.currentTarget.dataset.note);

    audioState.stopNote(midiNote);
    activeKeys.delete(midiNote);
    e.currentTarget.classList.remove('active');
  }

  /**
   * Handle mouse entering a key while held down
   *
   * @private
   */
  function handleMouseEnter(e) {
    if (!isMouseDown || !audioState) return;

    const midiNote = parseInt(e.currentTarget.dataset.note);
    const velocity = 100;

    // Only trigger if not already active
    if (!activeKeys.has(midiNote)) {
      audioState.playNote(midiNote, velocity);
      activeKeys.set(midiNote, e.currentTarget);
      e.currentTarget.classList.add('active');
    }
  }

  /**
   * Handle mouse leaving a key while held down
   *
   * @private
   */
  function handleMouseLeave(e) {
    if (!isMouseDown || !audioState) return;

    const midiNote = parseInt(e.currentTarget.dataset.note);

    if (activeKeys.has(midiNote)) {
      audioState.stopNote(midiNote);
      activeKeys.delete(midiNote);
      e.currentTarget.classList.remove('active');
    }
  }

  /**
   * Handle keyboard input (QWERTY piano keys)
   *
   * @private
   */
  function handleWindowKeyDown(e) {
    if (!audioState) return;

    const key = e.key.toLowerCase();
    const midiNote = keyboardMapping[key];

    if (midiNote && !e.repeat) {
      const velocity = 100;
      audioState.playNote(midiNote, velocity);
      activeKeys.set(midiNote, document.querySelector(`[data-note="${midiNote}"]`));

      // Add visual feedback
      const element = document.querySelector(`[data-note="${midiNote}"]`);
      if (element) {
        element.classList.add('active');
      }
    }
  }

  /**
   * Handle keyboard release (QWERTY piano keys)
   *
   * @private
   */
  function handleWindowKeyUp(e) {
    if (!audioState) return;

    const key = e.key.toLowerCase();
    const midiNote = keyboardMapping[key];

    if (midiNote) {
      audioState.stopNote(midiNote);
      activeKeys.delete(midiNote);

      // Remove visual feedback
      const element = document.querySelector(`[data-note="${midiNote}"]`);
      if (element) {
        element.classList.remove('active');
      }
    }
  }

  /**
   * Stop all notes when component unmounts
   *
   * @private
   */
  function cleanup() {
    if (audioState) {
      audioState.stopAll();
      activeKeys.clear();
    }

    document.removeEventListener('keydown', handleWindowKeyDown);
    document.removeEventListener('keyup', handleWindowKeyUp);
  }

  onMount(() => {
    document.addEventListener('keydown', handleWindowKeyDown);
    document.addEventListener('keyup', handleWindowKeyUp);

    return cleanup;
  });

  /**
   * Generate array of MIDI notes for keyboard
   *
   * @private
   * @returns {number[]} Array of MIDI notes
   */
  function generateNotes() {
    const notes = [];
    for (let i = 0; i < keyCount; i++) {
      notes.push(startNote + i);
    }
    return notes;
  }

  const notes = generateNotes();
</script>

<div class="keyboard-container" bind:this={keyboardElement}>
  <div class="keyboard">
    {#each notes as midiNote, idx (midiNote)}
      {@const isBlack = isBlackKey(midiNote)}
      {@const noteInfo = getNoteInfo(midiNote)}
      {@const noteLabel = `${noteInfo.name}${showOctaveNumbers ? noteInfo.octave : ''}`}

      <button
        class:key
        class:white-key={!isBlack}
        class:black-key={isBlack}
        data-note={midiNote}
        onmousedown={handleKeyDown}
        onmouseup={handleKeyUp}
        onmouseleave={handleMouseLeave}
        onmouseenter={handleMouseEnter}
        ontouchstart={handleKeyDown}
        ontouchend={handleKeyUp}
        title={`${noteLabel} (MIDI ${midiNote})`}
        aria-label="Piano key {noteLabel}"
      >
        {#if showNoteNames && !isBlack}
          <span class="note-label">{noteInfo.name}</span>
          {#if showOctaveNumbers}
            <span class="octave-label">{noteInfo.octave}</span>
          {/if}
        {/if}
      </button>
    {/each}
  </div>

  <div class="keyboard-help">
    <p class="help-text">🎹 Click keys or press QWERTY keys (Z-M, comma/period) to play</p>
  </div>
</div>

<style>
  .keyboard-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    background: linear-gradient(135deg, var(--primary-bg) 0%, var(--surface-bg) 100%);
    border-radius: var(--border-radius-lg);
  }

  .keyboard {
    display: flex;
    gap: 0;
    justify-content: center;
    align-items: flex-end;
    position: relative;
    background: var(--surface-bg);
    padding: 1rem;
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-lg);
    overflow-x: auto;
  }

  /* White keys */
  .key.white-key {
    width: 60px;
    height: 280px;
    background: linear-gradient(to bottom, #ffffff 0%, #f5f5f5 100%);
    border: 1px solid #ccc;
    border-radius: 0 0 8px 8px;
    cursor: pointer;
    user-select: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 8px 4px;
    position: relative;
    transition: all 0.05s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .key.white-key:hover {
    background: linear-gradient(to bottom, #ffffff 0%, #f0f0f0 100%);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }

  .key.white-key.active {
    background: linear-gradient(to bottom, #f0f0f0 0%, #e0e0e0 100%);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
    transform: translateY(2px);
  }

  /* Black keys */
  .key.black-key {
    width: 36px;
    height: 180px;
    background: linear-gradient(to bottom, #000 0%, #1a1a1a 100%);
    border: 1px solid #000;
    border-radius: 0 0 6px 6px;
    cursor: pointer;
    user-select: none;
    position: absolute;
    margin-left: -18px;
    margin-right: -18px;
    z-index: 10;
    transition: all 0.05s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  }

  .key.black-key:hover {
    background: linear-gradient(to bottom, #1a1a1a 0%, #333 100%);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.6);
  }

  .key.black-key.active {
    background: linear-gradient(to bottom, #333 0%, #555 100%);
    box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.2), 0 2px 4px rgba(0, 0, 0, 0.3);
    transform: translateY(2px);
  }

  /* Note labels */
  .note-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #333;
    margin-top: auto;
  }

  .octave-label {
    font-size: 0.75rem;
    color: #666;
    font-weight: 500;
  }

  /* Help text */
  .keyboard-help {
    text-align: center;
  }

  .help-text {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: 0;
  }

  /* Responsive design */
  @media (max-width: 1024px) {
    .key.white-key {
      width: 45px;
      height: 200px;
    }

    .key.black-key {
      width: 27px;
      height: 130px;
      margin-left: -13.5px;
      margin-right: -13.5px;
    }

    .note-label {
      font-size: 0.75rem;
    }

    .octave-label {
      font-size: 0.65rem;
    }
  }

  @media (max-width: 640px) {
    .key.white-key {
      width: 35px;
      height: 150px;
      padding: 4px 2px;
    }

    .key.black-key {
      width: 20px;
      height: 100px;
      margin-left: -10px;
      margin-right: -10px;
    }

    .note-label {
      font-size: 0.65rem;
    }

    .octave-label {
      display: none;
    }

    .keyboard-help {
      display: none;
    }
  }

  /* Accessibility */
  .key:focus {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .key:focus:not(:focus-visible) {
    outline: none;
  }

  /* Print styles */
  @media print {
    .keyboard-container {
      display: none;
    }
  }
</style>
