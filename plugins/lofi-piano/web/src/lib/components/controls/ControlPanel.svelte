<script>
  /**
   * ControlPanel.svelte
   * Numbers-free, vintage-aesthetic control interface
   *
   * Redesigned for Postcard Piano aesthetic:
   * - No numeric value displays (all visual/perceptual feedback)
   * - Custom VintageKnob components instead of sliders
   * - Signature features: AGE, Room Mics, Tube Saturation
   * - Minimal layout with generous whitespace
   * - Advanced controls hidden by default
   *
   * @component
   */

  import VintageKnob from '@ui/controls/VintageKnob.svelte';
  import AGEControl from './AGEControl.svelte';
  import RoomMicsControl from './RoomMicsControl.svelte';
  import TubeSaturationControl from './TubeSaturationControl.svelte';
  import SpectrumAnalyzer from '@ui/visualizers/SpectrumAnalyzer.svelte';

  let { audioState = undefined } = $props();

  // Primary control states (numbers-free)
  let masterVolume = $state(audioState?.pianoState?.masterVolume ?? 0.5);
  let ageAmount = $state(0);
  let roomMix = $state(0.3);
  let roomDecay = $state(2);
  let saturation = $state(0);

  // Advanced controls (hidden by default)
  let showAdvanced = $state(false);

  // Advanced control states
  let attackTime = $state(audioState?.synthesis?.attackTime ?? 0.05);
  let decayTime = $state(audioState?.synthesis?.decayTime ?? 0.2);
  let sustainLevel = $state(audioState?.synthesis?.sustainLevel ?? 0.6);
  let releaseTime = $state(audioState?.synthesis?.releaseTime ?? 1.0);
  let compressionThreshold = $state(audioState?.effects?.compression?.threshold ?? -24);
  let compressionRatio = $state(audioState?.effects?.compression?.ratio ?? 4);

  // Update audio state when primary controls change
  $effect(() => {
    if (audioState) {
      audioState.setParameter('pianoState.masterVolume', masterVolume);
    }
  });

  $effect(() => {
    if (audioState) {
      audioState.setParameter('effects.saturation.amount', saturation / 100);
    }
  });

  $effect(() => {
    if (audioState) {
      audioState.setParameter('effects.reverb.dryWet', roomMix);
      audioState.setParameter('effects.reverb.decayTime', roomDecay);
    }
  });

  // Advanced control effects
  $effect(() => {
    if (audioState && showAdvanced) {
      audioState.setParameter('synthesis.attackTime', attackTime);
      audioState.setParameter('synthesis.decayTime', decayTime);
      audioState.setParameter('synthesis.sustainLevel', sustainLevel);
      audioState.setParameter('synthesis.releaseTime', releaseTime);
    }
  });

  $effect(() => {
    if (audioState && showAdvanced) {
      audioState.setParameter('effects.compression.threshold', compressionThreshold);
      audioState.setParameter('effects.compression.ratio', compressionRatio);
    }
  });

  function toggleAdvanced() {
    showAdvanced = !showAdvanced;
  }
</script>

