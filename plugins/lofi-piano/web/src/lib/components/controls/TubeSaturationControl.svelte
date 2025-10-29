<script>
  /**
   * TubeSaturationControl.svelte
   * Warm coloration effect simulating analog tube amplifier distortion
   *
   * This effect adds progressive harmonic richness and warmth without digital harshness.
   * It combines:
   * - Subtle harmonic distortion (even and odd harmonics)
   * - Gentle frequency shaping (slight low-end boost, high-end softening)
   * - Output compensation (maintains volume as saturation increases)
   *
   * Numbers-free design: users feel the warmth, not the parameters.
   *
   * Usage:
   * <TubeSaturationControl bind:saturation={saturation} />
   */

  import VintageKnob from '@ui/controls/VintageKnob.svelte';

  let { saturation = $bindable(0) } = $props();

  // Derived parameters for audio processing
  let driveAmount = $derived(saturation / 100);
  let outputCompensation = $derived(1 - (saturation / 100) * 0.2); // Slight output reduction
  let harmonicContent = $derived(Math.min(saturation * 2, 100)); // Visual indicator

  // Perceptual description (no numbers shown to user)
  let saturationCharacter = $derived.by(() => {
    if (saturation === 0) return 'Clean (pristine)';
    if (saturation < 20) return 'Subtle warmth';
    if (saturation < 40) return 'Warm glow';
    if (saturation < 60) return 'Rich saturation';
    if (saturation < 80) return 'Heavy warmth';
    return 'Intense coloration';
  });

  // Effect on audio is applied when saturation changes
  $effect(() => {
    // This triggers when saturation changes
    // Parent component or audio state should listen for this effect
    // Example: audioState.updateTubeSaturation({ drive, output })
  });
</script>

<div class="saturation-section">
  <div class="saturation-header">
    <h3 class="saturation-title">Tube Saturation</h3>
    <div class="saturation-description">{saturationCharacter}</div>
  </div>

  <div class="saturation-knob-container">
    <VintageKnob
      bind:value={saturation}
      min={0}
      max={100}
      step={1}
      label="Warmth"
      showIntensity={true}
      ariaLabel="Tube Saturation - Warmth"
      ariaDescribedBy="saturation-help"
    />
  </div>

  <!-- Optional: Visual harmonic indicator (no numbers!) -->
  {#if saturation > 0}
    <div class="harmonic-indicator">
      <div class="harmonic-bar" style="width: {harmonicContent}%;"></div>
    </div>
  {/if}

  <!-- Accessibility help text -->
  <div class="sr-only" id="saturation-help">
    Adjust tube saturation for warmth and harmonic richness. Increases from clean to heavily saturated.
  </div>
</div>

<style>
  .saturation-section {
    /* Design tokens */
    --color-cream: #f5f1e8;
    --color-taupe: #8b8680;
    --color-sage: #9ca89a;
    --color-warm-brown: #6b5b52;
    --color-gold: #d4a574;
    --color-accent-dark: #b8935f;
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
    border-top: 1px solid var(--color-border);
  }

  .saturation-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    text-align: center;
  }

  .saturation-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .saturation-description {
    font-size: 12px;
    color: var(--color-text-secondary);
    font-style: italic;
    height: 18px; /* Fixed height to prevent layout shift */
  }

  .saturation-knob-container {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  /* Visual harmonic indicator - shows intensity without numbers */
  .harmonic-indicator {
    width: 120px;
    height: 4px;
    background: var(--color-surface);
    border-radius: 2px;
    overflow: hidden;
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-sm);
  }

  .harmonic-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--color-accent), var(--color-accent-dark));
    width: 0%;
    transition: width 0.1s ease-out;
    border-radius: 2px;
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
