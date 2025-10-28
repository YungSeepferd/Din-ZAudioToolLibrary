# Senior Developer's Implementation Notes

**Strategic guidance for building the LoFi Piano plugin as a teaching project.**

---

## 🎯 Design Philosophy

This project embodies professional audio plugin development practices while being approachable for learning. We're not just building a plugin—we're demonstrating *how to build plugins correctly*.

### Core Principles

1. **Modularity First**: Each audio effect is independent, testable, and reusable
2. **No Circular Dependencies**: Plugins depend on shared, never vice versa
3. **Audio Best Practices**: No clicks/pops, efficient scheduling, parameter ramping
4. **Svelte 5 as Designed**: Use runes properly—$state for reactive data, $effect for side effects
5. **Professional Scope**: Production-ready quality, not experimental code

---

## 🏗️ Architecture Decisions

### Why These Effects?

**Saturation (Waveshaper)**
- Adds harmonic richness without complexity
- Good learning case: waveshaper function design
- Audible difference even at subtle settings
- Easy to explain to users

**Compression (Dynamics Compressor)**
- Controls dynamic range without obvious loss
- Teaches gain reduction and sidechain concepts
- Critical for "polished" sound in lo-fi
- Natural learning progression from basic gain nodes

**Reverb**
- Spatial effects are expected in modern music
- Two solid implementation choices:
  - ConvolverNode (professional, requires IR files)
  - Delay network (educational, algorithmic)
- Recommendation: Start with delay network (simpler), upgrade to convolver if time permits

### Why Detuned Oscillators?

Three oscillators with ±10-20 Hz offset:
- Creates natural "chorus" effect without chorus node
- Teaches students about phase relationships
- More interesting than single oscillator
- Still CPU-efficient
- Demonstrates voice duplication pattern (foundation for future polyphony)

---

## 🎵 Audio Graph Design Patterns

### Pattern 1: Voice Factory

Create a function that returns an audio processing unit:

```javascript
export function createPianoVoice() {
  const ctx = getAudioContext();

  // Create nodes
  const oscs = [
    ctx.createOscillator(),
    ctx.createOscillator(),
    ctx.createOscillator()
  ];
  const envelope = ctx.createGain();
  const output = ctx.createGain();

  // Configure with detuning
  oscs[0].frequency.value = 440;
  oscs[1].frequency.value = 440 + 10; // +10 Hz
  oscs[2].frequency.value = 440 - 15; // -15 Hz

  // Connect
  oscs.forEach(osc => osc.connect(envelope));
  envelope.connect(output);

  // Return interface
  return {
    output,
    setFrequency(f) {
      oscs[0].frequency.value = f;
      oscs[1].frequency.value = f + 10;
      oscs[2].frequency.value = f - 15;
    },
    setAmplitude(a) {
      envelope.gain.setValueAtTime(a, ctx.currentTime);
    },
    start() { oscs.forEach(o => o.start()); },
    stop() { oscs.forEach(o => o.stop()); }
  };
}
```

**Why this pattern?**
- Encapsulation: Hide internal nodes
- Reusability: Create multiple voices for polyphony
- Testability: Easy to mock and verify
- Flexibility: Change internals without breaking API

### Pattern 2: Effect Chain Composition

Wire effects in logical order for audio purity:

```javascript
export class AudioEffectChain {
  constructor(input, output) {
    // Effect order matters!
    this.saturation = createSaturation(input, this.saturationGain);
    this.compressor = createCompressor(this.saturation.output, this.compressorGain);
    this.reverb = createReverb(this.compressor.output, this.reverbGain);
    this.reverb.output.connect(output);
  }

  // Expose all effect parameters through unified interface
  setSaturation(amount) { this.saturation.setAmount(amount); }
  setCompression(ratio) { this.compressor.setRatio(ratio); }
  setReverb(mix) { this.reverb.setMix(mix); }
}
```

