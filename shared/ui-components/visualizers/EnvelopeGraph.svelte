<script>
  /**
   * EnvelopeGraph.svelte
   * 
   * PURPOSE:
   * Visualizes ADSR (Attack, Decay, Sustain, Release) envelope shape using SVG.
   * Updates in real-time as user adjusts envelope parameters.
   * 
   * EDUCATIONAL VALUE:
   * - Shows how ADSR shapes sound amplitude over time
   * - Demonstrates relationship between envelope phases
   * - Teaches attack = note onset, release = note end
   * - Visualizes why fast attack = percussive, slow attack = soft
   * 
   * AUDIO CONCEPTS:
   * - Attack: Time to reach peak amplitude (0-peak)
   * - Decay: Time to fall from peak to sustain level
   * - Sustain: Held amplitude level during note
   * - Release: Time to fade to silence after note off
   * 
   * USAGE:
   * <EnvelopeGraph attack={0.05} decay={0.2} sustain={0.7} release={1.0} />
   */

  // ===== COMPONENT PROPS =====
  let {
    attack = 0.05,
    decay = 0.2,
    sustain = 0.7,
    release = 1.0,
    width = 300,
    height = 120
  } = $props();

  // ===== DERIVED STATE =====

  /**
   * Calculate SVG path for ADSR envelope
   * Updates reactively when any parameter changes
   */
  let envelopePath = $derived.by(() => {
    const padding = 10;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;

    // Calculate time proportions
    // Show sustain as fixed 200ms segment for visualization
    const totalTime = attack + decay + 0.2 + release;
    
    // X coordinates for each phase
    const attackX = (attack / totalTime) * graphWidth;
    const decayX = attackX + (decay / totalTime) * graphWidth;
    const sustainX = decayX + (0.2 / totalTime) * graphWidth;
    const releaseX = graphWidth;

    // Y coordinates (inverted because SVG Y increases downward)
    const peakY = padding; // Top of graph
    const sustainY = padding + (1 - sustain) * graphHeight;
    const silenceY = padding + graphHeight; // Bottom of graph

    // Build SVG path string
    // M = moveto, L = lineto
    return `
      M ${padding} ${silenceY}
      L ${padding + attackX} ${peakY}
      L ${padding + decayX} ${sustainY}
      L ${padding + sustainX} ${sustainY}
      L ${padding + releaseX} ${silenceY}
    `.trim();
  });

  /**
   * Grid lines for visual reference
   */
  let gridLines = $derived.by(() => {
    const padding = 10;
    const graphHeight = height - 2 * padding;
    
    return [
      { y: padding + graphHeight * 0.25, label: '75%' },
      { y: padding + graphHeight * 0.5, label: '50%' },
      { y: padding + graphHeight * 0.75, label: '25%' }
    ];
  });

  /**
   * Phase markers for educational labels
   */
  let phaseMarkers = $derived.by(() => {
    const padding = 10;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;
    const totalTime = attack + decay + 0.2 + release;

    const attackX = (attack / totalTime) * graphWidth;
    const decayX = attackX + (decay / totalTime) * graphWidth;
    const sustainX = decayX + (0.2 / totalTime) * graphWidth;

    return [
      { 
        x: padding + attackX / 2, 
        y: height - 5, 
        label: 'A',
        title: `Attack: ${(attack * 1000).toFixed(0)}ms`
      },
      { 
        x: padding + attackX + (decayX - attackX) / 2, 
        y: height - 5, 
        label: 'D',
        title: `Decay: ${(decay * 1000).toFixed(0)}ms`
      },
      { 
        x: padding + decayX + (sustainX - decayX) / 2, 
        y: height - 5, 
        label: 'S',
        title: `Sustain: ${(sustain * 100).toFixed(0)}%`
      },
      { 
        x: padding + sustainX + (graphWidth - sustainX) / 2, 
        y: height - 5, 
        label: 'R',
        title: `Release: ${(release * 1000).toFixed(0)}ms`
      }
    ];
  });
</script>

<!-- ===== TEMPLATE ===== -->
<div class="envelope-graph" role="img" aria-label="ADSR Envelope visualization">
  <!-- SVG for envelope path -->
  <svg
    viewBox="0 0 {width} {height}"
    class="envelope-svg"
    aria-hidden="true"
  >
    <!-- Background -->
    <rect
      x="0"
      y="0"
      width={width}
      height={height}
      fill="var(--bg-primary)"
    />

    <!-- Grid lines -->
    {#each gridLines as line}
      <line
        x1="10"
        y1={line.y}
        x2={width - 10}
        y2={line.y}
        stroke="var(--border-color)"
        stroke-width="1"
        stroke-dasharray="2,2"
        opacity="0.3"
      />
      <text
        x="15"
        y={line.y - 2}
        font-size="8"
        fill="var(--text-muted)"
        font-family="var(--font-family-mono)"
      >
        {line.label}
      </text>
    {/each}

    <!-- Envelope path -->
    <path
      d={envelopePath}
      fill="none"
      stroke="var(--accent)"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- Fill area under curve for emphasis -->
    <path
      d="{envelopePath} L {width - 10} {height - 10} L 10 {height - 10} Z"
      fill="var(--accent)"
      opacity="0.2"
    />

    <!-- Phase markers (A, D, S, R labels) -->
    {#each phaseMarkers as marker}
      <text
        x={marker.x}
        y={marker.y}
        text-anchor="middle"
        font-size="10"
        font-weight="600"
        fill="var(--text-primary)"
        font-family="var(--font-family-mono)"
      >
        <title>{marker.title}</title>
        {marker.label}
      </text>
    {/each}
  </svg>

  <!-- Educational info -->
  <div class="envelope-info">
    <div class="info-row">
      <span class="info-label">Attack:</span>
      <span class="info-value">{(attack * 1000).toFixed(0)}ms</span>
    </div>
    <div class="info-row">
      <span class="info-label">Decay:</span>
      <span class="info-value">{(decay * 1000).toFixed(0)}ms</span>
    </div>
    <div class="info-row">
      <span class="info-label">Sustain:</span>
      <span class="info-value">{(sustain * 100).toFixed(0)}%</span>
    </div>
    <div class="info-row">
      <span class="info-label">Release:</span>
      <span class="info-value">{(release * 1000).toFixed(0)}ms</span>
    </div>
  </div>
</div>

<!-- ===== STYLES - Using Design Tokens ===== -->
<style>
  .envelope-graph {
    display: flex;
    flex-direction: column;
    background: var(--bg-secondary);
    border: var(--border-default);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-md);
  }

  .envelope-svg {
    display: block;
    width: 100%;
    height: auto;
  }

  .envelope-info {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    background: var(--bg-elevated);
    border-top: 1px solid var(--border-color);
  }

  .info-row {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
  }

  .info-label {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    color: var(--text-secondary);
    font-family: var(--font-family-mono);
    letter-spacing: var(--letter-spacing-wide);
    text-transform: uppercase;
  }

  .info-value {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-bold);
    color: var(--accent);
    font-family: var(--font-family-mono);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .envelope-info {
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-3);
    }
  }
</style>
