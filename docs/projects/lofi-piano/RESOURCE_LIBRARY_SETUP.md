# Complete Resource Library Setup Guide

**Purpose**: Populate empty `resources/` directories with educational materials for learning audio DSP

---

## 📁 Directory Structure to Create

```bash
resources/
├── impulse-responses/          # Convolution reverb IRs
│   ├── rooms/                 # Small spaces
│   ├── halls/                 # Large concert halls
│   ├── plates/                # Plate reverbs
│   └── springs/               # Spring reverbs
├── samples/                   # Test audio files
│   ├── piano/                 # Piano samples
│   ├── drums/                 # Drum hits
│   ├── synth/                 # Synthesizer tones
│   └── test-signals/          # Sine waves, noise, etc.
├── examples/                  # Code examples
│   ├── web-audio/            # Web Audio API patterns
│   ├── svelte/               # Svelte UI components
│   └── dsp-algorithms/       # Pure DSP math
└── presets/                   # Factory presets
    ├── piano/                 # LoFi Piano presets
    └── chords/                # Chord progressions
```

---

## 🎵 Impulse Responses (Educational Value: HIGH)

### What are Impulse Responses?
**Educational**: An IR captures the acoustic signature of a space. Convolving audio with IR = placing that audio in the space.

### Where to Get Free IRs

1. **Open AIR** (Acoustics In Research)
   - URL: https://www.openair.hosted.york.ac.uk/
   - License: Creative Commons
   - Contains: Concert halls, churches, stadiums
   - Download: `resources/impulse-responses/halls/`

2. **99Sounds**
   - URL: https://99sounds.org/free-reverb-impulse-responses/
   - License: Free for personal/commercial
   - Contains: Rooms, plates, creative spaces
   - Download: `resources/impulse-responses/rooms/`

3. **Voxengo Free IRs**
   - URL: https://www.voxengo.com/impulses/
   - License: Free
   - Contains: Studio spaces, halls
   - Download: `resources/impulse-responses/`

### How to Use in Code

```javascript
// Load impulse response
async function loadImpulseResponse(url, audioContext) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  // Create convolver
  const convolver = audioContext.createConvolver();
  convolver.buffer = audioBuffer;
  
  return convolver;
}

// Usage in LoFi Piano
const hallReverb = await loadImpulseResponse(
  '/resources/impulse-responses/halls/concert-hall.wav',
  audioContext
);

// Connect: piano → hallReverb → output
pianoOutput.connect(hallReverb);
hallReverb.connect(audioContext.destination);
```

---

## 🎹 Sample Audio Files (Educational Value: HIGH)

### Test Signals (Create with Audacity/Code)

**Create**: `resources/samples/test-signals/`

1. **sine-440hz.wav** (A4 concert pitch)
   ```javascript
   // Generate with Web Audio API
   const sampleRate = 44100;
   const duration = 1; // 1 second
   const frequency = 440; // Hz
   
   const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
   const data = buffer.getChannelData(0);
   
   for (let i = 0; i < data.length; i++) {
     data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate);
   }
   
   // Export as WAV (use library like audiobuffer-to-wav)
   ```

2. **white-noise.wav** (Full spectrum)
3. **pink-noise.wav** (Natural spectrum)
4. **sweep-20-20k.wav** (Frequency sweep for testing filters)

### Piano Samples

**Free Sources**:
1. **Salamander Grand Piano** (CC BY)
   - URL: https://freepats.zenvoid.org/Piano/acoustic-grand-piano.html
   - 48kHz, 24-bit, multi-velocity
   - Download: Select notes to `resources/samples/piano/`

2. **University of Iowa MIS** (Public Domain)
   - URL: http://theremin.music.uiowa.edu/MIS.html
   - Single notes, great for testing
   - Download: `resources/samples/piano/`

### Educational Testing Workflow

```javascript
/**
 * Test saturation effect with sine wave
 * Educational: Pure sine → see harmonics added
 */
async function testSaturation() {
  const sineBuffer = await loadSample('/resources/samples/test-signals/sine-440hz.wav');
  const source = audioContext.createBufferSource();
  source.buffer = sineBuffer;
  
  // Create saturation
  const saturation = createSaturation(audioContext);
  saturation.setAmount(0.5); // 50% saturation
  
  // Connect: source → saturation → destination
  source.connect(saturation.input);
  saturation.output.connect(audioContext.destination);
  
  source.start();
  
  // EDUCATIONAL: Use spectrum analyzer to see new harmonics at 880Hz, 1320Hz, etc.
}
```