**Why this order?**
1. **Saturation first**: Distort clean signal (before compression distorts it)
2. **Compression second**: Tame dynamics after saturation adds harmonics
3. **Reverb last**: Add space to finished signal (not inside the reverb)

**Audio engineering reference**: Professional mixing consoles use this exact order.

### Pattern 3: Parameter Scheduling (No Artifacts)

**❌ NEVER do this:**
```javascript
// Creates nasty clicks!
gainNode.gain.value = 0.5;
```

**✅ ALWAYS do this:**
```javascript
// Smooth ramp over time
const ctx = getAudioContext();
const rampTime = 0.05; // 50ms ramp
gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + rampTime);
```

**Why?**
- Direct assignment causes discontinuity (aliasing)
- Ramps are scheduled, not sampled
- 50ms ramp is imperceptible but eliminates artifacts
- Web Audio API handles interpolation

**Teaching moment**: Explain the difference between imperative (direct assignment) and declarative (scheduled) parameter changes.

---

## 🎨 Svelte 5 Patterns for Audio

### Pattern 1: Reactive Audio Parameters

```svelte
<script>
  import { getAudioContext } from '@audio/utils/audio-context';

  let frequency = $state(440);
  let saturation = $state(0.3);

  // Side effect: sync UI state to audio
  $effect(() => {
    if (pianoVoice) {
      const ctx = getAudioContext();
      pianoVoice.setFrequency(frequency);
      saturationEffect.setAmount(saturation);
    }
  });
</script>

<Knob bind:value={frequency} min={20} max={2000} label="Frequency" />
<Slider bind:value={saturation} min={0} max={1} label="Saturation" />
```

**Key insights:**
- `$state` = what user sees and controls
- `$effect` = keep audio in sync with UI
- `bind:value` = two-way binding (user → state → audio)
- Dependencies implicit (Svelte tracks them)

### Pattern 2: Voice Management

Manage polyphony (multiple keys pressed simultaneously):

```svelte
<script>
  let activeVoices = $state({});

  function onKeyDown(note) {
    if (activeVoices[note]) return; // Already playing

    const voice = createPianoVoice();
    voice.setFrequency(noteToFrequency(note));
    voice.start();

    activeVoices[note] = voice;
  }

  function onKeyUp(note) {
    const voice = activeVoices[note];
    if (voice) {
      voice.stop();
      delete activeVoices[note];
    }
  }
</script>
```

**For students:**
- Shows object-based voice tracking
- Demonstrates polyphony management
- Pattern scales to many voices

### Pattern 3: Derived State for Display

```svelte
<script>
  let frequency = $state(440);

  // Auto-updates when frequency changes
  let noteDisplay = $derived(frequencyToNote(frequency));
  let centDisplay = $derived(calculateCents(frequency));
</script>

<p>{noteDisplay} ({centDisplay}¢)</p>
```

**Teaching point:** Derived values never go stale—they recompute automatically.

---

## 🛠️ Implementation Strategy

### Phase Emphasis (Where to Spend Time)

| Phase | Time | Emphasis | Why |
|-------|------|----------|-----|
| Phase 1 | 2 weeks | Audio fundamentals | Foundation everything builds on |
| Phase 2 | 2 weeks | Effect chain architecture | Critical for sound quality |
| Phase 3 | 2 weeks | UI/Svelte patterns | Most visible, immediate feedback |
| Phase 4 | 1 week | Sound design/tuning | Subjective but essential |
| Phase 5 | 1 week | Advanced features | Optional but polish |
| Phase 6 | 2 weeks | Testing/documentation | Professional quality |

### Critical Success Factors

1. **Phase 2 (Audio Graph)**: Get the effect chain right early. Poor architecture ruins everything.
2. **Phase 3 (UI)**: Smooth parameter binding is essential. Test every knob.
3. **Sound Design**: Spend time auditioning. Listen to reference lo-fi samples.

---

## 📊 Code Quality Standards

### Documentation Requirement: Audio Modules

Every audio module must have:

