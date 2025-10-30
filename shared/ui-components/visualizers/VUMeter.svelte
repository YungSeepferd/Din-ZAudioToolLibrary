<script>
  /**
   * VUMeter.svelte
   * 
   * PURPOSE:
   * Volume Unit meter showing real-time audio level with peak hold.
   * Monitors output amplitude to prevent clipping and show dynamic range.
   * 
   * EDUCATIONAL VALUE:
   * - Shows dynamic range of audio signal
   * - Teaches about clipping (when signal exceeds 0 dBFS)
   * - Demonstrates peak vs. RMS measurement
   * - Visual feedback for compression/dynamics
   * 
   * AUDIO CONCEPTS:
   * - 0 dBFS = maximum digital level (clipping point)
   * - -6 dB = healthy headroom target
   * - Peak hold = highest level reached (slow decay)
   * - RMS = Root Mean Square (average energy level)
   * 
   * USAGE:
   * <VUMeter audioContext={ctx} sourceNode={masterGain} />
   */

  import { onMount } from 'svelte';

  // ===== COMPONENT PROPS =====
  let {
    audioContext = undefined,
    sourceNode = undefined,
    orientation = 'vertical', // 'vertical' | 'horizontal'
    width = 40,
    height = 200
  } = $props();

  // ===== LOCAL STATE =====
  let canvasRef = $state(null);
  let analyser = $state(null);
  let dataArray = $state(null);
  let animationId = $state(null);
  let isActive = $state(false);

  let currentLevel = $state(0); // 0-1 range
  let peakLevel = $state(0); // 0-1 range
  let peakHoldTime = $state(0); // Time since peak

  // ===== LIFECYCLE & SETUP =====

  /**
   * Initialize analyzer when audio context and source are available
   */
  $effect(() => {
    if (!audioContext || !sourceNode) {
      cleanup();
      return;
    }

    try {
      // Create analyzer for level detection
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256; // Small FFT = fast response
      analyser.smoothingTimeConstant = 0.8;

      // Connect source → analyzer
      sourceNode.connect(analyser);

      // Allocate buffer for time-domain data (waveform)
      dataArray = new Uint8Array(analyser.frequencyBinCount);

      isActive = true;

      // Start animation loop
      draw();

      console.log(`✓ VUMeter initialized`);
    } catch (err) {
      console.error('VUMeter setup failed:', err);
      cleanup();
    }

    return cleanup;
  });

  /**
   * Animation loop: Measure audio level and update meter
   * Runs at ~60fps
   */
  function draw() {
    if (!isActive) return;

    animationId = requestAnimationFrame(draw);

    if (!analyser || !dataArray || !canvasRef) return;

    // Get time-domain data (waveform samples)
    analyser.getByteTimeDomainData(dataArray);

    // Calculate RMS (Root Mean Square) level
    let sumSquares = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const normalized = (dataArray[i] - 128) / 128; // Convert 0-255 to -1 to 1
      sumSquares += normalized * normalized;
    }
    const rms = Math.sqrt(sumSquares / dataArray.length);

    // Update current level (with smoothing)
    currentLevel = currentLevel * 0.8 + rms * 0.2;

    // Update peak hold
    if (currentLevel > peakLevel) {
      peakLevel = currentLevel;
      peakHoldTime = 0;
    } else {
      peakHoldTime += 1;
      // Decay peak slowly after 60 frames (1 second at 60fps)
      if (peakHoldTime > 60) {
        peakLevel = Math.max(0, peakLevel - 0.001);
      }
    }

    // Draw the meter
    drawMeter();
  }

  /**
   * Draw VU meter on canvas
   */
  function drawMeter() {
    const canvas = canvasRef;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Clear canvas
    ctx.fillStyle = 'var(--bg-primary)';
    ctx.fillRect(0, 0, w, h);

    if (orientation === 'vertical') {
      drawVerticalMeter(ctx, w, h);
    } else {
      drawHorizontalMeter(ctx, w, h);
    }
  }

  /**
   * Draw vertical VU meter
   */
  function drawVerticalMeter(ctx, w, h) {
    const barHeight = currentLevel * h;
    const peakY = h - (peakLevel * h);

    // Draw level bar (green → yellow → red gradient)
    const gradient = ctx.createLinearGradient(0, h, 0, 0);
    gradient.addColorStop(0, 'var(--vu-green)'); // Green (bottom)
    gradient.addColorStop(0.7, 'var(--vu-yellow)'); // Yellow (middle)
    gradient.addColorStop(1, 'var(--vu-red)'); // Red (top)

    ctx.fillStyle = gradient;
    ctx.fillRect(0, h - barHeight, w, barHeight);

    // Draw peak hold marker
    if (peakLevel > 0.05) {
      ctx.fillStyle = 'var(--accent)';
      ctx.fillRect(0, peakY - 2, w, 3);
    }

    // Draw scale markers (0, -6, -12, -24 dB)
    ctx.strokeStyle = 'var(--border-color)';
    ctx.lineWidth = 1;
    
    const markers = [
      { db: 0, y: 0 },
      { db: -6, y: h * 0.3 },
      { db: -12, y: h * 0.5 },
      { db: -24, y: h * 0.7 }
    ];

    markers.forEach(marker => {
      ctx.beginPath();
      ctx.moveTo(0, marker.y);
      ctx.lineTo(w * 0.3, marker.y);
      ctx.stroke();
    });
  }

  /**
   * Draw horizontal VU meter
   */
  function drawHorizontalMeter(ctx, w, h) {
    const barWidth = currentLevel * w;
    const peakX = peakLevel * w;

    // Draw level bar
    const gradient = ctx.createLinearGradient(0, 0, w, 0);
    gradient.addColorStop(0, 'var(--vu-green)');
    gradient.addColorStop(0.7, 'var(--vu-yellow)');
    gradient.addColorStop(1, 'var(--vu-red)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, barWidth, h);

    // Draw peak hold marker
    if (peakLevel > 0.05) {
      ctx.fillStyle = 'var(--accent)';
      ctx.fillRect(peakX - 2, 0, 3, h);
    }
  }

  /**
   * Cleanup function
   */
  function cleanup() {
    isActive = false;

    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    if (analyser && sourceNode) {
      try {
        sourceNode.disconnect(analyser);
      } catch (err) {
        // Already disconnected
      }
      analyser = null;
    }

    dataArray = null;
    currentLevel = 0;
    peakLevel = 0;
  }

  onMount(() => {
    return cleanup;
  });

  // Computed level in dB for display
  let currentDb = $derived(
    currentLevel > 0.001 
      ? Math.round(20 * Math.log10(currentLevel))
      : -60
  );

  let peakDb = $derived(
    peakLevel > 0.001
      ? Math.round(20 * Math.log10(peakLevel))
      : -60
  );
</script>

<!-- ===== TEMPLATE ===== -->
<div 
  class="vu-meter" 
  class:vertical={orientation === 'vertical'}
  class:horizontal={orientation === 'horizontal'}
  role="img" 
  aria-label="VU Meter - Audio level monitor"
>
  <!-- Canvas for meter display -->
  <canvas
    bind:this={canvasRef}
    width={width}
    height={height}
    class="vu-canvas"
  />

  <!-- Level readout -->
  <div class="level-readout">
    <div class="readout-row">
      <span class="readout-label">RMS:</span>
      <span class="readout-value" class:warn={currentDb > -6} class:danger={currentDb > -3}>
        {currentDb} dB
      </span>
    </div>
    <div class="readout-row">
      <span class="readout-label">Peak:</span>
      <span class="readout-value" class:warn={peakDb > -6} class:danger={peakDb > -3}>
        {peakDb} dB
      </span>
    </div>
  </div>
</div>

<!-- ===== STYLES - Using Design Tokens ===== -->
<style>
  .vu-meter {
    display: flex;
    background: var(--bg-secondary);
    border: var(--border-default);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-md);
  }

  .vu-meter.vertical {
    flex-direction: column;
    align-items: center;
    padding: var(--space-3);
    gap: var(--space-3);
  }

  .vu-meter.horizontal {
    flex-direction: row;
    align-items: center;
    padding: var(--space-3);
    gap: var(--space-3);
  }

  .vu-canvas {
    display: block;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-sm);
  }

  .level-readout {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    min-width: 100px;
  }

  .readout-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-2);
  }

  .readout-label {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    color: var(--text-secondary);
    font-family: var(--font-family-mono);
    letter-spacing: var(--letter-spacing-wide);
  }

  .readout-value {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-bold);
    color: var(--vu-green);
    font-family: var(--font-family-mono);
    transition: color var(--transition-fast);
  }

  .readout-value.warn {
    color: var(--vu-yellow);
  }

  .readout-value.danger {
    color: var(--vu-red);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .vu-meter.vertical {
      padding: var(--space-2);
      gap: var(--space-2);
    }

    .level-readout {
      min-width: 80px;
    }
  }
</style>
