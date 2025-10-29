# Web Audio API Guide

> **Reference**: This guide is based on the [official Web Audio API documentation](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext) and implements patterns verified in the Din-ZAudioToolLibrary `shared/audio-core` modules.

## Table of Contents

1. [Core Architecture](#core-architecture)
2. [AudioContext Management](#audiocontext-management)
3. [Audio Graph Design](#audio-graph-design)
4. [Parameter Scheduling](#parameter-scheduling)
5. [Implementation Patterns](#implementation-patterns)
6. [Common Pitfalls](#common-pitfalls)
7. [Best Practices Checklist](#best-practices-checklist)

---

## Core Architecture

### The Audio Graph

The Web Audio API structures all audio processing as a **directed graph** of interconnected `AudioNode` objects:

```
Source Node (e.g., Oscillator, AudioBuffer)
        ↓
   Processing Nodes (Filters, Effects, Gain)
        ↓
   Destination Node (speakers/output)
```

**Key Principle**: Audio flows in one direction through connected nodes. Each node processes its input and passes the output to connected destinations.

#### Node Categories

| Node Type | Purpose | Example |
|-----------|---------|---------|
| **Source** | Generate or input audio | Oscillator, BufferSource, Microphone |
| **Processor** | Modify audio signal | Filter, Gain, Delay, Compressor |
| **Destination** | Output audio | Destination (speakers) |

**Graph Constraint**: Each `AudioNode` belongs to exactly one `AudioContext`. Nodes cannot be shared across different contexts.

### The AudioContext

The `AudioContext` is the central hub for all audio processing:

```javascript
// Create a single AudioContext per application
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// The context manages:
// - All audio nodes (creation, lifecycle)
// - Timing (currentTime for synchronization)
// - Sample rate (typically 44.1 or 48 kHz)
// - Destination (system speakers)
```

**Best Practice**: Create one `AudioContext` and reuse it throughout your application. Creating multiple contexts consumes unnecessary resources.

---

## AudioContext Management

### Initialization Pattern

```javascript
// Singleton AudioContext management
let audioContext = null;

export function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}
```

**Why singleton?** Audio APIs are global system resources. One context per app prevents resource waste and ensures synchronized timing.

### Context States

The AudioContext has three states that affect audio processing:

```javascript
const ctx = getAudioContext();

// Check current state
console.log(ctx.state); // 'running', 'suspended', or 'closed'

// State transitions:
// 1. 'suspended' → 'running': User interaction required (iOS, some browsers)
// 2. 'running' → 'suspended': Manually suspend to save CPU/battery
// 3. 'running' → 'closed': Release all resources
```

#### 1. Running State

Audio is actively processing. Nodes execute their processing algorithms.

```javascript
if (ctx.state === 'running') {
  // Audio is playing, synthesis is active
}
```

#### 2. Suspended State

Audio is paused. Nodes exist but don't process. Critical for iOS and mobile browsers where audio requires user interaction.

```javascript
if (ctx.state === 'suspended') {
  // Resume audio (requires user gesture on iOS)
  await ctx.resume();
}
```

#### 3. Closed State

The context is permanently closed. All nodes are released. Create a new context if needed.

```javascript
ctx.close(); // Releases all audio resources
```

### iOS Unlock Pattern

iOS requires a user gesture (click, touch) to play audio. Implement this pattern:

```javascript
export async function unlockAudioContext() {
  const ctx = getAudioContext();

  // Resume context if suspended
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  // iOS-specific: Play silent buffer to unlock audio
  const buffer = ctx.createBuffer(1, 1, 22050);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(0);
}

// Call in component onMount with user interaction
document.addEventListener('click', unlockAudioContext, { once: true });
```

### Resource Management

```javascript
// Suspend when not in use (saves CPU/battery)
export function suspendAudioContext() {
  if (audioContext && audioContext.state === 'running') {
    audioContext.suspend();
  }
}

// Close when completely done (releases system resources)
export function closeAudioContext() {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}
```

### Latency Awareness

The Web Audio API introduces processing latency. For time-critical applications:

```javascript
const ctx = getAudioContext();

// Latency through audio subsystem
const baseLatency = ctx.baseLatency; // Inherent system latency

// Latency from hardware output
const outputLatency = ctx.outputLatency; // Device-specific

// Total latency
const totalLatency = baseLatency + outputLatency;

// For synchronized audio/visual events:
const outputTimestamp = ctx.getOutputTimestamp();
// Use to align audio with video or other media
```

---

## Audio Graph Design

### Connection Pattern

Connect nodes in sequence, forming a processing chain:

```javascript
const ctx = getAudioContext();

// 1. Create nodes
const oscillator = ctx.createOscillator();
const filter = ctx.createBiquadFilter();
const gain = ctx.createGain();

// 2. Configure parameters
oscillator.frequency.value = 440;
filter.type = 'lowpass';
filter.frequency.value = 2000;
gain.gain.value = 0.5;

// 3. Connect: Source → Processing → Output
oscillator.connect(filter);
filter.connect(gain);
gain.connect(ctx.destination);

// 4. Start
oscillator.start();
```

### Graph Topology: Serial vs. Parallel

#### Serial (Sequential)

Nodes process in sequence:

```
Oscillator → Filter → Gain → Destination
```

**Use when**: Signal must be filtered before gaining.

```javascript
osc.connect(filter);
filter.connect(gain);
gain.connect(destination);
```

#### Parallel (Mixing)

Multiple sources feed into a mixer:

```
Osc1 ─┐
      ├→ Gain (Master) → Destination
Osc2 ─┘
```

**Use when**: Combining multiple sound sources.

```javascript
const masterGain = ctx.createGain();
osc1.connect(masterGain);
osc2.connect(masterGain);
masterGain.connect(ctx.destination);
```

#### Serial + Parallel (Complex)

Combine both for flexible routing:

```
Osc → Filter ┐
            ├→ Delay → Gain → Destination
Noise ─────┘
```

```javascript
const delay = ctx.createDelay();
const masterGain = ctx.createGain();

osc.connect(filter);
filter.connect(delay);
noise.connect(delay);
delay.connect(masterGain);
masterGain.connect(ctx.destination);
```

### Latency in Complex Graphs

**Critical Insight**: More nodes = higher latency.

```
1 node:   ~0-10ms latency
5 nodes:  ~5-20ms latency
10 nodes: ~10-50ms latency
```

**Optimization**:
- Minimize node count for real-time responsiveness
- Position gain/volume control as the **final node** for immediate effect
- Use `baseLatency` for time-critical synchronization

### Master Volume Pattern

Always place a gain node last:

```javascript
const ctx = getAudioContext();

// Create effects chain
const osc = ctx.createOscillator();
const filter = ctx.createBiquadFilter();
const delay = ctx.createDelay();

// Create master volume LAST
const masterGain = ctx.createGain();

// Chain: Effects → Master Volume → Output
osc.connect(filter);
filter.connect(delay);
delay.connect(masterGain);
masterGain.connect(ctx.destination);

// Volume changes now take immediate effect
masterGain.gain.value = 0.5;
```

---

## Parameter Scheduling

### The Problem: Direct Value Changes

**Never do this** with audio parameters:

```javascript
// ❌ BAD: Direct assignment causes clicks/pops
gainNode.gain.value = 0.5;

// ❌ BAD: Abrupt parameter changes create artifacts
filter.frequency.value = 5000;
```

Why? Direct changes happen immediately in the next sample, causing discontinuous waveforms and audible artifacts (clicks/pops).

### The Solution: Smooth Scheduling

Use `AudioParam` scheduling methods to smoothly change values over time:

```javascript
const ctx = getAudioContext();
const gainNode = ctx.createGain();

// ✅ GOOD: Smooth linear ramp
gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1);
// Smoothly changes gain to 0.5 over 1 second

// ✅ GOOD: Smooth exponential ramp
filter.frequency.exponentialRampToValueAtTime(5000, ctx.currentTime + 0.5);
// Exponentially changes frequency to 5000 Hz over 0.5 seconds
```

### AudioParam Scheduling Methods

#### 1. `setValueAtTime(value, time)`

Sets an instant value at a specific time. Use to anchor a starting point for ramps:

```javascript
const now = ctx.currentTime;
gainNode.gain.setValueAtTime(0.3, now);        // Set to 0.3 now
gainNode.gain.linearRampToValueAtTime(0.8, now + 1); // Ramp to 0.8 over 1s
```

#### 2. `linearRampToValueAtTime(value, time)`

Linearly interpolates from current value to target:

```javascript
// Fade out over 2 seconds
gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
```

**Use for**: Volume fades, smooth parameter sweeps.

#### 3. `exponentialRampToValueAtTime(value, time)`

Exponentially interpolates (important for frequency perception):

```javascript
// Frequency sweeps (more natural than linear)
// Human hearing perceives frequency logarithmically
filter.frequency.exponentialRampToValueAtTime(
  20000,
  ctx.currentTime + 3
);
```

**Use for**: Frequency sweeps, resonance changes (match human hearing).

#### 4. `setTargetAtTime(target, startTime, timeConstant)`

Exponentially approaches a target value with a time constant:

```javascript
// Approaches target asymptotically
gainNode.gain.setTargetAtTime(0.5, ctx.currentTime, 0.5);
// After 1 time constant (0.5s): ~63% of the way
// After 5 time constants (2.5s): ~99% of the way
```

**Use for**: Smooth transitions without knowing exact duration.

#### 5. `cancelScheduledValues(time)`

Clears all scheduled changes from a given time onward:

```javascript
const now = ctx.currentTime;

// Cancel any pending events
gainNode.gain.cancelScheduledValues(now);

// Now set new value without interruption
gainNode.gain.linearRampToValueAtTime(0, now + 1);
```

**Use before**: Re-scheduling to avoid interference from previous schedules.

### ADSR Envelope Pattern

Practical envelope implementation using scheduling:

```javascript
export function createADSREnvelope(params = {}) {
  const {
    attack = 0.01,
    decay = 0.1,
    sustain = 0.7,
    release = 0.5
  } = params;

  const ctx = getAudioContext();
  const gain = ctx.createGain();
  gain.gain.value = 0;

  return {
    gain,

    // Trigger envelope on note-on
    trigger: (velocity = 1) => {
      const now = ctx.currentTime;
      const peakGain = velocity;

      // Clear any previous schedule
      gain.gain.cancelScheduledValues(now);

      // Set starting point
      gain.gain.setValueAtTime(0, now);

      // A: Attack (0 → peak)
      gain.gain.linearRampToValueAtTime(peakGain, now + attack);

      // D: Decay (peak → sustain)
      gain.gain.linearRampToValueAtTime(sustain * peakGain, now + attack + decay);
    },

    // Release envelope on note-off
    release: () => {
      const now = ctx.currentTime;

      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);

      // R: Release (current → 0)
      gain.gain.linearRampToValueAtTime(0, now + this.release);
    }
  };
}
```

### Parameter Rate Types

AudioParams have two rates affecting scheduling behavior:

#### A-Rate (Audio-rate)

Changes per sample frame (highest precision, all frequency-related parameters):

```javascript
// A-rate parameters (per-sample precision)
oscillator.frequency;  // A-rate
filter.frequency;      // A-rate
```

#### K-Rate (Control-rate)

Changes per processing block (128 samples, less precision, gain parameters):

```javascript
// K-rate parameters (block precision)
gainNode.gain;         // K-rate
delay.delayTime;       // K-rate
```

**Practical Impact**: A-rate parameters can modulate faster and more precisely, while K-rate parameters update in blocks for efficiency.

---

## Implementation Patterns

### Pattern 1: Simple Oscillator

**Audio Utility** (`shared/audio-core/synthesis/oscillators.js`):

```javascript
/**
 * Create a simple oscillator with frequency and gain control
 * @param {string} type - 'sine', 'square', 'sawtooth', or 'triangle'
 * @param {number} frequency - Starting frequency in Hz
 * @returns {Object} Oscillator instance with control methods
 */
export function createOscillator(type = 'sine', frequency = 440) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.value = 0.3; // Default volume

  // Connect: Oscillator → Gain → Destination
  osc.connect(gain);

  return {
    oscillator: osc,
    gainNode: gain,

    setFrequency: (freq) => {
      // Use setValueAtTime for smooth scheduling
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
    },

    setGain: (value) => {
      gain.gain.setValueAtTime(value, ctx.currentTime);
    },

    connect: (destination) => gain.connect(destination),
    disconnect: () => gain.disconnect(),
    start: () => osc.start(),
    stop: () => osc.stop()
  };
}
```

**Svelte Component Usage**:

```svelte
<script>
  import { createOscillator } from '@audio/synthesis/oscillators';
  import { onMount } from 'svelte';

  let oscillator;
  let frequency = $state(440);
  let isPlaying = $state(false);

  onMount(async () => {
    // Initialize oscillator
    oscillator = createOscillator('sine', frequency);
  });

  $effect(() => {
    // Update frequency when state changes
    oscillator?.setFrequency(frequency);
  });

  function togglePlayback() {
    if (isPlaying) {
      oscillator?.stop();
    } else {
      oscillator?.start();
    }
    isPlaying = !isPlaying;
  }
</script>

<div class="oscillator-control">
  <input type="range" bind:value={frequency} min="20" max="2000" />
  <span>{frequency} Hz</span>

  <button onclick={togglePlayback}>
    {isPlaying ? 'Stop' : 'Play'}
  </button>
</div>
```

**Key Points**:
- ✅ Always wrap oscillator in a gain node for volume control
- ✅ Use `setValueAtTime()` for parameter scheduling
- ✅ Expose clean API methods (setFrequency, setGain, etc.)
- ✅ Use Svelte 5 `$effect` to sync state with audio nodes

### Pattern 2: Smooth Parameter Control

```javascript
// Use for real-time parameter sweeps
function smoothSetValue(param, targetValue, duration = 0.1) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  param.cancelScheduledValues(now);
  param.setValueAtTime(param.value, now);
  param.linearRampToValueAtTime(targetValue, now + duration);
}

// Usage
smoothSetValue(filter.frequency, 5000, 0.5); // 500ms sweep to 5000 Hz
```

### Pattern 3: Envelope-Triggered Sound

```javascript
// Combine oscillator + envelope
function playNote(frequency, velocity, duration) {
  const ctx = getAudioContext();

  // Create synth components
  const osc = createOscillator('sine', frequency);
  const envelope = createADSREnvelope({
    attack: 0.01,
    decay: 0.1,
    sustain: 0.5,
    release: 0.2
  });

  // Connect: Oscillator → Envelope → Destination
  osc.connect(envelope.gain);
  envelope.gain.connect(ctx.destination);

  // Start sound
  osc.start();
  envelope.trigger(velocity);

  // Stop after duration
  setTimeout(() => {
    envelope.release();
    setTimeout(() => osc.stop(), envelope.release * 1000);
  }, duration * 1000);
}

// Usage
playNote(440, 1.0, 1.0); // A4, full velocity, 1 second
```

### Pattern 4: Filter Control

```javascript
// See: shared/audio-core/synthesis/filters.js
function createLowPassFilter(frequency = 1000, q = 1) {
  const ctx = getAudioContext();
  const filter = ctx.createBiquadFilter();

  filter.type = 'lowpass';
  filter.frequency.value = frequency;
  filter.Q.value = q;

  return {
    filter,

    setFrequency: (freq) => {
      // Use smooth scheduling for frequency sweeps
      filter.frequency.linearRampToValueAtTime(freq, ctx.currentTime + 0.1);
    },

    setQ: (qValue) => {
      filter.Q.setValueAtTime(qValue, ctx.currentTime);
    },

    connect: (destination) => filter.connect(destination)
  };
}
```

**Filter Types** (Biquad):
- `lowpass` - Removes high frequencies
- `highpass` - Removes low frequencies
- `bandpass` - Isolates frequency band
- `lowshelf` - Boost/cut low frequencies
- `highshelf` - Boost/cut high frequencies
- `peaking` - Boost/cut specific frequency
- `notch` - Removes specific frequency

### Pattern 5: Delay Effect

```javascript
// See: shared/audio-core/effects/delay.js
function createDelayEffect(time = 0.5, feedback = 0.3) {
  const ctx = getAudioContext();

  const input = ctx.createGain();
  const delayNode = ctx.createDelay(5); // Max 5 seconds
  const feedbackGain = ctx.createGain();
  const output = ctx.createGain();

  // Set initial values
  delayNode.delayTime.value = time;
  feedbackGain.gain.value = feedback;

  // Connect: Input → Delay → Output
  //                   ↑       ↓
  //            Feedback Loop (FeedbackGain)
  input.connect(delayNode);
  delayNode.connect(output);
  delayNode.connect(feedbackGain);
  feedbackGain.connect(delayNode); // Feedback loop

  return {
    input,
    output,

    setTime: (delayTime) => {
      delayNode.delayTime.setValueAtTime(delayTime, ctx.currentTime);
    },

    setFeedback: (fb) => {
      // Clamp feedback to prevent runaway
      feedbackGain.gain.setValueAtTime(
        Math.max(0, Math.min(0.8, fb)),
        ctx.currentTime
      );
    },

    connect: (destination) => output.connect(destination),
    getInput: () => input
  };
}
```

**Graph:**
```
Input → Delay Node → Output → Destination
          ↑    ↓
          Feedback Loop
         (FeedbackGain)
```

**Important**: Feedback is clamped to 0.8 max to prevent infinite gain.

---

## Common Pitfalls

### Pitfall 1: Creating Multiple AudioContexts

```javascript
// ❌ BAD: Creates new context each time
function playSound() {
  const ctx = new AudioContext(); // Creates new context!
  const osc = ctx.createOscillator();
  osc.start();
}

// ✅ GOOD: Reuses singleton
function playSound() {
  const ctx = getAudioContext(); // Reuses same context
  const osc = ctx.createOscillator();
  osc.start();
}
```

**Cost**: Multiple contexts consume significant CPU and memory. Always use a singleton pattern.

### Pitfall 2: Direct Parameter Assignment

```javascript
// ❌ BAD: Causes clicks/pops
gainNode.gain.value = 0.5;
filter.frequency.value = 5000;

// ✅ GOOD: Smooth scheduling
gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
filter.frequency.linearRampToValueAtTime(5000, ctx.currentTime + 0.5);
```

**Effect**: Direct changes create audible discontinuities.

### Pitfall 3: Forgetting iOS Unlock

```javascript
// ❌ BAD: Audio won't play on iOS
function startAudio() {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  osc.start(); // Silent on iOS
}

// ✅ GOOD: Handle iOS suspension
async function startAudio() {
  await unlockAudioContext();
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  osc.start(); // Works on iOS
}
```

**Requirement**: iOS requires a user gesture (click/touch) before audio plays.

### Pitfall 4: Not Cleaning Up Resources

```javascript
// ❌ BAD: Resource leak
function playSound() {
  const osc = ctx.createOscillator();
  osc.start();
  // Never stops or disconnects
}

// ✅ GOOD: Clean up
function playSound(duration = 1) {
  const osc = ctx.createOscillator();
  osc.start();
  osc.stop(ctx.currentTime + duration); // Schedule stop
}
```

**Impact**: Unreleased oscillators continue consuming CPU.

### Pitfall 5: Ignoring Context State

```javascript
// ❌ BAD: Ignores context state
const ctx = getAudioContext();
const osc = ctx.createOscillator();
osc.start(); // May be silent if context is suspended

// ✅ GOOD: Check/resume context
const ctx = getAudioContext();
if (ctx.state === 'suspended') {
  ctx.resume();
}
const osc = ctx.createOscillator();
osc.start();
```

**Outcome**: Audio silently fails if context isn't running.

### Pitfall 6: Feedback Loops Without Limits

```javascript
// ❌ BAD: Unbounded feedback causes runaway gain
delayNode.connect(feedbackGain);
feedbackGain.connect(delayNode); // Feedback = 1.0 → infinite gain!

// ✅ GOOD: Clamp feedback value
feedbackGain.gain.value = Math.max(0, Math.min(0.8, feedback));
```

**Danger**: Runaway feedback creates distortion and potential speaker damage.

---

## Best Practices Checklist

### Initialization

- [ ] Create one `AudioContext` per application (singleton pattern)
- [ ] Handle iOS audio unlock on first user interaction
- [ ] Check and resume context state before playing audio
- [ ] Verify `AudioContext` is available (fallback to `webkitAudioContext`)

### Audio Graph Design

- [ ] Keep graphs as simple as possible (minimize nodes for lower latency)
- [ ] Connect nodes in logical order: Source → Processing → Destination
- [ ] Place gain/volume control as final node before destination
- [ ] Use parallel connections only when necessary
- [ ] Monitor `baseLatency` and `outputLatency` for time-critical apps

### Parameter Scheduling

- [ ] **ALWAYS** use `setValueAtTime()` before scheduling ramps
- [ ] Use `linearRampToValueAtTime()` for gain/amplitude changes
- [ ] Use `exponentialRampToValueAtTime()` for frequency changes (matches hearing)
- [ ] Call `cancelScheduledValues()` before rescheduling
- [ ] Use `setTargetAtTime()` for smooth transitions to unknown endpoints
- [ ] Never assign directly to `.value` when sounds are playing

### Node Management

- [ ] Stop oscillators with `osc.stop(time)` and schedule disconnection
- [ ] Disconnect nodes when no longer needed: `node.disconnect()`
- [ ] Don't create/destroy nodes repeatedly in audio loops
- [ ] Cache node references for repeated access

### Resource Management

- [ ] Close `AudioContext` when completely done: `ctx.close()`
- [ ] Suspend context during silence: `ctx.suspend()`
- [ ] Resume context before audio: `await ctx.resume()`
- [ ] Clamp feedback values to prevent runaway gain (max 0.8)
- [ ] Release audio resources in cleanup (onDestroy, useEffect cleanup)

### Testing & Debugging

- [ ] Test on iOS and mobile browsers (suspension/unlock requirements)
- [ ] Check browser console for Web Audio errors
- [ ] Use `ctx.state` to verify context is running
- [ ] Monitor CPU usage with multiple complex graphs
- [ ] Verify clicks/pops are eliminated with smooth scheduling
- [ ] Test feedback loops with clamped gain values

### Performance

- [ ] Minimize node count (1 effect → 3 nodes vs. 5 effects → 15 nodes)
- [ ] Use `K-rate` parameters (gain) where `A-rate` isn't necessary
- [ ] Avoid per-sample operations in main thread
- [ ] Consider `AudioWorklet` for CPU-intensive DSP
- [ ] Profile with browser DevTools before optimizing

---

## Quick Reference

### Common Parameter Scheduling

```javascript
const ctx = getAudioContext();

// Smooth gain change
gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1);

// Smooth frequency change
filter.frequency.exponentialRampToValueAtTime(5000, ctx.currentTime + 0.5);

// Reset and reschedule
gainNode.gain.cancelScheduledValues(ctx.currentTime);
gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);

// Approach target asymptotically
gainNode.gain.setTargetAtTime(0.5, ctx.currentTime, 0.1);
```

### Standard Node Creation

```javascript
// Oscillator
const osc = ctx.createOscillator();

// Gain control
const gain = ctx.createGain();

// Filter
const filter = ctx.createBiquadFilter();

// Delay
const delay = ctx.createDelay(5); // Max 5 seconds

// Dynamics control
const compressor = ctx.createDynamicsCompressor();

// Stereo panning
const panner = ctx.createStereoPanner();
```

### Graph Connection

```javascript
// Series
osc.connect(filter);
filter.connect(gain);
gain.connect(ctx.destination);

// Parallel
osc1.connect(mixer);
osc2.connect(mixer);
mixer.connect(ctx.destination);

// With effects
osc.connect(effect);
effect.connect(masterGain);
masterGain.connect(ctx.destination);
```

### Cleanup

```javascript
// Stop oscillator
osc.stop(ctx.currentTime + duration);

// Disconnect node
node.disconnect();

// Suspend context (saves power)
ctx.suspend();

// Resume context
await ctx.resume();

// Close context (full cleanup)
ctx.close();
```

---

## Web Audio + Svelte 5 Integration

### Using Web Audio in Svelte Components

Web Audio API operations (initialization, parameter changes, node creation) work best with Svelte 5's `$effect` rune:

```svelte
<script>
  import { getAudioContext } from '@audio/utils/audio-context';
  import { createOscillator } from '@audio/synthesis/oscillators';

  let frequency = $state(440);
  let volume = $state(0.5);
  let oscillator;

  // Initialize audio on mount
  $effect(() => {
    // This runs once when component mounts
    const ctx = getAudioContext();
    oscillator = createOscillator('sine', frequency);
    oscillator.connect(ctx.destination);
    oscillator.start();

    // Cleanup when component unmounts
    return () => {
      oscillator?.stop();
      oscillator?.disconnect();
    };
  });

  // Update frequency whenever it changes
  $effect(() => {
    // This runs whenever `frequency` changes
    oscillator?.setFrequency(frequency);
  });

  // Update volume independently
  $effect(() => {
    oscillator?.setGain(volume);
  });
</script>

<div class="synth">
  <label>
    Frequency: {frequency} Hz
    <input type="range" bind:value={frequency} min="20" max="2000" />
  </label>

  <label>
    Volume: {(volume * 100).toFixed(0)}%
    <input type="range" bind:value={volume} min="0" max="1" step="0.01" />
  </label>
</div>
```

### Pattern: Separating Audio Logic from UI

Keep Web Audio API code separate from Svelte components for reusability:

```javascript
// shared/audio-core/synth.js - Pure JavaScript audio logic
export function createSynth(frequency = 440, volume = 0.5) {
  const ctx = getAudioContext();
  const oscillator = createOscillator('sine', frequency);
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  gainNode.gain.value = volume;

  return {
    start: () => oscillator.start(),
    stop: () => oscillator.stop(),
    setFrequency: (f) => oscillator.setFrequency(f),
    setVolume: (v) => gainNode.gain.setValueAtTime(v, ctx.currentTime),
    cleanup: () => oscillator.disconnect()
  };
}
```

```svelte
<!-- src/components/SynthControl.svelte - Svelte UI layer -->
<script>
  import { createSynth } from '@audio/synth';

  let frequency = $state(440);
  let volume = $state(0.5);
  let synth;

  $effect(() => {
    synth = createSynth(frequency, volume);
    synth.start();

    return () => {
      synth?.cleanup();
    };
  });

  $effect(() => {
    synth?.setFrequency(frequency);
  });

  $effect(() => {
    synth?.setVolume(volume);
  });
</script>

<div class="synth-control">
  <input bind:value={frequency} />
  <input bind:value={volume} />
</div>
```

### Best Practices

1. **Use `$effect` for side effects**: Initialize audio, update nodes
2. **Use `$derived` for computed values**: Display frequency, volume calculations
3. **Separate concerns**: Keep audio logic in `shared/audio-core/`, UI in components
4. **Always cleanup**: Return cleanup functions from `$effect`
5. **Avoid direct mutations**: Use scheduling methods (`setValueAtTime`, etc.)

---

## Related Documentation

- **Official Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **AudioContext**: https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
- **AudioNode**: https://developer.mozilla.org/en-US/docs/Web/API/AudioNode
- **AudioParam**: https://developer.mozilla.org/en-US/docs/Web/API/AudioParam
- **Svelte 5 Official Docs**: https://svelte.dev/docs
- **Din-ZAudioToolLibrary Implementation**: `shared/audio-core/`

---

**Last Updated**: October 2025
**Svelte Version**: 5.0+
**Status**: Verified against official MDN Web Audio API documentation and Svelte 5 best practices