<div class="control-panel">
  <!-- Master Volume Section -->
  <section class="control-section">
    <div class="section-header">
      <h3 class="section-title">Master Volume</h3>
    </div>

    <div class="knob-container">
      <VintageKnob
        bind:value={masterVolume}
        min={0}
        max={1}
        step={0.05}
        label="Level"
        showIntensity={true}
        ariaLabel="Master Volume"
      />
    </div>
  </section>

  <!-- Visual Feedback: Spectrum Analyzer -->
  <section class="control-section visualizer-section">
    <div class="section-header">
      <h3 class="section-title">Audio Spectrum</h3>
      <p class="section-description">Real-time frequency visualization</p>
    </div>

    <SpectrumAnalyzer 
      audioContext={audioState?.audioContext}
      sourceNode={audioState?.masterGain}
      width={600}
      height={150}
    />
  </section>

  <!-- AGE: Signature Vintage Character Feature -->
  <AGEControl bind:ageAmount={ageAmount} />

  <!-- Room Mics: Intimate Studio Ambience -->
  <RoomMicsControl bind:roomMix={roomMix} bind:roomDecay={roomDecay} />

  <!-- Tube Saturation: Warm Coloration -->
  <TubeSaturationControl bind:saturation={saturation} />

  <!-- Advanced Controls: Collapsible Section -->
  <section class="control-section advanced-section">
    <button class="advanced-toggle" onclick={toggleAdvanced}>
      <span class="toggle-label">
        {showAdvanced ? '▼' : '▶'} Advanced Controls
      </span>
    </button>

    {#if showAdvanced}
      <div class="advanced-content">
        <!-- Envelope Section -->
        <div class="subsection">
          <h4 class="subsection-title">Envelope (ADSR)</h4>

          <div class="knob-grid">
            <div class="knob-item">
              <VintageKnob
                bind:value={attackTime}
                min={0}
                max={0.5}
                step={0.01}
                label="Attack"
                ariaLabel="Attack Time"
              />
            </div>

            <div class="knob-item">
              <VintageKnob
                bind:value={decayTime}
                min={0}
                max={1}
                step={0.01}
                label="Decay"
                ariaLabel="Decay Time"
              />
            </div>

            <div class="knob-item">
              <VintageKnob
                bind:value={sustainLevel}
                min={0}
                max={1}
                step={0.05}
                label="Sustain"
                ariaLabel="Sustain Level"
              />
            </div>

            <div class="knob-item">
              <VintageKnob
                bind:value={releaseTime}
                min={0}
                max={3}
                step={0.05}
                label="Release"
                ariaLabel="Release Time"
              />
            </div>
          </div>
        </div>

        <!-- Compression Section -->
        <div class="subsection">
          <h4 class="subsection-title">Compression</h4>

          <div class="knob-grid">
            <div class="knob-item">
              <VintageKnob
                bind:value={compressionThreshold}
                min={-60}
                max={0}
                step={1}
                label="Threshold"
                ariaLabel="Compression Threshold"
              />
            </div>

            <div class="knob-item">
              <VintageKnob
                bind:value={compressionRatio}
                min={1}
                max={20}
                step={0.5}
                label="Ratio"
                ariaLabel="Compression Ratio"
              />
            </div>
          </div>
        </div>
      </div>
    {/if}
  </section>
</div>

<style>
  .control-panel {
    /* Design tokens - local scope */
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
    --shadow-md: 0 2px 4px rgba(61, 50, 48, 0.12);

    --border-radius-md: 4px;

    --space-2: 8px;
    --space-3: 12px;
    --space-4: 16px;
    --space-6: 24px;
    --space-8: 32px;
    display: flex;
    flex-direction: column;
    gap: 0;
    background: var(--color-background);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: var(--shadow-md);
  }

  .control-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    padding: var(--space-6);
    background: var(--color-background);

    /* Separator between sections */
    border-bottom: 1px solid var(--color-border);
  }

  .control-section:last-child {
    border-bottom: none;
  }

  .section-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    text-align: center;
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .section-description {
    font-size: 12px;
    font-weight: 400;
    color: var(--color-text-secondary);
    margin: 0;
    font-style: italic;
  }

  /* Visualizer Section */
  .visualizer-section {
    background: var(--color-surface);
  }

  .knob-container {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  /* Advanced Controls Section */
  .advanced-section {
    gap: 0;
    padding: 0;
    border-top: 2px solid var(--color-border);
  }

  .advanced-toggle {
    /* Reset button styling */
    background: none;
    border: none;
    padding: var(--space-6);
    margin: 0;
    cursor: pointer;
    width: 100%;
    text-align: left;

    /* Typography */
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
    text-transform: uppercase;
    letter-spacing: 0.5px;

    /* Hover state */
    transition: background 0.2s ease-out;
    background: var(--color-surface);
  }

  .advanced-toggle:hover {
    background: #e0dbd0;
  }

  .advanced-toggle:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: -2px;
  }

  .toggle-label {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .advanced-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    padding: var(--space-6);
    background: var(--color-surface);
    animation: slideDown 0.2s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .subsection {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .subsection:not(:last-child) {
    padding-bottom: var(--space-4);
    border-bottom: 1px solid var(--color-border);
  }

  .subsection-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--color-text-secondary);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-align: center;
  }

  .knob-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: var(--space-4);
    justify-items: center;
  }

  .knob-item {
    display: flex;
    justify-content: center;
  }
</style>
