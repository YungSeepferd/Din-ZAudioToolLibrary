# Phases 4-8: Detailed Educational Implementation Guide

**Focus**: Building intuitive, high-fidelity audio UI while learning Svelte + Web Audio API

---

## 🎨 Phase 4: Unified Design System (Days 1-3)

### Goal
Create single, cohesive vintage aesthetic across ALL components (Piano, Chord Generator, Controls)

### Step 1: Global Design Tokens (30min)

**Create**: `plugins/lofi-piano/web/src/styles/tokens.css`

```css
:root {
  /* === COLOR SYSTEM (Vintage Aesthetic) === */
  --color-cream: #f5f1e8;
  --color-surface: #ebe7dd;
  --color-taupe: #8b8680;
  --color-sage: #9ca89a;
  --color-warm-brown: #6b5b52;
  --color-gold: #d4a574;
  --color-gold-dark: #b8935f;
  --color-deep-brown: #3d3230;
  
  /* Semantic Colors */
  --bg-primary: var(--color-cream);
  --bg-secondary: var(--color-surface);
  --text-primary: var(--color-deep-brown);
  --text-secondary: var(--color-taupe);
  --border-color: var(--color-sage);
  --accent: var(--color-gold);
  --accent-hover: var(--color-gold-dark);
  
  /* === TYPOGRAPHY === */
  --font-family: 'Courier Prime', 'Courier New', monospace;
  --font-size-xs: 10px;
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 18px;
  --font-size-2xl: 24px;
  
  /* === SPACING (4px base unit) === */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  
  /* === BORDERS & SHADOWS === */
  --border-radius-sm: 2px;
  --border-radius-md: 4px;
  --border-radius-lg: 6px;
  --border-width: 1px;
  
  --shadow-sm: 0 1px 2px rgba(61, 50, 48, 0.08);
  --shadow-md: 0 2px 4px rgba(61, 50, 48, 0.12);
  --shadow-lg: 0 4px 8px rgba(61, 50, 48, 0.16);
  
  /* === TRANSITIONS === */
  --transition-fast: 100ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
}
```

**Import in**: `plugins/lofi-piano/web/src/app.html`

```html
<head>
  <link rel="stylesheet" href="/src/styles/tokens.css">
</head>
```

### Step 2: Refactor Layout.svelte (2 hours)

**Before** (Dark Theme):
```svelte
<style>
  main {
    background: rgba(30, 41, 59, 0.8);
    color: #f1f5f9;
  }
</style>
```

