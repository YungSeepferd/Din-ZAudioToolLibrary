<script>
  /**
   * PianoKeyboard.svelte
   *
   * CONCEPT: A full 88-key piano keyboard UI with vintage aesthetic
   *
   * DESIGN PHILOSOPHY:
   * - Minimalist, numbers-free design focusing on the act of playing
   * - Vintage piano aesthetics (warm tones, wood-like surfaces)
   * - Full mouse and touch support for flexibility
   * - Keyboard support (QWERTY) for computer players
   * - Visual feedback emphasizes motion and tactile response
   *
   * SVELTE 5 PATTERNS USED:
   * - $props() for component properties
   * - $state() for reactive local state (activeKeys, isMouseDown)
   * - onMount() lifecycle hook for global event listeners
   * - Cleanup function for proper listener removal on unmount
   *
   * INTERACTION PATTERNS:
   * - Click/drag across keys to play multiple notes
   * - Touch support for mobile/tablet playing
   * - QWERTY keyboard mapping (Z-M, comma/period keys)
   * - Visual feedback: depression effect, color change
   * - Keyboard help text guides users
   *
   * ACCESSIBILITY:
   * - ARIA labels for each key
   * - Keyboard navigation support
   * - Screen reader friendly
   * - Focus indicators for accessibility
   *
   * USAGE:
   * <PianoKeyboard
   *   audioState={pianoState}
   *   startNote={12}
   *   keyCount={88}
   *   showNoteNames={true}
   *   showOctaveNumbers={true}
   * />
   */

  import { onMount } from 'svelte';

  // ===== PROPS DESTRUCTURING (Svelte 5 $props rune) =====
  // audioState: Reference to the audio engine for playing/stopping notes
  // startNote: MIDI note to start keyboard from (default A0 = 12)
  // keyCount: Number of keys to display (default 88 = full piano)
  // showNoteNames: Display C, C#, D, etc. on white keys
  // showOctaveNumbers: Display octave numbers next to note names
  let {
    audioState = undefined,
    startNote = 12,
    keyCount = 88,
    showNoteNames = true,
    showOctaveNumbers = true
  } = $props();

  // ===== LOCAL REACTIVE STATE (Svelte 5 $state rune) =====
  // keyboardElement: Reference to the keyboard container DOM node
  // isMouseDown: Track mouse button state for drag across keys
  // activeKeys: Map of currently playing notes (note -> DOM element)
  let keyboardElement = $state();
  let isMouseDown = $state(false);
  let activeKeys = $state(new Map()); // Map of MIDI note -> element

  // ===== KEYBOARD MAPPING & CONSTANTS =====
  // Static keyboard mapping - created once at module initialization
  let keyboardMapping = createKeyboardMapping();

  // Musical note names for display (C to B, repeats each octave)
  // MIDI uses: C=0, C#=1, D=2, ..., B=11 within each octave
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // ===== HELPER FUNCTIONS =====

  /**
   * Create keyboard key to MIDI note mapping for QWERTY playing
   *
   * DESIGN: Two-octave chromatic layout matching standard piano playing
   * - Bottom row (ZXCVBNM): White keys C3-B3
   * - Top row (SDFGHJL): Black keys C#3-A#4
   * - Comma period keys: C4-D4 (middle C range for easy playing)
   *
   * WHY: QWERTY mapping allows computer keyboard players to play naturally
   * without memorizing note positions, similar to actual piano keys
   *
   * @private
   * @returns {Object} Mapping of keyboard keys to MIDI notes
   */
  function createKeyboardMapping() {
    return {
      // Bottom row - white keys C3 to B3
      'z': 48, // C3
      'x': 50, // D3
      'c': 52, // E3
      'v': 53, // F3
      'b': 55, // G3
      'n': 57, // A3
      'm': 59, // B3
      // Top row - black keys C#3 to A#4
      's': 49, // C#3
      'd': 51, // D#3
      'g': 54, // F#3
      'h': 56, // G#3
      'j': 58, // A#3
      'l': 61, // C#4
      // Extended range
      ',': 60, // C4 (middle C)
      '.': 62, // D4
      ';': 63, // D#4
      '/': 64  // E4
    };
  }

  /**
   * Get note name and octave for MIDI note number
   *
   * MATH: MIDI note = (octave + 1) * 12 + noteInOctave
   * Example: MIDI 60 = (4 + 1) * 12 + 0 = C4 (middle C)
   *
   * WHY: Convert raw MIDI numbers to human-readable note names
   * Display to users in format: "C4", "F#3", "A1", etc.
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
   * Determine if MIDI note is a black key on the piano
   *
   * DESIGN: Black keys are sharps/flats (C#, D#, F#, G#, A#)
   * Pattern within each octave: indices 1, 3, 6, 8, 10
   * Note: E/B don't have black keys (natural semitones)
   *
   * WHY: Visual layout requires different styles/positioning for black vs white keys
   *
   * @private
   * @param {number} midiNote - MIDI note number
   * @returns {boolean} True if black key
   */
  function isBlackKey(midiNote) {
    const noteInOctave = midiNote % 12;
    return [1, 3, 6, 8, 10].includes(noteInOctave);
  }

  // ===== MOUSE/TOUCH INTERACTION HANDLERS =====

  /**
   * Handle mouse/touch down on key - play note
   *
   * WHY: Initiates note playback with standard velocity (100)
   * Also tracks state for drag-across-keys behavior
   *
   * @private
   */
  function handleKeyDown(e) {
    if (!audioState) return;

    const midiNote = parseInt(e.currentTarget.dataset.note);
    const velocity = 100; // Standard velocity for all keys

    // Tell audio engine to play this note
    audioState.playNote(midiNote, velocity);
    // Track in active keys for cleanup on release
    activeKeys.set(midiNote, e.currentTarget);
    // Add CSS class for visual feedback (depression effect)
    e.currentTarget.classList.add('active');
    // Set flag so entering other keys while dragging will also play them
    isMouseDown = true;
  }

  /**
   * Handle mouse/touch up on key - stop note
   *
   * WHY: Ends note playback, provides immediate feedback
   *
   * @private
   */
  function handleKeyUp(e) {
    if (!audioState) return;

    const midiNote = parseInt(e.currentTarget.dataset.note);

    // Tell audio engine to release this note
    audioState.stopNote(midiNote);
    // Clean up tracking
    activeKeys.delete(midiNote);
    // Remove visual feedback
    e.currentTarget.classList.remove('active');
  }

  /**
   * Handle mouse entering a key while button is held down
   *
   * WHY: Enables drag-across-keys behavior (legato style playing)
   * User can click one key and drag to another while holding button
   * This plays each key as the mouse moves over it (like a glissando)
   *
   * DESIGN CHOICE: Only triggers if not already active
   * This prevents playing the same note twice if mouse flickers
   *
   * @private
   */
  function handleMouseEnter(e) {
    if (!isMouseDown || !audioState) return;

    const midiNote = parseInt(e.currentTarget.dataset.note);
    const velocity = 100;

    // Only trigger if not already active - prevents duplicate playback
    if (!activeKeys.has(midiNote)) {
      audioState.playNote(midiNote, velocity);
      activeKeys.set(midiNote, e.currentTarget);
      e.currentTarget.classList.add('active');
    }
  }

  /**
   * Handle mouse leaving a key while button is held down
   *
   * WHY: Completes the drag-across behavior by stopping notes
   * as the mouse moves away from keys
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

  // ===== KEYBOARD INTERACTION HANDLERS (QWERTY PLAYING) =====

  /**
   * Handle keyboard key press - play note via QWERTY mapping
   *
   * WHY: Enables playing piano with physical keyboard (Z-M keys)
   * Prevents key repeat events from triggering multiple times
   *
   * @private
   */
  function handleWindowKeyDown(e) {
    if (!audioState) return;

    const key = e.key.toLowerCase();
    const midiNote = keyboardMapping[key];

    // Check: mapping exists AND not a repeat (key held down)
    if (midiNote && !e.repeat) {
      const velocity = 100;
      audioState.playNote(midiNote, velocity);
      activeKeys.set(midiNote, document.querySelector(`[data-note="${midiNote}"]`));

      // Add visual feedback to match visual key press
      const element = document.querySelector(`[data-note="${midiNote}"]`);
      if (element) {
        element.classList.add('active');
      }
    }
  }

  /**
   * Handle keyboard key release - stop note from QWERTY playing
   *
   * WHY: Releases note playback when physical key is released
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

  // ===== LIFECYCLE & CLEANUP =====

  /**
   * Cleanup function - called on component unmount
   *
   * WHY: Prevent memory leaks and ghost events after component is removed
   * Must remove ALL event listeners we added and stop any playing notes
   *
   * @private
   */
  function cleanup() {
    // Stop all audio playback and clear tracking
    if (audioState) {
      audioState.stopAll();
      activeKeys.clear();
    }

    // Remove global keyboard listeners
    // CRITICAL: Must do this or keyboard events fire on dead component
    document.removeEventListener('keydown', handleWindowKeyDown);
    document.removeEventListener('keyup', handleWindowKeyUp);
  }

  // Svelte lifecycle hook: runs when component mounts to DOM
  // Returns cleanup function which Svelte calls on unmount
  onMount(() => {
    // Add global keyboard listeners for QWERTY playing
    document.addEventListener('keydown', handleWindowKeyDown);
    document.addEventListener('keyup', handleWindowKeyUp);

    // Svelte calls this when component is destroyed
    return cleanup;
  });

  // ===== DATA GENERATION =====

  /**
   * Generate array of MIDI notes for rendering keyboard
   *
   * WHY: Create list of consecutive MIDI notes starting at startNote
   * For 88-key piano: MIDI 12 (A0) to MIDI 99 (C8)
   *
   * MATH: Each iteration adds 1 to startNote
   * keyCount determines how many keys to display
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

  // Generate the notes array once during initialization
  // {#each} will iterate over this to render all keys
  const notes = generateNotes();

  /**
   * Calculate the left position for a black key
   *
   * Black keys need to be positioned between white keys.
   * This counts how many WHITE keys came before this black key,
   * then calculates the offset based on white key width.
   *
   * @param {number} midiNote - MIDI note number for the black key
   * @param {number} index - Index in the notes array
   * @returns {number} Left position in pixels
   */
  function getBlackKeyPosition(midiNote, index) {
    // Count white keys before this black key
    let whiteKeyCount = 0;
    for (let i = 0; i < index; i++) {
      if (!isBlackKey(notes[i])) {
        whiteKeyCount++;
      }
    }

    // White key width (must match CSS)
    const whiteKeyWidth = 60;

    // Position black key at the right edge of the previous white key
    // Subtract half the black key width to center it
    const blackKeyWidth = 36;
    const position = (whiteKeyCount * whiteKeyWidth) - (blackKeyWidth / 2);

    return position;
  }