```javascript
/**
 * Module: Piano Voice Generator
 *
 * Purpose:
 * Creates a single polyphonic voice with three detuned oscillators
 * and ADSR envelope. Designed for warm, chorus-like timbre.
 *
 * Architecture:
 *   Input: frequency (Hz), velocity (0-127)
 *   ↓
 *   [Oscillator 1: f Hz] ↘
 *   [Oscillator 2: f+10 Hz]  ⊕ → [ADSR Envelope] → [Output]
 *   [Oscillator 3: f-15 Hz] ↗
 *
 * Key Properties:
 * - Monophonic per voice (polyphony handled by caller)
 * - Non-blocking: all operations use Web Audio scheduling
 * - CPU-efficient: 3 oscillators = minimal overhead
 *
 * Example:
 * const voice = createPianoVoice();
 * voice.setFrequency(440); // A4
 * voice.start();
 * voice.noteOff(); // Triggers release
 *
 * Dependencies: getAudioContext() from @audio/utils/audio-context
 * Related: See LoFi Piano docs for full effect chain
 */
```

### Code Organization: Consistent Structure

Every function should follow this structure:

```javascript
export function createEffect(config = {}) {
  // 1. Validate & extract config
  const {
    input = getAudioContext().destination,
    frequency = 1000,
    intensity = 0.5
  } = config;

  // 2. Get audio context
  const ctx = getAudioContext();

  // 3. Create and configure nodes
  const node1 = ctx.createBiquadFilter();
  const node2 = ctx.createGain();

  node1.frequency.value = frequency;
  node2.gain.value = intensity;

  // 4. Connect nodes
  node1.connect(node2);
  node2.connect(input);

  // 5. Return control interface
  return {
    output: node1,
    setFrequency: (f) => {
      const now = ctx.currentTime;
      node1.frequency.linearRampToValueAtTime(f, now + 0.05);
    },
    setIntensity: (i) => {
      const now = ctx.currentTime;
      node2.gain.linearRampToValueAtTime(i, now + 0.05);
    },
    disconnect: () => {
      node2.disconnect();
      node1.disconnect();
    }
  };
}
```

---

## 🎓 Teaching Moments to Emphasize

### 1. "Why Detuning Adds Warmth"
**Concept**: Phase relationships and interference patterns
- Play single oscillator
- Play detuned oscillators
- Explain: slightly different frequencies cause periodic volume changes
- This is intentional, not a bug
- Foundation for understanding modulation later

### 2. "Why Parameter Ramping Matters"
**Concept**: Digital artifacts and signal continuity
- Play note with clicks (direct assignment)
- Play same note without clicks (ramped)
- Show waveform in DevTools
- Explain discontinuity = aliasing
- Reference: Nyquist theorem, sampling theory

### 3. "How Compression Works"
**Concept**: Gain reduction based on input level
- Explain threshold (where compression starts)
- Ratio (how much reduction)
- Show sidechain: compression reads input level → outputs gain reduction
- Compare: no compression vs. heavy compression

### 4. "Audio as Data Flow"
**Concept**: Signals are streams of numbers, not mystical
- Show AudioNode as a function: input → processing → output
- Each node passes 44.1k samples/sec
- Parameters are just timelines (AudioParam)
- Code controls these streams

---

## 🔍 Common Pitfalls & Solutions

### Pitfall 1: Oscillators Running Forever
**Problem**: If you don't call `.stop()`, oscillators never release resources
**Solution**: Always pair `.start()` with `.stop()` or implement envelope that cuts off

```javascript
// ❌ Memory leak
osc.start();
// osc never stops!

// ✅ Proper resource management
osc.start(ctx.currentTime);
osc.stop(ctx.currentTime + 3); // Stops after 3 seconds
```

### Pitfall 2: Direct Parameter Assignment
**Problem**: `gainNode.gain.value = 0.5` creates clicks
**Solution**: Always use ramping
```javascript
// ❌ Clicks
gainNode.gain.value = 0.5;

// ✅ Smooth
gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
```