**After** (Vintage Theme):
```svelte
<script>
  import { onMount } from 'svelte';
  import { unlockAudioContext } from '$audio/context.js';
  import { createAudioState } from '$stores/audio-state.svelte.js';
  import PianoKeyboard from '$components/piano/PianoKeyboard.svelte';
  import ControlPanel from '$components/controls/ControlPanel.svelte';
  import ChordGenerator from '$components/chord-generator/ChordGenerator.svelte';

  const audioState = createAudioState();
  let isReady = $state(false);
  let error = $state(null);
  let currentView = $state('piano'); // 'piano' | 'chords'

  onMount(async () => {
    try {
      await unlockAudioContext();
      await audioState.init();
      isReady = true;
    } catch (err) {
      error = err.message;
    }
  });

  function switchView(view) {
    currentView = view;
  }
</script>

<main class="app-container">
  <!-- Minimal Vintage Header -->
  <header class="app-header">
    <div class="header-content">
      <h1 class="app-title">🎹 LoFi Piano</h1>
      <p class="app-subtitle">Nostalgic warm piano for lo-fi beats</p>
    </div>
    
    {#if isReady}
      <!-- Tab Navigation -->
      <nav class="view-tabs">
        <button
          class="tab"
          class:active={currentView === 'piano'}
          onclick={() => switchView('piano')}
        >
          Piano
        </button>
        <button
          class="tab"
          class:active={currentView === 'chords'}
          onclick={() => switchView('chords')}
        >
          Chord Generator
        </button>
      </nav>
    {/if}
  </header>

  {#if error}
    <!-- Error State (vintage styled) -->
    <div class="error-state">
      <p class="error-icon">⚠️</p>
      <h2>Audio Initialization Failed</h2>
      <p class="error-message">{error}</p>
    </div>
  {:else if isReady}
    <!-- Main Content with View Switching -->
    <div class="app-content">
      {#if currentView === 'piano'}
        <div class="piano-view">
          <ControlPanel {audioState} />
          <PianoKeyboard {audioState} />
        </div>
      {:else if currentView === 'chords'}
        <div class="chords-view">
          <ChordGenerator {audioState} />
        </div>
      {/if}
    </div>
  {:else}
    <!-- Loading State -->
    <div class="loading">
      <div class="spinner"></div>
      <p>Initializing audio...</p>
    </div>
  {/if}
</main>

<style>
  .app-container {
    min-height: 100vh;
    background: var(--bg-primary);
    padding: var(--space-6);
    font-family: var(--font-family);
  }

  .app-header {
    max-width: 1400px;
    margin: 0 auto var(--space-8);
    padding-bottom: var(--space-6);
    border-bottom: 2px solid var(--border-color);
  }

  .header-content {
    text-align: center;
    margin-bottom: var(--space-4);
  }

  .app-title {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 var(--space-2) 0;
  }

  .app-subtitle {
    font-size: var(--font-size-base);
    color: var(--text-secondary);
    margin: 0;
  }

  /* Tab Navigation */
  .view-tabs {
    display: flex;
    justify-content: center;
    gap: var(--space-2);
  }

  .tab {
    padding: var(--space-3) var(--space-6);
    background: var(--bg-secondary);
    color: var(--text-secondary);
    border: var(--border-width) solid var(--border-color);
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-base);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-base);
  }

  .tab:hover {
    background: var(--accent);
    color: var(--text-primary);
    border-color: var(--accent);
  }

  .tab.active {
    background: var(--accent);
    color: var(--text-primary);
    border-color: var(--accent-hover);
    box-shadow: var(--shadow-md);
  }

  .app-content {
    max-width: 1400px;
    margin: 0 auto;
  }

  /* Error & Loading States */
  .error-state,
  .loading {
    text-align: center;
    padding: var(--space-12);
    color: var(--text-primary);
  }

  .error-icon {
    font-size: 4rem;
  }

  .spinner {
    width: 50px;
    height: 50px;
    margin: 0 auto var(--space-4);
    border: 4px solid var(--border-color);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
```

**Learning Point**: Tab navigation creates clear mental model - user knows where they are

---

## 🎹 Phase 5: Piano Keyboard Styling (Day 4)

### Goal
Update PianoKeyboard to vintage aesthetic while maintaining all functionality

### Implementation

**File**: `plugins/lofi-piano/web/src/lib/components/piano/PianoKeyboard.svelte`

**Changes**:

```svelte
<style>
  /* White Keys: Cream instead of pure white */
  .white-key {
    background: var(--bg-primary);
    border: var(--border-width) solid var(--border-color);
    box-shadow: var(--shadow-sm);
  }

  .white-key:hover {
    background: var(--bg-secondary);
  }

  .white-key.active {
    background: var(--accent);
    border-color: var(--accent-hover);
    box-shadow: var(--shadow-lg);
  }

  /* Black Keys: Deep brown instead of pure black */
  .black-key {
    background: var(--color-deep-brown);
    border: var(--border-width) solid var(--color-warm-brown);
  }

  .black-key:hover {
    background: var(--color-warm-brown);
  }

  .black-key.active {
    background: var(--accent);
    box-shadow: 0 0 8px var(--accent);
  }
</style>
```

