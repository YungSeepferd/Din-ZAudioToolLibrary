<script>
  /**
   * ControlPanel Component
   *
   * UI controls for audio parameters including:
   * - Volume control
   * - Saturation amount and tone
   * - Compression threshold, ratio, attack, release
   * - Reverb decay time and room size
   * - Envelope controls
   *
   * @component
   */

  /** @type {Object} Audio state manager */
  export let audioState = undefined;

  let showAdvanced = false;

  /**
   * Format parameter value for display
   *
   * @private
   * @param {number} value - Parameter value
   * @param {string} type - Parameter type
   * @returns {string} Formatted value
   */
  function formatValue(value, type) {
    switch (type) {
      case 'percentage':
        return `${Math.round(value * 100)}%`;
      case 'db':
        return `${value.toFixed(1)} dB`;
      case 'time':
        return `${(value * 1000).toFixed(0)} ms`;
      case 'ratio':
        return `${value.toFixed(1)}:1`;
      case 'frequency':
        return `${Math.round(value)} Hz`;
      default:
        return value.toFixed(2);
    }
  }

  /**
   * Handle parameter change with audio state sync
   *
   * @private
   * @param {string} path - Parameter path
   * @param {number} value - New value
   */
  function handleParameterChange(path, value) {
    if (audioState) {
      audioState.setParameter(path, value);
    }
  }
</script>