### Pitfall 3: Forgetting AudioContext.Unlock (iOS)
**Problem**: Audio doesn't work on iOS until user interacts
**Solution**: Call early, call often
```javascript
// In onMount:
import { unlockAudioContext } from '@audio/utils/audio-context';
unlockAudioContext(); // Handles all browsers
```

### Pitfall 4: Modifying Shared Modules Breaking Plugins
**Problem**: Changing `@audio/synthesis/oscillators.js` breaks other plugins
**Solution**: Semantic versioning, tests, documentation
- Document breaking changes
- Provide migration guides
- Version shared modules separately if possible

---

## 🚀 Success Patterns

### Testing Audio
Create simple test harness:
```javascript
// In browser console:
const piano = window.pianoPlugin;

// Single note
piano.playNote(60); // Middle C
await delay(1000);
piano.stopNote(60);

// Chord
[60, 64, 67].forEach(note => piano.playNote(note));
await delay(2000);
[60, 64, 67].forEach(note => piano.stopNote(note));
```

### Performance Profiling
Use DevTools Perfomance tab:
1. Click Record
2. Play several notes, move knobs
3. Stop recording
4. Look for "Main Thread" spikes
5. Target: < 15% sustained CPU

### Sound Design Iteration
1. Record short reference clip (lo-fi piano YouTube)
2. Play your plugin
3. A/B compare repeatedly
4. Make small adjustments
5. Repeat until close match

---

## 📈 Extension Ideas (After Completion)

Once the basic plugin works, these extensions teach new concepts:

| Extension | Concept | Time |
|-----------|---------|------|
| Polyphonic voices | Voice pool management | 2-3 days |
| LFO modulation | Low-frequency oscillator effects | 2-3 days |
| Arpeggiator | Sequence generation | 3-4 days |
| MIDI learn | Mapping controllers | 2 days |
| Preset saving | localStorage and JSON | 1-2 days |
| Audio worklet | Off-thread processing | 5+ days |
| VST wrapper | JUCE integration | 10+ days |

---

## 🎯 Final Check Before Shipping

**Audio**
- [ ] No clicks or pops at any parameter value
- [ ] All effects audible and properly ordered
- [ ] CPU load under 15% with 4 simultaneous voices
- [ ] Works in Chrome, Firefox, Safari, Edge

**UI**
- [ ] All knobs/sliders respond smoothly
- [ ] Keyboard input works (Z-M notes)
- [ ] MIDI input works (if implemented)
- [ ] Mobile-responsive layout

**Code**
- [ ] No console errors or warnings
- [ ] All files documented with headers
- [ ] Functions have JSDoc comments
- [ ] Passes ESLint without warnings
- [ ] Passes Prettier format check

**Documentation**
- [ ] README with usage instructions
- [ ] Code comments explain "why", not "what"
- [ ] Example implementations provided
- [ ] Common issues documented

---

## 📝 Handoff Notes

When handing off to the next developer:

1. **Architecture diagram** (audio graph visual)
2. **Parameter guide** (what each knob does, min/max values)
3. **Known limitations** (e.g., max polyphony, no MIDI yet)
4. **Test procedures** (steps to verify everything works)
5. **Performance baseline** (CPU usage, bundle size)
6. **Future work** (what to improve next)

---

## 🏆 Success Criteria

**The project is complete when:**

✅ Audio sounds warm, nostalgic, and professional
✅ UI is intuitive and responsive
✅ Code is clean, documented, and maintainable
✅ Students understand core concepts (oscillators, effects, scheduling, Svelte)
✅ Everything works in multiple browsers
✅ CPU usage is reasonable
✅ Documentation is comprehensive

---

**Remember**: This isn't just a plugin—it's a teaching vehicle. Every decision should be defensible from both technical and educational perspectives.

🎹✨ Build it right, and it becomes a reference implementation others learn from.