**Testing Checklist**:
- [ ] All 88 keys render correctly
- [ ] Mouse click works
- [ ] Mouse drag (glissando) works
- [ ] Touch works on mobile
- [ ] Keyboard shortcuts work (QWERTY)
- [ ] MIDI input works
- [ ] Visual feedback immediate (<50ms)
- [ ] Colors match design system

---

## 🎨 Phase 6: Visual Feedback System (Days 5-7)

### Goal
Add real-time audio visualization for educational value

### 6.1: Spectrum Analyzer Component (Educational)

**Why**: Users NEED to see frequency content to understand EQ, filtering, saturation

**Create**: `shared/ui-components/visualizers/SpectrumAnalyzer.svelte`

```svelte
<script>
  /**
   * SpectrumAnalyzer
   * Real-time frequency spectrum visualization
   * Educational: Shows what frequencies are present in audio
   */
  
  let { audioContext, sourceNode } = $props();
  
  let canvasRef = $state(null);
  let analyser = $state(null);
  let dataArray = $state(null);
  let animationId = $state(null);
  
  $effect(() => {
    if (!audioContext || !sourceNode) return;
    
    // Create analyzer node
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048; // 2048 samples = good resolution
    analyser.smoothingTimeConstant = 0.8; // Smooth transitions
    
    // Connect source to analyzer
    sourceNode.connect(analyser);
    
    // Allocate buffer
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    // Start animation loop
    draw();
    
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (analyser) sourceNode.disconnect(analyser);
    };
  });
  
  function draw() {
    animationId = requestAnimationFrame(draw);
    
    if (!analyser || !dataArray || !canvasRef) return;
    
    // Get frequency data
    analyser.getByteFrequencyData(dataArray);
    
    const canvas = canvasRef;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = 'var(--bg-primary)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw spectrum bars
    const barWidth = (width / dataArray.length) * 2.5;
    let x = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * height;
      
      // Gold gradient based on amplitude
      const alpha = dataArray[i] / 255;
      ctx.fillStyle = `rgba(212, 165, 116, ${alpha})`;
      
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
  }
</script>

<div class="spectrum-container">
  <canvas bind:this={canvasRef} width="600" height="150"></canvas>
  <div class="spectrum-labels">
    <span>20Hz</span>
    <span>1kHz</span>
    <span>20kHz</span>
  </div>
</div>

<style>
  .spectrum-container {
    position: relative;
    border: 2px solid var(--border-color);
    border-radius: var(--border-radius-md);
    background: var(--bg-secondary);
    overflow: hidden;
  }
  
  canvas {
    display: block;
    width: 100%;
    height: 150px;
  }
  
  .spectrum-labels {
    display: flex;
    justify-content: space-between;
    padding: var(--space-2) var(--space-3);
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    background: var(--bg-primary);
  }
</style>
```

**Educational Value**:
- User sees that bass notes = left side of spectrum
- Saturation adds harmonics = more bars appear
- Low-pass filter = right side bars decrease

### 6.2: Envelope Visualizer (Days 6)

**Create**: `shared/ui-components/visualizers/EnvelopeGraph.svelte`