</script>

<div class="keyboard-container" bind:this={keyboardElement}>
  <div class="keyboard">
    {#each notes as midiNote, idx (midiNote)}
      {@const isBlack = isBlackKey(midiNote)}
      {@const noteInfo = getNoteInfo(midiNote)}
      {@const noteLabel = `${noteInfo.name}${showOctaveNumbers ? noteInfo.octave : ''}`}
      {@const blackKeyLeft = isBlack ? getBlackKeyPosition(midiNote, idx) : 0}

      <button
        class="key"
        class:white-key={!isBlack}
        class:black-key={isBlack}
        style={isBlack ? `left: ${blackKeyLeft}px` : ''}
        data-note={midiNote}
        onmousedown={handleKeyDown}
        onmouseup={handleKeyUp}
        onmouseleave={handleMouseLeave}
        onmouseenter={handleMouseEnter}
        ontouchstart={handleKeyDown}
        ontouchend={handleKeyUp}
        title={`${noteLabel} (MIDI ${midiNote})`}
        aria-label={`Piano key ${noteLabel}`}
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
  /* ============================================================
     DESIGN TOKENS & CONTAINER
     ============================================================
     Vintage piano aesthetic with warm earth tones
     Emulates the look and feel of a classic upright piano
  */

  .keyboard-container {
    /* Piano key colors - using global design tokens */
    --piano-white-light: var(--key-white); /* From global tokens.css */
    --piano-white-mid: var(--bg-secondary);
    --piano-white-dark: var(--color-surface);
    --piano-black-light: var(--key-black);
    --piano-black-dark: var(--color-deep-brown);

    /* Accent colors for feedback - using global tokens */
    --active-shadow: rgba(212, 165, 116, 0.3); /* var(--accent) with alpha */
    --hover-shadow: rgba(0, 0, 0, 0.15);

    /* Wood background for contrast */
    --vintage-wood-dark: var(--color-warm-brown);
    --vintage-wood-accent: #6d4c41;

    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-6);
    background: linear-gradient(135deg, var(--vintage-wood-accent) 0%, var(--vintage-wood-dark) 100%);
    border-radius: var(--border-radius-xl);
    border: 2px solid var(--vintage-wood-dark);
    box-shadow: var(--shadow-xl), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .keyboard {
    /* Main keyboard bed - like the body of a piano */
    display: flex;
    gap: 0;
    justify-content: center;
    align-items: flex-end;
    position: relative;
    background: linear-gradient(to bottom, var(--vintage-wood-accent) 0%, var(--vintage-wood-dark) 100%);
    padding: 1.5rem 1rem 1rem 1rem;
    border-radius: 8px;
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3);
    overflow-x: auto;
    overflow-y: hidden;
  }

  /* ============================================================
     WHITE KEYS - Vintage Ivory
     ============================================================
     Warm cream color with subtle 3D depth effect
  */

  .key.white-key {
    width: 60px;
    height: 280px;
    /* Subtle gradient from light to darker ivory */
    background: linear-gradient(to bottom, var(--piano-white-light) 0%, var(--piano-white-mid) 60%, var(--piano-white-dark) 100%);
    /* Warm border color (not gray) */
    border: 1px solid #a69e8f;
    border-radius: 0 0 8px 8px;
    /* Layout for note labels */
    cursor: pointer;
    user-select: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 8px 4px;
    position: relative;
    /* Smooth depression effect when clicked */
    transition: all 0.05s ease;
    /* Depth shadow - looks like a real key */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25), inset 0 -1px 2px rgba(0, 0, 0, 0.1);
  }

  .key.white-key:hover {
    /* Slightly lighter on hover - like light hitting the key */
    background: linear-gradient(to bottom, #fefbf7 0%, var(--piano-white-light) 60%, var(--piano-white-mid) 100%);
    /* Enhanced shadow on hover */
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.1);
  }

  .key.white-key.active {
    /* Pressed effect - golden accent highlight */
    background: linear-gradient(to bottom, var(--key-white-active) 0%, var(--accent) 60%, var(--accent-hover) 100%);
    /* Inset shadow for depression, warm gold glow for feedback */
    box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.1), 0 2px 8px var(--active-shadow);
    /* Physical depression effect */
    transform: translateY(2px);
  }

  /* ============================================================
     BLACK KEYS - Vintage Ebony
     ============================================================
     Deep black with subtle sheen effect
  */

  .key.black-key {
    width: 36px;
    height: 180px;
    /* Dark gradient with subtle shine at top */
    background: linear-gradient(to bottom, var(--piano-black-light) 0%, var(--piano-black-dark) 100%);
    border: 1px solid #0a0a0a;
    border-radius: 0 0 6px 6px;
    cursor: pointer;
    user-select: none;
    position: absolute;
    z-index: 10;
    transition: all 0.05s ease;
    /* Deep shadow for 3D effect */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.6), inset 0 -1px 2px rgba(0, 0, 0, 0.5);
  }

  .key.black-key:hover {
    /* Slightly lighter on hover */
    background: linear-gradient(to bottom, #3a3a3a 0%, #1f1f1f 100%);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.7), inset 0 -1px 2px rgba(0, 0, 0, 0.5);
  }

  .key.black-key.active {
    /* Pressed effect with warm gold accent glow */
    background: linear-gradient(to bottom, var(--key-black-active) 0%, var(--accent-hover) 70%, var(--accent) 100%);
    box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.5), inset 0 -1px 2px rgba(0, 0, 0, 0.5), 0 2px 8px var(--active-shadow);
    transform: translateY(2px);
  }

  /* ============================================================
     NOTE LABELS - Minimalist Design
     ============================================================
     Small, subtle labels that don't dominate the keyboard
  */

  .note-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #5d5d5d; /* Not black - warm gray */
    margin-top: auto;
    letter-spacing: 0.5px;
  }

  .octave-label {
    font-size: 0.75rem;
    color: #888; /* Lighter gray for secondary info */
    font-weight: 500;
    letter-spacing: 0.3px;
  }

  /* ============================================================
     HELP TEXT - User Guidance
     ============================================================
     Non-obtrusive help text for new users
  */

  .keyboard-help {
    text-align: center;
    padding: 0.5rem 0;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .help-text {
    font-size: 0.875rem;
    color: #b8a89a; /* Warm beige text */
    margin: 0;
    font-style: italic;
    letter-spacing: 0.3px;
  }

  /* ============================================================
     RESPONSIVE DESIGN
     ============================================================
  */

  @media (max-width: 1024px) {
    .key.white-key {
      width: 45px;
      height: 200px;
    }

    .key.black-key {
      width: 27px;
      height: 130px;
    }

    .note-label {
      font-size: 0.75rem;
    }

    .octave-label {
      font-size: 0.65rem;
    }
  }

  @media (max-width: 640px) {
    .keyboard-container {
      padding: 1rem;
      gap: 0.75rem;
    }

    .keyboard {
      padding: 1rem 0.75rem 0.75rem 0.75rem;
    }

    .key.white-key {
      width: 35px;
      height: 150px;
      padding: 4px 2px;
    }

    .key.black-key {
      width: 20px;
      height: 100px;
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

  /* ============================================================
     ACCESSIBILITY
     ============================================================
     Keyboard focus indicators for accessibility
  */

  .key:focus {
    outline: 2px solid var(--accent); /* Warm gold outline from design tokens */
    outline-offset: 2px;
  }

  .key:focus:not(:focus-visible) {
    outline: none;
  }

  /* ============================================================
     PRINT STYLES
     ============================================================
  */

  @media print {
    .keyboard-container {
      display: none;
    }
  }
</style>
