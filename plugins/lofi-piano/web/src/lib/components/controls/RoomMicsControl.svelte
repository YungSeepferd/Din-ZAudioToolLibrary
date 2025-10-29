<script>
  /**
   * RoomMicsControl.svelte
   * Intimate studio ambience controls - Postcard Piano's room character feature
   *
   * Controls the balance between close-miked dry signal and ambient room reverb
   * without exposing numeric parameters. Users hear the effect, not numbers.
   *
   * Features:
   * - Mix: Balance between dry and room ambience (0% = dry, 100% = ambient)
   * - Decay: How long room reverb sustains (perceptual, not quantitative)
   *
   * Usage:
   * <RoomMicsControl
   *   bind:roomMix={roomMix}
   *   bind:roomDecay={roomDecay}
   * />
   */

  import VintageKnob from '@ui/controls/VintageKnob.svelte';

  let { roomMix = $bindable(0.3), roomDecay = $bindable(2) } = $props();

  // Derived perceptual descriptions (no numbers shown)
  let mixCharacter = $derived.by(() => {
    if (roomMix === 0) return 'Dry (no room)';
    if (roomMix < 0.2) return 'Close (intimate)';
    if (roomMix < 0.4) return 'Balanced';
    if (roomMix < 0.7) return 'Ambient';
    return 'Lush (full room)';
  });

  let decayCharacter = $derived.by(() => {
    if (roomDecay < 1) return 'Short (tight)';
    if (roomDecay < 2) return 'Medium (natural)';
    if (roomDecay < 3.5) return 'Long (spacious)';
    return 'Very long (cathedral)';
  });

  // Visual intensity for arc indicators
  let mixIntensity = $derived(roomMix);
  let decayIntensity = $derived(Math.min(roomDecay / 5, 1)); // Normalize to 0-1

  // Effects are applied when values change
  // Parent component or audio state should listen for these changes
  $effect(() => {
    // Update reverb mix when roomMix changes
    // Example: audioState.updateRoomMix(roomMix)
  });

  $effect(() => {
    // Update reverb decay when roomDecay changes
    // Example: audioState.updateRoomDecay(roomDecay)
  });
</script>

<div class="room-section">
  <div class="room-header">
    <h3 class="room-title">Room Mics</h3>
    <div class="room-subtitle">Ambient Studio Character</div>
  </div>

  <div class="room-controls">
    <!-- Mix Control -->
    <div class="control-group">
      <VintageKnob
        bind:value={roomMix}
        min={0}
        max={1}
        step={0.05}
        label="Mix"
        showIntensity={true}
        ariaLabel="Room Microphone Mix"
        ariaDescribedBy="mix-help"
      />
      <div class="control-info">{mixCharacter}</div>
    </div>

    <!-- Decay Control -->
    <div class="control-group">
      <VintageKnob
        bind:value={roomDecay}
        min={0.5}
        max={5}
        step={0.1}
        label="Decay"
        showIntensity={true}
        ariaLabel="Room Reverb Decay Time"
        ariaDescribedBy="decay-help"
      />
      <div class="control-info">{decayCharacter}</div>
    </div>
  </div>

  <!-- Accessibility help text -->
  <div class="sr-only" id="mix-help">
    Adjust the balance between dry close-miked signal and ambient room reverb. Left is dry, right is full room.
  </div>
  <div class="sr-only" id="decay-help">
    Adjust how long the room reverb sustains. Left is short and tight, right is long and spacious.
  </div>
</div>

<style>
  .room-section {
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

    --space-2: 8px;
    --space-4: 16px;
    --space-6: 24px;
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    padding: var(--space-6);
    background: var(--color-background);
    border-top: 1px solid var(--color-border);
  }

  .room-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    text-align: center;
  }

  .room-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .room-subtitle {
    font-size: 11px;
    color: var(--color-text-secondary);
    font-style: italic;
    letter-spacing: 0.5px;
  }

  .room-controls {
    display: flex;
    gap: var(--space-6);
    justify-content: center;
    flex-wrap: wrap;
  }

  .control-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
  }

  .control-info {
    font-size: 11px;
    color: var(--color-text-secondary);
    font-style: italic;
    text-align: center;
    height: 14px; /* Fixed height to prevent layout shift */
    min-width: 100px;
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
