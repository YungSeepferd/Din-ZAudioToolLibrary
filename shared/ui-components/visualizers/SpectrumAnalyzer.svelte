<script>
  /**
   * SpectrumAnalyzer.svelte
   * 
   * PURPOSE:
   * Real-time frequency spectrum visualization using Web Audio API AnalyserNode.
   * Shows the frequency content of audio in real-time with a vintage aesthetic.
   * 
   * EDUCATIONAL VALUE:
   * - Teaches frequency domain representation (FFT)
   * - Shows how different notes occupy different frequency ranges
   * - Demonstrates effect of saturation (harmonic generation)
   * - Visualizes low-pass/high-pass filtering effects
   * 
   * WEB AUDIO CONCEPTS:
   * - AnalyserNode: Provides FFT analysis of audio signal
   * - FFT Size: 2048 samples = good frequency resolution
   * - Smoothing: 0.8 = smooth transitions, less jumpy
   * - FrequencyBinCount: fftSize/2 = number of frequency buckets
   * 
   * USAGE:
   * <SpectrumAnalyzer audioContext={ctx} sourceNode={masterGain} />
   */

  import { onMount } from 'svelte';

  // ===== COMPONENT PROPS =====
  let {
    audioContext = undefined,
    sourceNode = undefined,
    width = 600,
    height = 150,
    fftSize = 2048,
    smoothing = 0.8
  } = $props();

  // ===== LOCAL STATE =====
  let canvasRef = $state(null);
  let analyser = $state(null);
  let dataArray = $state(null);
  let animationId = $state(null);
  let isActive = $state(false);

  // ===== LIFECYCLE & SETUP =====

  /**
   * Initialize analyzer when audio context and source are available
   * Creates AnalyserNode and connects it to the audio graph
   */
  $effect(() => {
    if (!audioContext || !sourceNode) {
      cleanup();
      return;
    }

    try {
      // Create and configure analyzer node
      analyser = audioContext.createAnalyser();
      analyser.fftSize = fftSize;
      analyser.smoothingTimeConstant = smoothing;

      // Connect source → analyzer (analyzer doesn't affect audio output)
      sourceNode.connect(analyser);

      // Allocate frequency data buffer
      // frequencyBinCount = fftSize / 2
      dataArray = new Uint8Array(analyser.frequencyBinCount);

      isActive = true;

      // Start animation loop
      draw();

      console.log(`✓ SpectrumAnalyzer initialized: ${analyser.frequencyBinCount} bins`);
    } catch (err) {
      console.error('SpectrumAnalyzer setup failed:', err);
      cleanup();
    }

    // Cleanup on unmount or when dependencies change
    return cleanup;
  });

  /**
   * Animation loop: Read frequency data and draw bars
   * Runs at ~60fps using requestAnimationFrame
   */
  function draw() {
    if (!isActive) return;

    animationId = requestAnimationFrame(draw);

    if (!analyser || !dataArray || !canvasRef) return;

    // Get current frequency data (0-255 values)
    analyser.getByteFrequencyData(dataArray);

    const canvas = canvasRef;
    const ctx = canvas.getContext('2d');
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Clear canvas with cream background
    ctx.fillStyle = 'var(--bg-primary)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw frequency bars
    // Only show first 40% of bins (most relevant frequencies for music)
    const binCount = Math.floor(dataArray.length * 0.4);
    const barWidth = (canvasWidth / binCount) * 0.9; // 90% width = small gaps
    const barGap = (canvasWidth / binCount) * 0.1;

    for (let i = 0; i < binCount; i++) {
      const amplitude = dataArray[i];
      const normalizedAmplitude = amplitude / 255;
      const barHeight = normalizedAmplitude * canvasHeight;

      // X position for this bar
      const x = i * (barWidth + barGap);

      // Y position (draw from bottom up)
      const y = canvasHeight - barHeight;

      // Gold gradient - more opaque when louder
      const alpha = Math.max(0.3, normalizedAmplitude); // minimum 30% opacity
      ctx.fillStyle = `rgba(212, 165, 116, ${alpha})`; // var(--accent) with alpha

      // Draw rounded rectangle
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 2);
      ctx.fill();
    }
  }

  /**
   * Cleanup function
   * Stops animation and disconnects audio nodes
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
        // Node might already be disconnected
      }
      analyser = null;
    }

    dataArray = null;
  }

  // Ensure cleanup on component unmount
  onMount(() => {
    return cleanup;
  });
</script>

<!-- ===== TEMPLATE ===== -->
<div class="spectrum-analyzer" role="img" aria-label="Audio frequency spectrum visualization">
  <!-- Canvas for drawing spectrum -->
  <canvas
    bind:this={canvasRef}
    width={width}
    height={height}
    class="spectrum-canvas"
  ></canvas>

  <!-- Frequency labels for educational value -->
  <div class="frequency-labels">
    <span class="label">20 Hz</span>
    <span class="label">1 kHz</span>
    <span class="label">20 kHz</span>
  </div>

  <!-- Educational info -->
  <div class="spectrum-info">
    <span class="info-text">
      {#if isActive}
        <span class="status-dot active"></span>
        Live Spectrum
      {:else}
        <span class="status-dot"></span>
        Waiting for audio...
      {/if}
    </span>
  </div>
</div>

<!-- ===== STYLES - Using Design Tokens ===== -->
<style>
  .spectrum-analyzer {
    display: flex;
    flex-direction: column;
    background: var(--bg-secondary);
    border: var(--border-default);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-md);
  }

  .spectrum-canvas {
    display: block;
    width: 100%;
    height: auto;
    background: var(--bg-primary);
  }

  .frequency-labels {
    display: flex;
    justify-content: space-between;
    padding: var(--space-2) var(--space-4);
    background: var(--bg-elevated);
    border-top: 1px solid var(--border-color);
  }

  .label {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    color: var(--text-secondary);
    font-family: var(--font-family-mono);
    letter-spacing: var(--letter-spacing-wide);
  }

  .spectrum-info {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: var(--space-2) var(--space-4);
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-color);
  }

  .info-text {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    color: var(--text-secondary);
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: var(--border-radius-full);
    background: var(--color-taupe);
  }

  .status-dot.active {
    background: var(--color-success);
    box-shadow: 0 0 8px rgba(143, 168, 154, 0.5);
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .spectrum-canvas {
      height: 100px;
    }

    .label {
      font-size: var(--font-size-xs);
    }
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .status-dot.active {
      animation: none;
    }
  }
</style>