```svelte
<script>
  /**
   * EnvelopeGraph
   * Visualizes ADSR envelope shape
   * Educational: Shows how attack/decay/sustain/release shape sound over time
   */
  
  let { attack = 0.01, decay = 0.1, sustain = 0.7, release = 0.3 } = $props();
  
  let svgRef = $state(null);
  
  // Calculate path from ADSR parameters
  let envelopePath = $derived.by(() => {
    const width = 300;
    const height = 100;
    const padding = 10;
    
    // Time segments (proportional)
    const totalTime = attack + decay + 0.2 + release;
    const attackX = (attack / totalTime) * (width - 2 * padding);
    const decayX = attackX + (decay / totalTime) * (width - 2 * padding);
    const sustainX = decayX + (0.2 / totalTime) * (width - 2 * padding);
    const releaseX = width - 2 * padding;
    
    // Amplitude points
    const maxY = padding;
    const sustainY = padding + (1 - sustain) * (height - 2 * padding);
    const endY = height - padding;
    
    return `
      M ${padding},${endY}
      L ${padding + attackX},${maxY}
      L ${padding + decayX},${sustainY}
      L ${padding + sustainX},${sustainY}
      L ${padding + releaseX},${endY}
    `;
  });
</script>

<svg width="300" height="100" bind:this={svgRef}>
  <!-- Grid lines -->
  <line x1="10" y1="50" x2="290" y2="50" stroke="var(--border-color)" stroke-dasharray="2,2" />
  
  <!-- Envelope path -->
  <path
    d={envelopePath}
    fill="none"
    stroke="var(--accent)"
    stroke-width="3"
    stroke-linecap="round"
  />
  
  <!-- Labels -->
  <text x="15" y="95" font-size="10" fill="var(--text-secondary)">A</text>
  <text x="75" y="95" font-size="10" fill="var(--text-secondary)">D</text>
  <text x="150" y="95" font-size="10" fill="var(--text-secondary)">S</text>
  <text x="250" y="95" font-size="10" fill="var(--text-secondary)">R</text>
</svg>
```

**Educational Value**:
- User SEES how changing Attack makes slower/faster start
- Visual representation helps non-musicians understand
- Real-time updates reinforce parameter-to-sound relationship

---

## 🎛️ Phase 7: Audio Integration & AGE Effect (Days 8-10)

### Goal
Connect all UI to real audio processing + implement signature AGE effect

### 7.1: Create AGE Effect Module

**Create**: `plugins/lofi-piano/web/src/lib/audio/effects/age.js`

```javascript
/**
 * AGE (Analog Gear Emulation) Effect
 * 
 * Educational Purpose:
 * - Combines 3 effects to teach signal chain thinking
 * - Shows how multiple simple effects = complex character
 * - Perceptual parameter (age 0-100) → multiple technical params
 * 
 * Components:
 * 1. Saturation: Adds harmonic warmth (soft clipping)
 * 2. High-frequency rolloff: Simulates tape/analog loss
 * 3. Modulation: Subtle pitch wobble (wow/flutter)
 */

import { createSaturation } from './saturation.js';

export function createAGEEffect(audioContext) {
  // Create component effects
  const saturation = createSaturation(audioContext);
  
  // High-frequency rolloff (biquad lowpass)
  const rolloffFilter = audioContext.createBiquadFilter();
  rolloffFilter.type = 'lowpass';
  rolloffFilter.frequency.value = 20000; // Start at max (no rolloff)
  rolloffFilter.Q.value = 0.707; // Butterworth response
  
  // Connect chain: input → saturation → rolloff → output
  saturation.connect(rolloffFilter);
  
  // AGE amount state (0-100)
  let ageAmount = 0;
  
  /**
   * Set AGE amount (0-100 perceptual scale)
   * 
   * Educational: One control → multiple parameters
   * This is how professional plugins hide complexity
   */
  function setAge(value) {
    ageAmount = Math.max(0, Math.min(100, value));
    
    // Map to component parameters
    const normalizedAge = ageAmount / 100;
    
    // Saturation: 0% → 30% harmonic content
    saturation.setAmount(normalizedAge * 0.3);
    
    // Rolloff: 20kHz → 5kHz (subtle high-freq loss)
    const rolloffFreq = 20000 - (normalizedAge * 15000);
    rolloffFilter.frequency.setTargetAtTime(
      rolloffFreq,
      audioContext.currentTime,
      0.05 // 50ms smooth transition
    );
    
    // TODO: Add modulation (LFO on pitch) in future iteration
  }
  
  /**
   * Get perceptual description for current AGE level
   * Educational: Helps users understand what they're hearing
   */
  function getDescription() {
    if (ageAmount === 0) return 'Digital (pristine)';
    if (ageAmount < 30) return 'Subtle warmth';
    if (ageAmount < 50) return 'Warm vintage';
    if (ageAmount < 70) return 'Rich analog';
    return 'Heavily aged';
  }
  
  return {
    input: saturation.input,
    output: rolloffFilter,
    setAge,
    getDescription,
    getAmount: () => ageAmount,
    dispose: () => {
      saturation.dispose();
      rolloffFilter.disconnect();
    }
  };
}
```

