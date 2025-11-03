# Audio Core Library

**Shared audio DSP utilities for building Web Audio-based plugins**

The `audio-core` library provides reusable, production-ready audio modules for synthesis, effects, music theory, and audio context management. All modules are designed to work seamlessly with the Web Audio API.

## 📦 Installation & Import

### In a Plugin Project

The library is available via the `@audio` import alias:

```javascript
// Individual imports (recommended)
import { createOscillator } from '@audio/synthesis/oscillators';
import { createADSREnvelope } from '@audio/synthesis/envelopes';
import { createLowPassFilter } from '@audio/synthesis/filters';
import { createDelay } from '@audio/effects/delay';
import { getAudioContext, unlockAudioContext } from '@audio/utils/audio-context';

// Music theory
import { generateScale, generateChord, generateProgression } from '@audio/music-theory';
```

### Direct Import (without alias)

```javascript
import { createOscillator } from '../shared/audio-core/synthesis/oscillators.js';
```

## 🎵 Modules Overview

| Module | Purpose | Test Coverage |
|--------|---------|---------------|
| **synthesis/oscillators** | Waveform generation (sine, square, sawtooth, triangle, custom) | ❌ No tests |
| **synthesis/envelopes** | ADSR/AR envelope generators for amplitude shaping | ❌ No tests |
| **synthesis/filters** | Frequency filters (low-pass, high-pass, band-pass, peaking, shelf) | ❌ No tests |
| **effects/delay** | Delay and ping-pong delay effects | ❌ No tests |
| **music-theory/** | Scales, chords, progressions, MIDI utilities | ✅ 152/152 tests passing |
| **utils/audio-context** | Singleton AudioContext with iOS unlock support | ❌ No tests |

---

## 🎛️ API Reference

### Synthesis

#### Oscillators (`synthesis/oscillators.js`)

##### `createOscillator(type, frequency)`

Creates a basic oscillator with frequency and type control.

**Parameters:**
- `type` (string): Waveform type - `'sine'`, `'square'`, `'sawtooth'`, or `'triangle'` (default: `'sine'`)
- `frequency` (number): Starting frequency in Hz (default: `440`)

**Returns:** Object with methods:
- `oscillator`: Raw OscillatorNode
- `gainNode`: Connected GainNode
- `getFrequency()`: Get current frequency
- `setFrequency(freq)`: Set frequency (scheduled, no clicks)
- `getType()`: Get waveform type
- `setType(type)`: Set waveform type
- `getGain()`: Get amplitude (0-1)
- `setGain(value)`: Set amplitude (scheduled)
- `connect(destination)`: Connect to audio node
- `disconnect()`: Disconnect from all nodes
- `start()`: Start oscillator
- `stop()`: Stop oscillator

**Example:**

```javascript
import { createOscillator } from '@audio/synthesis/oscillators';
import { getAudioContext } from '@audio/utils/audio-context';

const audioContext = getAudioContext();

// Create a 440Hz sine wave
const osc = createOscillator('sine', 440);
osc.connect(audioContext.destination);
osc.start();

// Change frequency smoothly (no clicks)
osc.setFrequency(880);

// Change waveform
osc.setType('square');

// Adjust volume
osc.setGain(0.5);

// Stop after 2 seconds
setTimeout(() => osc.stop(), 2000);
```

##### `createWavetableOscillator(wavetable, frequency)`

Creates an oscillator with custom waveform.

**Parameters:**
- `wavetable` (Float32Array): Custom waveform data (periodic wave)
- `frequency` (number): Starting frequency in Hz (default: `440`)

**Returns:** Object with similar methods to `createOscillator()`

**Example:**

```javascript
// Create a custom waveform (additive synthesis: fundamental + 2 harmonics)
const real = new Float32Array([0, 1, 0.5, 0.25]); // Cosine terms
const imag = new Float32Array([0, 0, 0, 0]);      // Sine terms

const audioContext = getAudioContext();
const wave = audioContext.createPeriodicWave(real, imag);

// Use with wavetable oscillator
const osc = createWavetableOscillator(wave, 220);
osc.connect(audioContext.destination);
osc.start();
```

---

#### Envelopes (`synthesis/envelopes.js`)

##### `createADSREnvelope(params)`

Creates an ADSR (Attack-Decay-Sustain-Release) envelope generator.

**Parameters:**
- `params` (object): Envelope parameters
  - `attack` (number): Attack time in seconds (default: `0.01`)
  - `decay` (number): Decay time in seconds (default: `0.1`)
  - `sustain` (number): Sustain level 0-1 (default: `0.7`)
  - `release` (number): Release time in seconds (default: `0.5`)

**Returns:** Object with methods:
- `gain`: GainNode for envelope control
- `trigger(velocity)`: Start envelope (note on)
- `release()`: Release envelope (note off)
- `setAttack(time)`: Update attack time
- `setDecay(time)`: Update decay time
- `setSustain(level)`: Update sustain level
- `setRelease(time)`: Update release time
- `connect(destination)`: Connect envelope output

**Example:**

```javascript
import { createOscillator } from '@audio/synthesis/oscillators';
import { createADSREnvelope } from '@audio/synthesis/envelopes';
import { getAudioContext } from '@audio/utils/audio-context';

const audioContext = getAudioContext();

// Create oscillator
const osc = createOscillator('sawtooth', 440);

// Create envelope with custom params
const envelope = createADSREnvelope({
  attack: 0.05,
  decay: 0.2,
  sustain: 0.6,
  release: 1.0
});

// Connect: oscillator → envelope → output
osc.connect(envelope.gain);
envelope.connect(audioContext.destination);

// Start sound
osc.start();
envelope.trigger(1); // velocity = 1 (max)

// Release after 1 second
setTimeout(() => envelope.release(), 1000);

// Stop after release finishes
setTimeout(() => osc.stop(), 1000 + 1000); // 1s hold + 1s release
```

##### `createAREnvelope(attackTime, releaseTime)`

Creates a simpler AR (Attack-Release) envelope.

**Parameters:**
- `attackTime` (number): Attack time in seconds (default: `0.01`)
- `releaseTime` (number): Release time in seconds (default: `0.5`)

**Returns:** Object with similar interface to ADSR envelope

---

#### Filters (`synthesis/filters.js`)

##### `createLowPassFilter(frequency, q)`

Creates a low-pass filter (removes high frequencies).

**Parameters:**
- `frequency` (number): Cutoff frequency in Hz (default: `1000`)
- `q` (number): Quality factor/resonance 0.1-20 (default: `1`)

**Returns:** Object with methods:
- `filter`: BiquadFilterNode
- `setFrequency(freq)`: Set cutoff frequency
- `setQ(q)`: Set resonance
- `connect(destination)`: Connect filter output
- `disconnect()`: Disconnect from all nodes

**Example:**

```javascript
import { createOscillator } from '@audio/synthesis/oscillators';
import { createLowPassFilter } from '@audio/synthesis/filters';
import { getAudioContext } from '@audio/utils/audio-context';

const audioContext = getAudioContext();

// Create sawtooth oscillator (rich in harmonics)
const osc = createOscillator('sawtooth', 220);

// Create resonant low-pass filter
const filter = createLowPassFilter(800, 5); // 800Hz cutoff, resonance = 5

// Connect: oscillator → filter → output
osc.connect(filter.filter);
filter.connect(audioContext.destination);

// Start sound
osc.start();

// Sweep filter cutoff (classic analog synth sound)
let cutoff = 800;
setInterval(() => {
  cutoff = (cutoff % 3000) + 200; // Sweep 200Hz to 3200Hz
  filter.setFrequency(cutoff);
}, 100);
```

##### Other Filters

All filters share the same API:

- **`createHighPassFilter(frequency, q)`** - Removes low frequencies
- **`createBandPassFilter(frequency, q)`** - Passes only frequencies near cutoff
- **`createPeakingFilter(frequency, gain, q)`** - Boosts/cuts frequencies around cutoff
- **`createLowShelfFilter(frequency, gain)`** - Boosts/cuts low frequencies
- **`createHighShelfFilter(frequency, gain)`** - Boosts/cuts high frequencies

---

### Effects

#### Delay (`effects/delay.js`)

##### `createDelay(delayTime, feedback, mix)`

Creates a delay effect with feedback control.

**Parameters:**
- `delayTime` (number): Delay time in seconds (default: `0.3`)
- `feedback` (number): Feedback amount 0-1 (default: `0.5`)
- `mix` (number): Dry/wet mix 0-1 (default: `0.5`)

**Returns:** Object with methods:
- `input`: Input node (connect source here)
- `output`: Output node (connect to destination)
- `setDelayTime(time)`: Update delay time
- `setFeedback(amount)`: Update feedback
- `setMix(amount)`: Update dry/wet mix

**Example:**

```javascript
import { createOscillator } from '@audio/synthesis/oscillators';
import { createDelay } from '@audio/effects/delay';
import { getAudioContext } from '@audio/utils/audio-context';

const audioContext = getAudioContext();

// Create sound source
const osc = createOscillator('sine', 440);

// Create delay effect: 500ms delay, 60% feedback, 70% wet
const delay = createDelay(0.5, 0.6, 0.7);

// Connect: oscillator → delay → output
osc.connect(delay.input);
delay.output.connect(audioContext.destination);

// Play short blip
osc.start();
setTimeout(() => osc.stop(), 0.1); // Delay creates echoes
```

##### `createPingPongDelay(delayTime, feedback, mix)`

Creates a stereo ping-pong delay effect (alternates left/right).

**Parameters:** Same as `createDelay()`

**Returns:** Object with same API as `createDelay()`

---

### Music Theory

#### Scales (`music-theory/scales.js`)

##### `generateScale(rootMidiNote, scaleType, octaveCount)`

Generates a musical scale.

**Parameters:**
- `rootMidiNote` (number): MIDI note number (60 = Middle C)
- `scaleType` (string): `'major'`, `'minor'`, `'dorian'`, `'phrygian'`, `'lydian'`, `'mixolydian'`, `'aeolian'`, `'locrian'`, `'pentatonicMajor'`, `'pentatonicMinor'`, `'blues'`, `'wholeTone'`, `'harmonicMinor'`, `'melodicMinor'`
- `octaveCount` (number): Number of octaves (default: `1`)

**Returns:** Array of MIDI note numbers

**Example:**

```javascript
import { generateScale } from '@audio/music-theory/scales';

// C Major scale (1 octave)
const cMajor = generateScale(60, 'major', 1);
// → [60, 62, 64, 65, 67, 69, 71, 72]
//    C   D   E   F   G   A   B   C

// A minor pentatonic scale (2 octaves)
const aMinorPent = generateScale(57, 'pentatonicMinor', 2);
// → [57, 60, 62, 65, 67, 69, 72, 74, 77, 79]
```

#### Chords (`music-theory/chords.js`)

##### `generateChord(rootMidiNote, chordType)`

Generates a chord from root note.

**Parameters:**
- `rootMidiNote` (number): MIDI note number for root
- `chordType` (string): `'major'`, `'minor'`, `'diminished'`, `'augmented'`, `'major7'`, `'minor7'`, `'dominant7'`, `'sus2'`, `'sus4'`

**Returns:** Array of MIDI note numbers

**Example:**

```javascript
import { generateChord } from '@audio/music-theory/chords';

// C Major chord
const cMajor = generateChord(60, 'major');
// → [60, 64, 67] (C, E, G)

// G7 dominant chord
const g7 = generateChord(67, 'dominant7');
// → [67, 71, 74, 77] (G, B, D, F)
```

##### `generateDiatonicChords(rootMidiNote, scaleType)`

Generates all 7 diatonic chords in a key.

**Returns:** Array of chord objects:
```javascript
{
  root: 60,          // MIDI note number
  roman: 'I',        // Roman numeral (I, ii, iii, IV, V, vi, vii°)
  name: 'C major',   // Chord name
  notes: [60, 64, 67], // MIDI notes
  type: 'major'      // Chord type
}
```

**Example:**

```javascript
import { generateDiatonicChords } from '@audio/music-theory/chords';

// All chords in C Major
const chords = generateDiatonicChords(60, 'major');
// → [
//   { roman: 'I',    name: 'C major',  notes: [60, 64, 67] },
//   { roman: 'ii',   name: 'D minor',  notes: [62, 65, 69] },
//   { roman: 'iii',  name: 'E minor',  notes: [64, 67, 71] },
//   { roman: 'IV',   name: 'F major',  notes: [65, 69, 72] },
//   { roman: 'V',    name: 'G major',  notes: [67, 71, 74] },
//   { roman: 'vi',   name: 'A minor',  notes: [69, 72, 76] },
//   { roman: 'vii°', name: 'B dim',    notes: [71, 74, 77] }
// ]
```

#### Progressions (`music-theory/progressions.js`)

##### `generateProgression(rootMidiNote, scaleType, romanNumerals)`

Generates a chord progression from Roman numerals.

**Parameters:**
- `rootMidiNote` (number): Key center (60 = C)
- `scaleType` (string): Scale type (usually `'major'` or `'minor'`)
- `romanNumerals` (array): Array of Roman numerals (e.g., `['I', 'IV', 'V', 'I']`)

**Returns:** Array of chord objects (same format as `generateDiatonicChords`)

**Example:**

```javascript
import { generateProgression } from '@audio/music-theory/progressions';

// Classic I-IV-V-I progression in C Major
const progression = generateProgression(60, 'major', ['I', 'IV', 'V', 'I']);
// → [
//   { roman: 'I',  name: 'C major', notes: [60, 64, 67] },
//   { roman: 'IV', name: 'F major', notes: [65, 69, 72] },
//   { roman: 'V',  name: 'G major', notes: [67, 71, 74] },
//   { roman: 'I',  name: 'C major', notes: [60, 64, 67] }
// ]

// Jazz ii-V-I progression
const jazzProg = generateProgression(60, 'major', ['ii', 'V', 'I']);
```

#### MIDI Utilities (`music-theory/midi.js`)

##### `midiToNoteName(midiNote)`

Converts MIDI note number to note name.

```javascript
import { midiToNoteName } from '@audio/music-theory/midi';

midiToNoteName(60); // → 'C4' (Middle C)
midiToNoteName(69); // → 'A4' (440Hz reference)
```

##### `noteNameToMidi(noteName)`

Converts note name to MIDI number.

```javascript
import { noteNameToMidi } from '@audio/music-theory/midi';

noteNameToMidi('C4');  // → 60
noteNameToMidi('A4');  // → 69
noteNameToMidi('C#5'); // → 73
```

##### `midiToFrequency(midiNote)`

Converts MIDI note to frequency in Hz.

```javascript
import { midiToFrequency } from '@audio/music-theory/midi';

midiToFrequency(60); // → 261.63 Hz (Middle C)
midiToFrequency(69); // → 440 Hz (A4)
```

##### `getIntervalName(semitones)`

Gets musical interval name from semitone count.

```javascript
import { getIntervalName } from '@audio/music-theory/midi';

getIntervalName(0);  // → 'Unison'
getIntervalName(7);  // → 'Perfect Fifth'
getIntervalName(12); // → 'Octave'
```

---

### Utilities

#### Audio Context (`utils/audio-context.js`)

##### `getAudioContext()`

Gets the singleton AudioContext instance (creates if doesn't exist).

**Returns:** AudioContext

**Example:**

```javascript
import { getAudioContext } from '@audio/utils/audio-context';

const audioContext = getAudioContext();
console.log(audioContext.sampleRate); // → 44100 or 48000
console.log(audioContext.state);      // → 'suspended' or 'running'
```

##### `unlockAudioContext()`

Unlocks AudioContext on iOS/Safari (requires user interaction).

**Returns:** Promise\<void\>

**Example:**

```javascript
import { unlockAudioContext } from '@audio/utils/audio-context';

// In Svelte component
onMount(() => {
  // Call on first user interaction (required for iOS)
  document.addEventListener('click', () => {
    unlockAudioContext().then(() => {
      console.log('Audio unlocked!');
    });
  }, { once: true });
});
```

---

## 🎹 Complete Example: Synth Voice

Combining multiple modules to create a complete synthesizer voice:

```javascript
import { createOscillator } from '@audio/synthesis/oscillators';
import { createADSREnvelope } from '@audio/synthesis/envelopes';
import { createLowPassFilter } from '@audio/synthesis/filters';
import { createDelay } from '@audio/effects/delay';
import { getAudioContext, unlockAudioContext } from '@audio/utils/audio-context';
import { midiToFrequency } from '@audio/music-theory/midi';

// Unlock audio on iOS
await unlockAudioContext();

const audioContext = getAudioContext();

// Create voice components
const osc1 = createOscillator('sawtooth', 440);
const osc2 = createOscillator('sawtooth', 440 * 1.01); // Slight detune
const envelope = createADSREnvelope({
  attack: 0.01,
  decay: 0.2,
  sustain: 0.6,
  release: 0.8
});
const filter = createLowPassFilter(2000, 4);
const delay = createDelay(0.3, 0.4, 0.3);

// Create mix for 2 oscillators
const oscMix = audioContext.createGain();
oscMix.gain.value = 0.5;

// Connect audio graph:
// osc1 ──┐
//        ├──> oscMix ──> envelope ──> filter ──> delay ──> output
// osc2 ──┘

osc1.connect(oscMix);
osc2.connect(oscMix);
oscMix.connect(envelope.gain);
envelope.connect(filter.filter);
filter.connect(delay.input);
delay.output.connect(audioContext.destination);

// Play note
function playNote(midiNote, duration) {
  const freq = midiToFrequency(midiNote);

  // Set frequency for both oscillators
  osc1.setFrequency(freq);
  osc2.setFrequency(freq * 1.01); // Slight detune

  // Start oscillators (only once)
  if (osc1.oscillator.context.currentTime === 0) {
    osc1.start();
    osc2.start();
  }

  // Trigger envelope
  envelope.trigger(1);

  // Release after duration
  setTimeout(() => envelope.release(), duration);
}

// Play C Major chord
playNote(60, 1000); // C4
setTimeout(() => playNote(64, 1000), 100);  // E4
setTimeout(() => playNote(67, 1000), 200);  // G4
```

---

## 🧪 Testing

### Current Test Coverage

- ✅ **Music Theory**: 152/152 tests passing
  - `scales.test.js`
  - `chords.test.js`
  - `progressions.test.js`
  - `midi.test.js`

- ❌ **Synthesis & Effects**: No tests (TODO for Phase 2)
  - Need tests for oscillators, envelopes, filters
  - Need tests for delay effects
  - Need tests for audio-context utils

### Running Tests

```bash
# Run all audio-core tests
pnpm test -- shared/audio-core

# Run music theory tests only
pnpm test -- shared/audio-core/music-theory

# Watch mode
pnpm test -- shared/audio-core --watch
```

---

## 🔗 Related Documentation

- **[Web Audio API Guide](../../docs/guides/WEB_AUDIO_API_GUIDE.md)** - Web Audio patterns and best practices
- **[Svelte 5 Audio Guide](../../docs/guides/SVELTE5_AUDIO_GUIDE.md)** - Integrating audio with Svelte 5 Runes
- **[Plugin Development Guide](../../docs/guides/PLUGIN_DEVELOPMENT.md)** - Building complete plugins
- **[LoFi Piano Example](../../docs/projects/lofi-piano/)** - Production example using audio-core

---

## 🚀 Roadmap

### Planned Features (Phase 2)

- [ ] **Reverb effect** - Convolution-based reverb
- [ ] **Compressor** - Dynamic range compression
- [ ] **Distortion/Saturation** - Harmonic saturation effects
- [ ] **LFO module** - Low-frequency oscillator for modulation
- [ ] **Noise generator** - White/pink/brown noise
- [ ] **AudioWorklet support** - Off-main-thread processing

### Test Coverage Goals

- [ ] 80%+ coverage for synthesis modules
- [ ] 80%+ coverage for effects modules
- [ ] 100% coverage maintained for music-theory
- [ ] Integration tests for complete audio graphs

---

## 💡 Tips & Best Practices

### Avoiding Clicks and Pops

Always use scheduled parameter changes instead of direct value assignment:

```javascript
// ❌ BAD - Causes clicks/pops
oscillator.frequency.value = 880;

// ✅ GOOD - Smooth transition
const ctx = getAudioContext();
oscillator.frequency.setValueAtTime(880, ctx.currentTime);

// ✅ BETTER - Gradual ramp (no artifacts)
oscillator.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.1);
```

### Memory Management

Always stop and disconnect audio nodes when done:

```javascript
// Stop oscillators before disconnecting
osc.stop();

// Disconnect from all destinations
osc.disconnect();
gainNode.disconnect();
filter.disconnect();
```

### Performance

- Reuse AudioContext (singleton pattern used by `getAudioContext()`)
- Limit active oscillators (polyphony limit recommended: 8-16 voices)
- Use AudioWorklets for heavy DSP (convolution reverb, FFT analysis)
- Profile with Chrome DevTools → Performance → Audio

---

## 📝 Contributing

### Adding New Modules

1. Create module in appropriate directory (`synthesis/`, `effects/`, etc.)
2. Export functions following existing patterns
3. Add JSDoc comments for all exported functions
4. Write unit tests (target: 80% coverage)
5. Update this README with API documentation
6. Add usage examples

### Code Style

- Use ES6 modules (`import`/`export`)
- Follow existing JSDoc comment patterns
- Use `getAudioContext()` for AudioContext access
- Schedule all parameter changes (avoid direct `.value` assignment)
- Return objects with named methods (not classes)

---

**Last Updated**: 2025-11-03
**Version**: 1.0.0
**License**: MIT
**Maintainer**: Din-ZAudioToolLibrary Project

🎛️ **Build amazing audio plugins!** ✨