---

## 💾 Factory Presets (Educational Value: MEDIUM)

### Preset File Format (JSON)

**Create**: `resources/presets/piano/warm-tape.json`

```json
{
  "name": "Warm Tape",
  "description": "Classic lo-fi hip-hop character with tape saturation and vinyl warmth",
  "category": "Vintage",
  "author": "Din-Z Audio",
  "version": "1.0.0",
  "parameters": {
    "masterVolume": 0.75,
    "age": {
      "amount": 45,
      "description": "Moderate vintage warmth"
    },
    "roomMics": {
      "mix": 0.3,
      "decay": 2.5,
      "description": "Intimate room ambience"
    },
    "tubeSaturation": {
      "warmth": 35,
      "description": "Subtle tube coloration"
    },
    "envelope": {
      "attack": 0.01,
      "decay": 0.3,
      "sustain": 0.7,
      "release": 0.8
    },
    "compression": {
      "threshold": -18,
      "ratio": 3,
      "attack": 0.005,
      "release": 0.15
    }
  },
  "metadata": {
    "created": "2025-10-30",
    "tags": ["lofi", "warm", "vintage", "hip-hop"],
    "bpm": 85,
    "key": "C minor"
  }
}
```

### Preset Manager Implementation

```javascript
/**
 * PresetManager
 * Educational: Shows JSON serialization, localStorage, file I/O
 */
export class PresetManager {
  constructor() {
    this.presets = new Map();
    this.currentPreset = null;
  }
  
  async loadFactoryPresets() {
    const presetFiles = [
      '/resources/presets/piano/warm-tape.json',
      '/resources/presets/piano/clean-digital.json',
      '/resources/presets/piano/heavy-aged.json'
    ];
    
    for (const file of presetFiles) {
      const preset = await this.loadPreset(file);
      this.presets.set(preset.name, preset);
    }
  }
  
  async loadPreset(url) {
    const response = await fetch(url);
    return await response.json();
  }
  
  applyPreset(presetName, audioState) {
    const preset = this.presets.get(presetName);
    if (!preset) return;
    
    // Apply parameters to audio state
    audioState.setMasterVolume(preset.parameters.masterVolume);
    audioState.setAGE(preset.parameters.age.amount);
    audioState.setRoomMics(
      preset.parameters.roomMics.mix,
      preset.parameters.roomMics.decay
    );
    // ... etc
    
    this.currentPreset = preset;
  }
  
  savePreset(name, audioState) {
    const preset = {
      name,
      description: '',
      category: 'User',
      parameters: audioState.exportParameters(),
      metadata: {
        created: new Date().toISOString(),
        tags: []
      }
    };
    
    this.presets.set(name, preset);
    
    // Save to localStorage
    localStorage.setItem(
      `lofi-piano-preset-${name}`,
      JSON.stringify(preset)
    );
  }
}
```

---

## 📚 Code Examples (Educational Value: CRITICAL)

### Web Audio Patterns

**Create**: `resources/examples/web-audio/basic-oscillator.js`

```javascript
/**
 * LEARNING EXAMPLE: Basic Oscillator
 * 
 * Concepts taught:
 * - AudioContext creation
 * - OscillatorNode
 * - GainNode for volume
 * - Connecting nodes
 * - Starting/stopping
 */

// 1. Create audio context (once per app)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// 2. Create oscillator (sound source)
const oscillator = audioContext.createOscillator();
oscillator.type = 'sine'; // sine, square, sawtooth, triangle
oscillator.frequency.value = 440; // A4 (concert pitch)

// 3. Create gain node (volume control)
const gainNode = audioContext.createGain();
gainNode.gain.value = 0.3; // 30% volume (0-1 range)

// 4. Connect nodes: oscillator → gain → speakers
oscillator.connect(gainNode);
gainNode.connect(audioContext.destination);

// 5. Start playing
oscillator.start();

// 6. Stop after 1 second
setTimeout(() => {
  oscillator.stop();
}, 1000);

/**
 * KEY LEARNING POINTS:
 * - Nodes are connected in chains (signal flow)
 * - destination = your speakers
 * - Oscillators are one-time use (create new for each note)
 * - Gain controls volume (0 = silent, 1 = full)
 */
```

