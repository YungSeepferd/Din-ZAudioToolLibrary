<script>
  /**
   * VintageKnob.svelte
   *
   * CONCEPT: Accessible rotary control component using Svelte 5 Runes
   *
   * DESIGN PHILOSOPHY:
   * - Numbers-free interface: Users experience the knob visually, not numerically
   * - Vintage aesthetic: Inspired by analog synthesizers and old audio equipment
   * - Perceptual feedback: Arc indicator shows intensity without exact values
   * - Full accessibility: ARIA labels, keyboard navigation, screen reader support
   *
   * SVELTE 5 PATTERNS USED:
   * - $props() for destructuring component properties with defaults
   * - $bindable() for two-way data binding on the 'value' prop
   * - $state() for local reactive state (isDragging, ref elements)
   * - $derived() for computed reactive values (rotation, intensity)
   *
   * INTERACTION PATTERNS:
   * - Mouse/Touch: Click and drag to rotate (270° arc, not full circle)
   * - Keyboard: Arrow keys (Up/Right = increase, Down/Left = decrease)
   * - Relative positioning: Angle calculated from knob center
   * - Responsive step: Quantized to 'step' prop for consistent values
   *
   * FEATURES:
   * - Smooth rotation with mouse drag or touch
   * - Keyboard support (Arrow keys for fine control)
   * - Optional visual intensity arc
   * - No numeric value display (perceptual design)
   * - Accessibility-friendly (ARIA labels, keyboard navigation)
   *
   * IMPLEMENTATION NOTES:
   * - Uses SVG for visual feedback (arc indicator)
   * - Event listeners cleaned up in $effect cleanup
   * - Knob rotates 270° (3/4 circle): -45° to 225° for visual balance
   *
   * USAGE:
   * <VintageKnob
   *   bind:value={frequency}
   *   min={20}
   *   max={20000}
   *   step={10}
   *   label="Frequency"
   *   showIntensity={true}
   *   disabled={false}
   * />
   */

  // ===== PROPS DESTRUCTURING (Svelte 5 $props rune) =====
  // $props() creates a reactive proxy of component properties
  // $bindable() marks 'value' as two-way bindable from parent: bind:value={myVar}
  let {
    value = $bindable(0.5),    // Current value (0-1 after normalization, but min-max in original scale)
    min = 0,                    // Minimum boundary value
    max = 100,                  // Maximum boundary value
    step = 1,                   // Quantization step (e.g., 1 Hz, 0.1 dB)
    label = 'Control',          // Display label below knob
    showIntensity = true,       // Show arc indicator
    disabled = false,           // Disable interaction
    ariaLabel = label,          // Accessibility label for screen readers
    ariaDescribedBy = null      // Optional reference to description element
  } = $props();

  // ===== LOCAL REACTIVE STATE (Svelte 5 $state rune) =====
  // $state() creates local reactive variables that trigger reactivity when changed
  let isDragging = $state(false);      // Tracks whether user is actively dragging
  let knobElement = $state(null);      // Reference to DOM button element
  let containerElement = $state(null); // Reference to DOM container div

  // ===== COMPUTED REACTIVE VALUES (Svelte 5 $derived rune) =====
  // $derived() creates reactive values that auto-update when dependencies change
  // These are read-only and re-computed on every dependency change
  let normalizedValue = $derived((value - min) / (max - min));  // 0-1 scale
  let rotation = $derived(normalizedValue * 270);               // Convert 0-1 to 0-270 degrees
  let intensity = $derived(normalizedValue);                    // Same as normalized for arc opacity
  let arcRotation = $derived(rotation);                         // Alias for clarity in template

  // ===== HELPER FUNCTIONS =====

  /**
   * Convert angle in degrees to normalized 0-1 value
   * MATH: Clamps angle to valid 270° range and divides by 270
   * REASON: Knob rotates 270° (3/4 circle), not full 360°
   *
   * @param {number} angle - Rotation angle in degrees (0-360)
   * @returns {number} Normalized value (0-1)
   */
  function angleToNormalized(angle) {
    const clampedAngle = Math.max(0, Math.min(270, angle));
    return clampedAngle / 270;
  }

  /**
   * Convert mouse/touch position to rotation angle
   * MATH: Uses atan2 to calculate angle from center, adjusts for coordinate system
   * REASON: Knob needs -45° (bottom-left) to 225° (bottom-right) mapping
   *
   * @param {number} clientX - Mouse X coordinate (screen space)
   * @param {number} clientY - Mouse Y coordinate (screen space)
   * @returns {number} Angle in degrees relative to knob center
   */
  function clientToAngle(clientX, clientY) {
    if (!knobElement) return 0;

    // Get knob center coordinates
    const rect = knobElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate relative position
    const dx = clientX - centerX;
    const dy = clientY - centerY;

    // atan2(y, x) gives angle in radians: 0° = right, 90° = down, -90° = up
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Rotate coordinate system: shift by -45° so 0° is bottom-left
    angle = angle - (-45);
    if (angle < 0) angle += 360;

    return angle;
  }

  /**
   * UPDATE VALUE FROM INPUT
   * Handles the common pattern: calculate angle → normalize → scale to min-max → quantize
   * @param {number} clientX - Mouse/touch X
   * @param {number} clientY - Mouse/touch Y
   */
  function updateValueFromPosition(clientX, clientY) {
    const angle = clientToAngle(clientX, clientY);
    const normalized = angleToNormalized(angle);
    // QUANTIZATION: Round to nearest 'step' to avoid floating-point drift
    value = Math.round((min + normalized * (max - min)) / step) * step;
  }

  // ===== MOUSE INTERACTION HANDLERS =====

  /**
   * Handle mouse down: Start dragging, attach global listeners
   * WHY GLOBAL LISTENERS: User may move mouse fast outside knob bounds
   * So we listen on document, not just the knob element
   */
  function handleMouseDown(e) {
    if (disabled) return;
    isDragging = true;
    updateValueFromPosition(e.clientX, e.clientY);
    // Global listeners persist until user releases mouse
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  /**
   * Handle mouse move while dragging
   * Updates value in real-time as user drags
   */
  function handleMouseMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    updateValueFromPosition(e.clientX, e.clientY);
  }

  /**
   * Handle mouse up: Stop dragging, remove global listeners
   */
  function handleMouseUp() {
    isDragging = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }

  // ===== KEYBOARD INTERACTION HANDLER =====

  /**
   * Handle keyboard input for accessible control
   * Up/Right = increase by step
   * Down/Left = decrease by step
   * e.preventDefault() stops browser from scrolling page
   */
  function handleKeyDown(e) {
    if (disabled) return;
    let increment = 0;

    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        increment = step;
        e.preventDefault();
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        increment = -step;
        e.preventDefault();
        break;
      default:
        return;
    }

    // Clamp new value to min-max range
    value = Math.max(min, Math.min(max, value + increment));
  }

  // ===== TOUCH INTERACTION HANDLERS =====

  /**
   * Handle touch start: Same as mouse, but for touch devices
   * Check e.touches.length === 1 to ignore multi-touch
   */
  function handleTouchStart(e) {
    if (disabled || e.touches.length !== 1) return;
    isDragging = true;
    const touch = e.touches[0];
    updateValueFromPosition(touch.clientX, touch.clientY);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  }

  /**
   * Handle touch move while dragging
   */
  function handleTouchMove(e) {
    if (!isDragging || e.touches.length !== 1) return;
    e.preventDefault();
    const touch = e.touches[0];
    updateValueFromPosition(touch.clientX, touch.clientY);
  }

  /**
   * Handle touch end: Stop dragging, remove listeners
   */
  function handleTouchEnd() {
    isDragging = false;
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  }

  // ===== LIFECYCLE & CLEANUP (Svelte 5 $effect with cleanup) =====

  /**
   * CLEANUP PATTERN: $effect with return function for cleanup
   * This runs when component unmounts and removes all global event listeners
   * Prevents memory leaks if component is destroyed while dragging
   * REASON: If user is dragging and component unmounts, listeners stay active
   * This causes "ghost" events on the removed component
   */
  $effect(() => {
    // Return cleanup function that runs on unmount
    return () => {
      // Remove all possible listeners (important: some may not be attached)
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  });
</script>

<!--
  TEMPLATE STRUCTURE:
  1. Container div: Layout container with design tokens (CSS custom properties)
  2. Label: Text below knob for affordance ("Frequency", "Volume", etc.)
  3. Button: Interactive element (role="slider" for accessibility)
     - SVG arc: Visual feedback showing intensity (optional)
     - Grip div: Rotatable indicator showing current position
  4. Hidden text: Accessibility help for screen readers
-->

<div class="knob-container" bind:this={containerElement}>
  <!-- Display label (no numbers, just semantic text) -->
  <div class="knob-label">{label}</div>

  <!--
    ACCESSIBLE BUTTON PATTERN:
    - role="slider": Tells screen readers this is a slider control
    - aria-valuemin/max/now: Numeric accessibility info for screen readers
    - tabindex: 0 = focusable, -1 = not focusable (when disabled)
    - onmousedown/ontouchstart/onkeydown: Svelte 5 event handlers (no on: directive)
  -->
  <button
    bind:this={knobElement}
    class="knob"
    class:dragging={isDragging}
    class:disabled
    role="slider"
    aria-label={ariaLabel}
    aria-describedby={ariaDescribedBy}
    aria-valuemin={min}
    aria-valuemax={max}
    aria-valuenow={value}
    aria-valuetext={`${value.toFixed(2)}`}
    onmousedown={handleMouseDown}
    ontouchstart={handleTouchStart}
    onkeydown={handleKeyDown}
    tabindex={disabled ? -1 : 0}
  >
    <!--
      VISUAL FEEDBACK: Optional arc indicator
      - Uses stroke-dasharray trick: draws partial arc by limiting dash length
      - Background arc: 220px dash on 220px total (full circle visible)
      - Active arc: partial dash based on rotation (shows intensity)
      - SVG path: M = move to, A = arc, coordinates relative to 100x100 viewBox
    -->
    {#if showIntensity}
      <svg class="knob-arc" viewBox="0 0 100 100">
        <!-- Background arc (shows full range in faded color) -->
        <path
          class="arc-background"
          d="M 50 8 A 42 42 0 0 1 78 78"
          stroke="var(--color-border)"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
        />

        <!--
          Active arc (visual progress indicator)
          stroke-dasharray: "Xpx 220px" means: draw X pixels, gap 220-X pixels
          This creates the visual effect of a partial arc based on rotation %
          opacity: intensity (0-1) fades arc as value changes
        -->
        <path
          class="arc-active"
          d="M 50 8 A 42 42 0 0 1 78 78"
          stroke="var(--color-accent)"
          stroke-width="3"
          fill="none"
          stroke-linecap="round"
          style="stroke-dasharray: {(rotation / 270) * 220}px 220px; opacity: {intensity};"
        />
      </svg>
    {/if}

    <!--
      ROTATABLE GRIP INDICATOR
      - Outer div: Rotates via CSS transform
      - Inner div: Yellow bar showing current position
      - CSS animation provides smooth rotation transition
    -->
    <div class="knob-grip" style="transform: rotate({rotation}deg);">
      <div class="knob-indicator"></div>
    </div>
  </button>

  <!--
    ACCESSIBILITY: Hidden help text for screen readers
    sr-only class: CSS hides visually but keeps for screen readers
    Provides keyboard instructions for non-obvious interactions
  -->
  <div class="sr-only" id="{label}-help">
    Use arrow keys to adjust. Left/Right for coarse, Up/Down for fine control.
  </div>
</div>

<style>
  /* ============================================================
     DESIGN TOKENS & CONTAINER
     ============================================================
     Svelte 5 scoped styles: CSS custom properties are local to component
     VINTAGE AESTHETIC: Warm earth tones (cream, taupe, gold)
     These token names follow convention: --color-*, --shadow-*, --space-*
  */
  .knob-container {
    /* --- DESIGN TOKENS: Color Palette (Vintage Audio Equipment) ---*/
    --color-cream: #f5f1e8;           /* Background: warm off-white */
    --color-taupe: #8b8680;           /* Secondary text: muted brown */
    --color-sage: #9ca89a;            /* Borders: dusty green */
    --color-warm-brown: #6b5b52;      /* Unused in this component */
    --color-gold: #d4a574;            /* Accent: warm gold for highlights */
    --color-deep-brown: #3d3230;      /* Primary text: very dark */

    /* --- SEMANTIC COLOR MAPPINGS ---*/
    --color-background: var(--color-cream);       /* Container background */
    --color-surface: #ebe7dd;                      /* Knob face color */
    --color-text-primary: var(--color-deep-brown); /* Main text */
    --color-text-secondary: var(--color-taupe);    /* Secondary text (label) */
    --color-border: var(--color-sage);             /* Knob border & arcs */
    --color-accent: var(--color-gold);             /* Interactive states */

    /* --- SHADOWS: Depth and affordance ---*/
    --shadow-sm: 0 1px 2px rgba(61, 50, 48, 0.08); /* Subtle shadow */
    --shadow-md: 0 2px 4px rgba(61, 50, 48, 0.12); /* Hover shadow */

    /* --- UTILITIES ---*/
    --border-radius-md: 4px;

    /* --- LAYOUT ---*/
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  /* Label text below knob: "FREQUENCY", "VOLUME", etc. */
  .knob-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-secondary);
    text-transform: uppercase;       /* Makes label LOOK more analog */
    letter-spacing: 0.5px;           /* Slightly spaced for vintage feel */
    text-align: center;
    max-width: 120px;                /* Prevent long labels from breaking layout */
    line-height: 1.2;
  }

  /* ============================================================
     INTERACTIVE KNOB BUTTON
     ============================================================
     Core element: 80x80px circular button with visual feedback
     Uses flexbox to center SVG arc and grip indicator
  */
  .knob {
    /* --- BUTTON RESET ---
       Remove default browser styling from <button> element
    */
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    cursor: grab;          /* "Grabbable" cursor affordance */
    position: relative;    /* Allows absolute positioning of arc & grip */

    /* --- SHAPE & SIZE ---
       Circular 80x80px knob, centered content
    */
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    /* --- VISUAL STYLING ---
       Subtle border and shadow for depth
    */
    background: var(--color-surface);
    border: 2px solid var(--color-border);
    box-shadow: var(--shadow-sm);

    /* --- ANIMATION ---
       Smooth transitions for interactive feedback (50ms)
    */
    transition: all 0.2s ease-out;

    /* --- ACCESSIBILITY ---
       Remove default focus ring; we provide custom one
    */
    outline: none;
  }

  /* Hover state: Highlight when user hovers (not dragging) */
  .knob:hover:not(.disabled) {
    box-shadow: var(--shadow-md);      /* Elevated shadow on hover */
    border-color: var(--color-accent); /* Highlight border in gold */
  }

  /* Keyboard focus: Custom focus indicator for accessibility */
  .knob:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 4px;
  }

  /* Dragging state: Pressed-in appearance */
  .knob.dragging {
    cursor: grabbing;
    box-shadow: inset 0 2px 4px rgba(61, 50, 48, 0.15); /* Inset shadow = pressed */
    border-color: var(--color-accent);
  }

  /* Disabled state: Opacity and cursor change */
  .knob.disabled {
    opacity: 0.5;                              /* Faded appearance */
    cursor: not-allowed;                       /* Clear interaction unavailable */
    background: rgba(235, 231, 221, 0.7);     /* Desaturated surface */
  }

  /* ============================================================
     VISUAL FEEDBACK: SVG Arc Indicator
     ============================================================
     Shows intensity via animated arc (stroke-dasharray trick)
     Layered on top of knob via absolute positioning
  */
  .knob-arc {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;  /* Don't interfere with mouse/touch on button */
  }

  /* Background arc: Shows full range (always visible, faded) */
  .arc-background {
    opacity: 0.3;
  }

  /* Active arc: Animates as value changes (stroke-dasharray updates) */
  .arc-active {
    /* Fast animation: 50ms matches button feedback speed */
    transition: stroke-dasharray 0.05s linear, opacity 0.05s linear;
  }

  /* ============================================================
     INTERACTIVE INDICATOR: Rotatable Grip
     ============================================================
     Yellow bar rotates with knob: { transform: rotate(Ndeg) }
     Updated by $derived rotation value in script
  */
  .knob-grip {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    /* Smooth rotation (50ms matches arc animation) */
    transition: transform 0.05s linear;
  }

  /* Yellow indicator bar (3px wide, 28px tall) */
  .knob-indicator {
    position: absolute;
    width: 3px;
    height: 28px;
    background: var(--color-accent);        /* Gold color */
    border-radius: 2px;                     /* Rounded ends */
    top: 8px;                               /* Position at top of knob */
    left: 50%;                              /* Center horizontally */
    transform: translateX(-50%);            /* Precise centering */

    /* Subtle glow: Creates depth & affordance */
    box-shadow: 0 0 0 2px rgba(212, 165, 116, 0.2);
  }

  /* ============================================================
     ACCESSIBILITY: Screen Reader Only Text
     ============================================================
     Hides text visually but keeps for screen reader users
     Standard WAI-ARIA pattern for hidden descriptive text
  */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
</style>