<div class="control-panel">
  <!-- Master Volume Section -->
  <section class="control-section">
    <h3 class="section-title">🔊 Master</h3>

    <div class="control-group">
      <label for="master-volume" class="control-label">
        Volume
        <span class="value-display">
          {formatValue(audioState?.pianoState?.masterVolume ?? 0.5, 'percentage')}
        </span>
      </label>
      <input
        id="master-volume"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={audioState?.pianoState?.masterVolume ?? 0.5}
        on:input={(e) => handleParameterChange('pianoState.masterVolume', parseFloat(e.target.value))}
        class="slider"
      />
    </div>
  </section>

  <!-- Envelope Section -->
  <section class="control-section">
    <h3 class="section-title">📈 Envelope (ADSR)</h3>

    <div class="control-group">
      <label for="attack" class="control-label">
        Attack
        <span class="value-display">
          {formatValue(audioState?.synthesis?.attackTime ?? 0.05, 'time')}
        </span>
      </label>
      <input
        id="attack"
        type="range"
        min="0"
        max="0.5"
        step="0.01"
        value={audioState?.synthesis?.attackTime ?? 0.05}
        on:input={(e) => handleParameterChange('synthesis.attackTime', parseFloat(e.target.value))}
        class="slider"
      />
    </div>

    <div class="control-group">
      <label for="decay" class="control-label">
        Decay
        <span class="value-display">
          {formatValue(audioState?.synthesis?.decayTime ?? 0.2, 'time')}
        </span>
      </label>
      <input
        id="decay"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={audioState?.synthesis?.decayTime ?? 0.2}
        on:input={(e) => handleParameterChange('synthesis.decayTime', parseFloat(e.target.value))}
        class="slider"
      />
    </div>

    <div class="control-group">
      <label for="sustain" class="control-label">
        Sustain
        <span class="value-display">
          {formatValue(audioState?.synthesis?.sustainLevel ?? 0.6, 'percentage')}
        </span>
      </label>
      <input
        id="sustain"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={audioState?.synthesis?.sustainLevel ?? 0.6}
        on:input={(e) => handleParameterChange('synthesis.sustainLevel', parseFloat(e.target.value))}
        class="slider"
      />
    </div>

    <div class="control-group">
      <label for="release" class="control-label">
        Release
        <span class="value-display">
          {formatValue(audioState?.synthesis?.releaseTime ?? 1.0, 'time')}
        </span>
      </label>
      <input
        id="release"
        type="range"
        min="0"
        max="3"
        step="0.05"
        value={audioState?.synthesis?.releaseTime ?? 1.0}
        on:input={(e) => handleParameterChange('synthesis.releaseTime', parseFloat(e.target.value))}
        class="slider"
      />
    </div>
  </section>

  <!-- Saturation Section -->
  <section class="control-section">
    <h3 class="section-title">🔥 Saturation (Tape Warmth)</h3>

    <div class="control-group">
      <label for="saturation-amount" class="control-label">
        Amount
        <span class="value-display">
          {formatValue(audioState?.effects?.saturation?.amount ?? 0.3, 'percentage')}
        </span>
      </label>
      <input
        id="saturation-amount"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={audioState?.effects?.saturation?.amount ?? 0.3}
        on:input={(e) => handleParameterChange('effects.saturation.amount', parseFloat(e.target.value))}
        class="slider"
      />
    </div>

    <div class="control-group">
      <label for="saturation-tone" class="control-label">
        Tone (Dark ← → Bright)
        <span class="value-display">
          {Math.round((audioState?.effects?.saturation?.tone ?? 0.5) * 100)}%
        </span>
      </label>
      <input
        id="saturation-tone"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={audioState?.effects?.saturation?.tone ?? 0.5}
        on:input={(e) => handleParameterChange('effects.saturation.tone', parseFloat(e.target.value))}
        class="slider"
      />
    </div>
  </section>

  <!-- Compression Section -->
  <section class="control-section">
    <h3 class="section-title">📉 Compression (Dynamics Control)</h3>

    <div class="control-group">
      <label for="compression-threshold" class="control-label">
        Threshold
        <span class="value-display">
          {formatValue(audioState?.effects?.compression?.threshold ?? -24, 'db')}
        </span>
      </label>
      <input
        id="compression-threshold"
        type="range"
        min="-60"
        max="0"
        step="1"
        value={audioState?.effects?.compression?.threshold ?? -24}
        on:input={(e) => handleParameterChange('effects.compression.threshold', parseFloat(e.target.value))}
        class="slider"
      />
    </div>

    <div class="control-group">
      <label for="compression-ratio" class="control-label">
        Ratio
        <span class="value-display">
          {formatValue(audioState?.effects?.compression?.ratio ?? 4, 'ratio')}
        </span>
      </label>
      <input
        id="compression-ratio"
        type="range"
        min="1"
        max="20"
        step="0.1"
        value={audioState?.effects?.compression?.ratio ?? 4}
        on:input={(e) => handleParameterChange('effects.compression.ratio', parseFloat(e.target.value))}
        class="slider"
      />
    </div>

    <div class="control-group">
      <label for="compression-attack" class="control-label">
        Attack
        <span class="value-display">
          {formatValue(audioState?.effects?.compression?.attack ?? 0.003, 'time')}
        </span>
      </label>
      <input
        id="compression-attack"
        type="range"
        min="0.001"
        max="0.1"
        step="0.001"
        value={audioState?.effects?.compression?.attack ?? 0.003}
        on:input={(e) => handleParameterChange('effects.compression.attack', parseFloat(e.target.value))}
        class="slider"
      />
    </div>

    <div class="control-group">
      <label for="compression-release" class="control-label">
        Release
        <span class="value-display">
          {formatValue(audioState?.effects?.compression?.release ?? 0.25, 'time')}
        </span>
      </label>
      <input
        id="compression-release"
        type="range"
        min="0.01"
        max="2"
        step="0.01"
        value={audioState?.effects?.compression?.release ?? 0.25}
        on:input={(e) => handleParameterChange('effects.compression.release', parseFloat(e.target.value))}
        class="slider"
      />
    </div>
  </section>

  <!-- Reverb Section -->
  <section class="control-section">
    <h3 class="section-title">🌊 Reverb (Space & Ambience)</h3>

    <div class="control-group">
      <label for="reverb-decay" class="control-label">
        Decay Time
        <span class="value-display">
          {formatValue(audioState?.effects?.reverb?.decayTime ?? 2.0, 'time')}
        </span>
      </label>
      <input
        id="reverb-decay"
        type="range"
        min="0.1"
        max="10"
        step="0.1"
        value={audioState?.effects?.reverb?.decayTime ?? 2.0}
        on:input={(e) => handleParameterChange('effects.reverb.decayTime', parseFloat(e.target.value))}
        class="slider"
      />
    </div>

    <div class="control-group">
      <label for="reverb-room" class="control-label">
        Room Size (Small ← → Large)
        <span class="value-display">
          {formatValue(audioState?.effects?.reverb?.roomSize ?? 0.5, 'percentage')}
        </span>
      </label>
      <input
        id="reverb-room"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={audioState?.effects?.reverb?.roomSize ?? 0.5}
        on:input={(e) => handleParameterChange('effects.reverb.roomSize', parseFloat(e.target.value))}
        class="slider"
      />
    </div>

    <div class="control-group">
      <label for="reverb-wet" class="control-label">
        Wet Level
        <span class="value-display">
          {formatValue(audioState?.effects?.reverb?.dryWet ?? 0.3, 'percentage')}
        </span>
      </label>
      <input
        id="reverb-wet"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={audioState?.effects?.reverb?.dryWet ?? 0.3}
        on:input={(e) => handleParameterChange('effects.reverb.dryWet', parseFloat(e.target.value))}
        class="slider"
      />
    </div>
  </section>

  <!-- Advanced Toggle -->
  <div class="advanced-toggle">
    <button
      class="toggle-btn"
      on:click={() => (showAdvanced = !showAdvanced)}
      aria-expanded={showAdvanced}
    >
      {showAdvanced ? '▼ Hide Advanced' : '▶ Show Advanced'}
    </button>
  </div>

  {#if showAdvanced}
    <section class="control-section advanced">
      <h3 class="section-title">🔧 Advanced</h3>

      <div class="control-group">
        <label for="pre-delay" class="control-label">
          Reverb Pre-Delay
          <span class="value-display">
            {formatValue(audioState?.effects?.reverb?.preDelay ?? 0.02, 'time')}
          </span>
        </label>
        <input
          id="pre-delay"
          type="range"
          min="0"
          max="0.2"
          step="0.005"
          value={audioState?.effects?.reverb?.preDelay ?? 0.02}
          on:input={(e) => handleParameterChange('effects.reverb.preDelay', parseFloat(e.target.value))}
          class="slider"
        />
      </div>

      <div class="info-box">
        <p>
          <strong>Audio State:</strong>
          {audioState?.pianoState?.isInitialized ? '✓ Initialized' : '✗ Not initialized'}
        </p>
        <p>
          <strong>Active Notes:</strong>
          {audioState?.pianoState?.activeNotes?.size ?? 0}
        </p>
      </div>
    </section>
  {/if}
</div>

<style>
  .control-panel {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, var(--primary-bg) 0%, var(--surface-bg) 100%);
    border-radius: var(--border-radius-lg);
    border: 1px solid rgba(96, 165, 250, 0.1);
  }

  .control-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    background: rgba(15, 23, 42, 0.4);
    border-radius: var(--border-radius-md);
    border: 1px solid rgba(96, 165, 250, 0.05);
  }

  .control-section.advanced {
    background: rgba(251, 146, 60, 0.05);
    border-color: rgba(251, 146, 60, 0.2);
  }

  .section-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .control-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .value-display {
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 0.8rem;
    color: var(--accent);
    font-weight: 500;
    background: rgba(96, 165, 250, 0.1);
    padding: 0.25rem 0.5rem;
    border-radius: var(--border-radius-sm);
  }

  .slider {
    width: 100%;
    height: 6px;
    border-radius: var(--border-radius-sm);
    background: linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e, #06b6d4);
    outline: none;
    -webkit-appearance: none;
    appearance: none;
    cursor: pointer;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(96, 165, 250, 0.4);
    transition: all 0.2s ease;
    border: 2px solid var(--primary-bg);
  }

  .slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 4px 12px rgba(96, 165, 250, 0.6);
  }

  .slider::-webkit-slider-thumb:active {
    transform: scale(1.1);
  }

  .slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(96, 165, 250, 0.4);
    transition: all 0.2s ease;
    border: 2px solid var(--primary-bg);
  }

  .slider::-moz-range-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 4px 12px rgba(96, 165, 250, 0.6);
  }

  .slider::-moz-range-track {
    background: transparent;
    border: none;
  }

  .advanced-toggle {
    display: flex;
    justify-content: center;
    padding-top: 0.5rem;
  }

  .toggle-btn {
    padding: 0.5rem 1rem;
    background: rgba(96, 165, 250, 0.1);
    color: var(--accent);
    border: 1px solid rgba(96, 165, 250, 0.3);
    border-radius: var(--border-radius-sm);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .toggle-btn:hover {
    background: rgba(96, 165, 250, 0.2);
    border-color: rgba(96, 165, 250, 0.5);
  }

  .toggle-btn:active {
    transform: scale(0.98);
  }

  .info-box {
    margin-top: 1rem;
    padding: 1rem;
    background: rgba(96, 165, 250, 0.05);
    border-left: 3px solid var(--accent);
    border-radius: var(--border-radius-sm);
  }

  .info-box p {
    margin: 0.25rem 0;
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .info-box strong {
    color: var(--text-primary);
    font-weight: 600;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .control-panel {
      padding: 1rem;
      gap: 1rem;
    }

    .control-section {
      padding: 0.75rem;
      gap: 0.75rem;
    }

    .section-title {
      font-size: 0.9rem;
    }

    .control-label {
      font-size: 0.8rem;
    }
  }
</style>