**Create**: `resources/examples/web-audio/envelope.js`

```javascript
/**
 * LEARNING EXAMPLE: ADSR Envelope
 * 
 * Concepts taught:
 * - Parameter automation
 * - Time-based control
 * - Smooth transitions
 * - Musical note shaping
 */

function playNoteWithEnvelope(frequency, duration) {
  const now = audioContext.currentTime;
  
  // ADSR parameters (in seconds)
  const attack = 0.01;  // Fast attack
  const decay = 0.1;    // Short decay
  const sustain = 0.7;  // 70% level
  const release = 0.3;  // Medium release
  
  // Create oscillator + gain
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.frequency.value = frequency;
  
  // Connect
  osc.connect(gain);
  gain.connect(audioContext.destination);
  
  // ATTACK: 0 → 1 over attack time
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(1, now + attack);
  
  // DECAY: 1 → sustain level over decay time
  gain.gain.linearRampToValueAtTime(sustain, now + attack + decay);
  
  // SUSTAIN: Hold at sustain level until note off
  const noteOffTime = now + duration;
  gain.gain.setValueAtTime(sustain, noteOffTime);
  
  // RELEASE: sustain → 0 over release time
  gain.gain.linearRampToValueAtTime(0, noteOffTime + release);
  
  // Start/stop oscillator
  osc.start(now);
  osc.stop(noteOffTime + release);
}

// Test: Play middle C for 1 second
playNoteWithEnvelope(261.63, 1.0);

/**
 * KEY LEARNING POINTS:
 * - setValueAtTime() = instant change
 * - linearRampToValueAtTime() = smooth change
 * - All times are absolute (audioContext.currentTime + offset)
 * - Envelope makes sound musical (vs. abrupt on/off)
 */
```

---

## 🎓 Learning Path Integration

### Beginner Week 1: Basic Web Audio
1. Study: `resources/examples/web-audio/basic-oscillator.js`
2. Task: Create triangle wave at 220Hz (A3)
3. Task: Add volume control with slider
4. Test: Use test signals to verify output

### Beginner Week 2: Envelopes
1. Study: `resources/examples/web-audio/envelope.js`
2. Task: Implement ADSR with 4 knobs
3. Task: Visualize envelope with SVG
4. Test: Compare to EnvelopeGraph component

### Intermediate Week 3-4: Effects
1. Study: Existing saturation.js, reverb.js
2. Task: Build simple delay effect
3. Task: Load impulse response for reverb
4. Test: A/B test with professional plugins

### Advanced Week 5-6: Signal Chain
1. Study: AGE effect implementation
2. Task: Build complete effect chain
3. Task: Create preset system
4. Test: Performance profiling

---

## 🚀 Quick Setup Script

```bash
#!/bin/bash
# setup-resources.sh
# Run this to populate resources directory

cd resources/

# Create directories
mkdir -p impulse-responses/{rooms,halls,plates,springs}
mkdir -p samples/{piano,drums,synth,test-signals}
mkdir -p examples/{web-audio,svelte,dsp-algorithms}
mkdir -p presets/{piano,chords}

# Download Open AIR sample IRs (requires curl)
echo "Downloading sample impulse responses..."
curl -o impulse-responses/halls/york-minster.wav \
  "https://www.openairlib.net/sites/default/files/auralization/data/manchester.wav"

# Generate test signals with ffmpeg
echo "Generating test signals..."
ffmpeg -f lavfi -i "sine=frequency=440:duration=1" -ar 44100 samples/test-signals/sine-440hz.wav
ffmpeg -f lavfi -i "anoisesrc=d=1:c=white:r=44100:a=0.5" samples/test-signals/white-noise.wav

echo "✓ Resources directory populated!"
echo "Next: Copy example files from docs to resources/examples/"
```

---

## ✅ Completion Checklist

- [ ] IRs downloaded (at least 3 different spaces)
- [ ] Test signals generated (sine, noise, sweep)
- [ ] Piano samples acquired (at least 1 octave)
- [ ] 3 factory presets created (Clean, Warm, Heavy)
- [ ] Code examples documented
- [ ] Learning path integrated with examples
- [ ] README.md updated with resource info

**With resources in place, you have a complete educational audio development environment!** 🎉
