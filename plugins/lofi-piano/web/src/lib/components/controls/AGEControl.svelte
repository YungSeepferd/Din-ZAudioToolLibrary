<script>
  /**
   * AGEControl.svelte
   * Analog Gear Emulation - Postcard Piano's signature vintage character effect
   *
   * The AGE knob progressively adds analog warmth and character through:
   * - Tape saturation (subtle harmonic distortion)
   * - Frequency rolloff (slight high-frequency loss)
   * - Subtle modulation (analog tape wow/flutter)
   *
   * This creates a numbers-free, perceptual interface for vintage warmth.
   *
   * Usage:
   * <AGEControl bind:ageAmount={ageAmount} />
   */

  import VintageKnob from '@ui/controls/VintageKnob.svelte';

  let { ageAmount = $bindable(0) } = $props();

  // Derived parameters for audio processing
  let ageIntensity = $derived(ageAmount / 100);
  let saturationAmount = $derived(ageIntensity * 0.3); // 0-30% harmonic content
  let rolloffAmount = $derived(ageIntensity * 1500); // 0-1500 Hz high-frequency rolloff
  let modulationAmount = $derived(ageIntensity * 0.05); // 0-5% tape wobble

  // Perceptual description (no numbers shown to user)
  let ageCharacter = $derived.by(() => {
    if (ageAmount === 0) return 'Digital (pristine)';
    if (ageAmount < 25) return 'Subtle warmth';
    if (ageAmount < 50) return 'Warm vintage';
    if (ageAmount < 75) return 'Rich analog';
    return 'Heavily aged';
  });

  // Effect on audio is applied when ageAmount changes
  // The actual audio processing happens in the parent component or audio state manager
  $effect(() => {
    // This triggers when ageAmount changes
    // Parent component or audio state should listen for this effect
    // Example: audioState.updateAGE({ saturation, rolloff, modulation })
  });
</script>

<div class="age-section">
  <div class="age-header">
    <h3 class="age-title">AGE</h3>
    <div class="age-description">{ageCharacter}</div>
  </div>

  <div class="age-knob-container">
    <VintageKnob
      bind:value={ageAmount}
      min={0}
      max={100}
      step={1}
      label="Vintage Character"
      showIntensity={true}
      ariaLabel="AGE - Analog Gear Emulation"
      ariaDescribedBy="age-help"
    />
  </div>

  <!-- Accessibility help text -->
  <div class="sr-only" id="age-help">
    Adjust vintage character from pristine digital to heavily aged analog. Use arrow keys for fine control.
  </div>
</div>

<style>
  .age-section {
    /* Design tokens */
    --color-cream: #f5f1e8;
    --color-taupe: #8b8680;
    --color-sage: #9ca89a;
    --color-warm-brown: #6b5b52;
    --color-gold: #d4a574;
    --color-deep-brown: #3d3230;

    --color-background: var(--color-cream);
    --color-surface: #ebe7dd;
    --color-text-primary: var(--color-deep-brown);
    --color-text-secondary: var(--color-taupe);
    --color-border: var(--color-sage);
    --color-accent: var(--color-gold);

    --shadow-sm: 0 1px 2px rgba(61, 50, 48, 0.08);

    --space-4: 16px;
    --space-6: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-6);
    padding: var(--space-6);
    background: var(--color-background);
  }

  .age-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    text-align: center;
  }

  .age-title {
    font-size: 24px;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .age-description {
    font-size: 12px;
    color: var(--color-text-secondary);
    font-style: italic;
    height: 18px; /* Fixed height to prevent layout shift */
  }

  .age-knob-container {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  /* Screen reader only text */
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