**Educational Value**:
- Shows signal chain architecture
- Demonstrates parameter mapping (perceptual → technical)
- Teaches that "vintage" = combination of imperfections

---

## 🎯 Phase 8: E2E Integration & Performance (Days 11-14)

### 8.1: Complete Workflow Test

**Manual Testing Checklist**:

```markdown
## Piano Workflow
- [ ] Open plugin → sees vintage UI
- [ ] Click Piano tab → control panel + keyboard visible
- [ ] Play note → hear sound immediately (<10ms latency)
- [ ] Adjust AGE knob → hear warmth increase
- [ ] Adjust Room Mics → hear space change
- [ ] See spectrum analyzer update in real-time
- [ ] All knobs respond smoothly (no jank)

## Chord Generator Workflow
- [ ] Click Chord Generator tab → sees chord UI
- [ ] Select key (C Major) → sees 7 diatonic chords
- [ ] Click I chord → hears C major chord
- [ ] Build progression (I-IV-V-I) → sees in builder
- [ ] Click Play → hears progression with same piano sound
- [ ] Adjust tempo → progression speed changes
- [ ] Voice leading analysis shown

## Cross-Feature Integration
- [ ] Piano settings persist when switching to Chord Generator
- [ ] AGE effect applies to both piano and chords
- [ ] Visual aesthetic consistent everywhere
- [ ] No console errors
- [ ] Responsive on mobile
```

### 8.2: Performance Optimization

**Create**: `plugins/lofi-piano/web/src/lib/utils/performance.js`

```javascript
/**
 * Performance Monitoring
 * Educational: Shows students how to measure and optimize
 */

export class PerformanceMonitor {
  constructor(audioContext) {
    this.audioContext = audioContext;
    this.metrics = {
      cpuLoad: 0,
      voiceCount: 0,
      latency: 0
    };
  }
  
  /**
   * Estimate CPU load from audio context
   * Educational: baseLatency + outputLatency = processing overhead
   */
  updateMetrics(activeVoices) {
    this.metrics.voiceCount = activeVoices;
    this.metrics.latency = (
      this.audioContext.baseLatency + this.audioContext.outputLatency
    ) * 1000; // Convert to ms
    
    // Rough CPU estimation
    this.metrics.cpuLoad = Math.min(100, activeVoices * 5);
  }
  
  getCPUUsage() {
    return `${this.metrics.cpuLoad.toFixed(1)}%`;
  }
  
  getLatency() {
    return `${this.metrics.latency.toFixed(1)}ms`;
  }
}
```

---

## 📊 Success Criteria (Test Before Moving On)

### Visual Consistency
- ✅ Single color palette across all components
- ✅ Typography consistent everywhere
- ✅ Spacing follows 4px grid
- ✅ Transitions smooth (60fps)

### Functionality
- ✅ All tests passing (152 unit + E2E)
- ✅ Audio latency < 10ms
- ✅ No audio glitches/pops
- ✅ CPU usage reasonable (<30% on modern hardware)

### Educational Value
- ✅ Users can explain what AGE does after using it
- ✅ Spectrum analyzer helps understand frequency
- ✅ Envelope graph shows ADSR relationship
- ✅ Chord Generator teaches music theory through use

---

## 🚀 Next: Resource Library & Advanced Features

See companion documents:
- `RESOURCE_LIBRARY_SETUP.md` - Sample files, IRs, presets
- `ADVANCED_FEATURES_ROADMAP.md` - Preset system, export, MIDI CC

**You're now ready to build professional-grade audio plugins!** 🎉
