# LoFi Piano - Quick Start Guide

**A practical 5-minute guide to understanding the LoFi Piano plugin project.**

---

## 🎯 What Are We Building?

A **nostalgic lo-fi piano synthesizer** for hip-hop beats with:
- 3 detuned oscillators (warm, chorus-like sound)
- ADSR envelope (attack, decay, sustain, release)
- Tape saturation (vintage warmth)
- Compressor (dynamic control)
- Reverb (spatial effects)
- Interactive keyboard UI + parameter knobs

**Result**: Sounds like a vintage 70s-80s piano through warm analog gear.

---

## 🏗️ Architecture at a Glance

```
Keyboard Input (88 keys)
    ↓
Piano Voice (3 detuned oscillators + ADSR envelope)
    ↓
Saturation Effect (tape warmth)
    ↓
Compressor (dynamic control)
    ↓
Reverb (space)
    ↓
Speakers 🔊
```

---

## 📁 Project Structure

```
plugins/lofi-piano/web/           # Your plugin here
├── src/
│   ├── App.svelte               # Main UI (import shared components)
│   ├── components/
│   │   ├── PianoKeyboard.svelte # 88-key keyboard
│   │   ├── ControlPanel.svelte  # 6 parameter knobs
│   │   └── WaveformVisualizer.svelte # Real-time spectrum
│   ├── audio/
│   │   ├── piano-voice.js       # Core piano synthesis
│   │   ├── effect-chain.js      # Audio routing
│   │   └── midi-manager.js      # MIDI input
│   ├── stores/
│   │   └── audio-state.js       # Svelte $state for parameters
│   └── utils/
│       └── note-to-frequency.js # MIDI ↔ Hz conversion
│
├── src/lib/ (imports from shared/)
│   ├── @audio/synthesis/oscillators.js      # Oscillator patterns
│   ├── @audio/synthesis/envelopes.js        # ADSR envelope
│   ├── @audio/effects/saturation.js         # To be created
│   ├── @audio/effects/compression.js        # To be created
│   ├── @audio/effects/reverb.js             # To be created
│   ├── @ui/controls/Knob.svelte             # Parameter knobs
│   ├── @ui/controls/Slider.svelte           # Sliders
│   └── @ui/controls/Button.svelte           # Buttons
│
└── public/
    └── index.html               # Entry point
```

---

## ⚡ Key Technologies

| Tech | Purpose | Where to Learn |
|------|---------|---|
| **Web Audio API** | Native browser audio engine | @quillopy[web-audio] or MDN docs |
| **Svelte 5 Runes** | Reactive UI state management | @svelte docs or svelte.dev |
| **JavaScript (ES6+)** | Core logic and audio modules | MDN or @quillopy[javascript] |

---

## 🎵 Audio Concepts to Understand

### 1. Oscillators
Generate waveforms (sine, square, sawtooth, triangle). Three oscillators slightly detuned = warm chorus effect.

**Pattern**:
```javascript
const osc = audioContext.createOscillator();
osc.frequency.value = 440; // A note
osc.type = 'sine';
osc.connect(gainNode);
osc.start();
```

### 2. ADSR Envelope
Controls how a note evolves over time:
- **A**ttack: Fade in (0.01-0.1s for piano)
- **D**ecay: Fade to sustain level (0.2-0.5s)
- **S**ustain: Hold level while key pressed (0-100%)
- **R**elease: Fade out after key released (1-3s)

### 3. Saturation (Waveshaper)
Adds harmonic distortion for vintage warmth.

**Pattern**:
```javascript
const saturation = audioContext.createWaveShaper();
saturation.curve = makeSaturationCurve(0.5); // 0=none, 1=heavy
```

### 4. Compressor
Reduces dynamic range (keeps loud notes from dominating).

**Pattern**:
```javascript
const compressor = audioContext.createDynamicsCompressor();
compressor.threshold.value = -24; // dB
compressor.ratio.value = 4; // 4:1 compression ratio
```

### 5. Reverb
Adds spatial effects (echo/reflections).

**Pattern** (two approaches):
- **ConvolverNode**: Use recorded room impulse responses
- **Delay Network**: Chain delays with feedback (simple but effective)

---

## 🛠️ Development Workflow

### Day 1-2: Foundation
1. Generate plugin: `pnpm create-plugin`
2. Study `plugins/_template/web/src/App.svelte`
3. Build `piano-voice.js` with 3 oscillators
4. Test with simple Svelte button: play/stop

### Day 3-4: Effects
1. Create saturation, compression, reverb modules
2. Wire audio graph in `effect-chain.js`
3. Validate each effect works in isolation

### Day 5-7: UI
1. Import Knob components from `@ui/controls/`
2. Create `ControlPanel.svelte` with 6 knobs
3. Create `PianoKeyboard.svelte` with 88 keys
4. Bind knobs to audio parameters using Svelte $state

### Day 8-10: Polish
1. Tune parameters for warm, nostalgic sound
2. Optimize CPU usage
3. Add preset system
4. Create documentation

---

## 💡 Svelte 5 Runes Quick Reference

**State** - Reactive variable that triggers re-renders:
```svelte
<script>
  let frequency = $state(440);
  // Changes to 'frequency' automatically update the UI
</script>

<input bind:value={frequency} />
```

**Derived** - Computed value that auto-updates:
```svelte
<script>
  let frequency = $state(440);
  let noteDisplay = $derived(frequencyToNote(frequency));
</script>

<p>Note: {noteDisplay}</p>
```

**Effect** - Side effect when state changes:
```svelte
<script>
  let frequency = $state(440);
  $effect(() => {
    oscillator.frequency.value = frequency;
  });
</script>
```

---

## 🎹 Using the Keyboard UI

Once complete, the plugin will support:
- **Mouse**: Click keys to play
- **Computer Keyboard**: Z-M for notes, Up/Down for octave
- **MIDI**: Connect MIDI controller for live input
- **Touch**: Mobile piano keyboards

---

## 🔧 Common Commands

```bash
# Start development server (hot reload)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run linting
npx eslint "**/*.{js,svelte}" --fix

# Format code
npx prettier --write "**/*.{js,svelte,css,md}"
```

---

## 📊 How to Test During Development

### Test Audio Output
```javascript
// In browser console after `pnpm dev`:
const piano = window.pianoPlugin; // If exported globally
piano.play({ note: 60, velocity: 100, duration: 1000 });
```

### Check Audio Graph
```javascript
// Inspector shows all connected nodes
const ctx = window.audioContext;
console.log('Audio Context State:', ctx.state);
console.log('Current Time:', ctx.currentTime);
```

### Monitor CPU Usage
- Open DevTools (F12)
- Perf tab → Record → Play note → Stop
- Look for "Main Thread" peak (target: < 15%)

---

## 📚 What to Read First

1. **This file** (you're reading it!)
2. `docs/LOFI_PIANO_ROADMAP.md` - Full project breakdown
3. `CLAUDE.md` - Project structure and MCP tools
4. `docs/CODE_QUALITY_GUIDE.md` - Code standards

Then dive into code in this order:
1. Study `plugins/_template/web/` example
2. Look at `shared/audio-core/synthesis/` for patterns
3. Study `shared/ui-components/` for component examples

---

## 🤔 FAQ

**Q: Do I need to know music theory?**
A: Not deeply. Just understand: notes are frequencies (A4 = 440 Hz), ADSR shapes sound envelope, and detuning adds warmth.

**Q: How do I test without MIDI controller?**
A: Use computer keyboard (Z, X, C, V, etc.) or click piano keys in UI.

**Q: What if audio doesn't work in Safari?**
A: Make sure to call `unlockAudioContext()` on first user interaction (required for iOS).

**Q: How do I avoid clicks/pops?**
A: Always use `AudioParam.linearRampToValueAtTime()` instead of direct assignment.

**Q: Is the code ready for VST/AU export?**
A: Not immediately, but the audio logic is portable. Future: JUCE wrapper or Tauri desktop app.

---

## 🚀 Next Steps

1. **Week 1**: Follow the setup and create `piano-voice.js`
2. **Review**: Ask Claude: `@svelte @quillopy[web-audio] help me create a detuned piano voice`
3. **Build**: Implement each sprint systematically
4. **Test**: Use Claude for code review at each phase
5. **Ship**: Create GitHub release when complete

---

## 📞 Getting Help

**Common scenarios**:

- Audio issues? → `@quillopy[web-audio] why is my oscillator not producing sound?`
- UI issues? → `@svelte explain how to bind audio parameters to Knob controls`
- Audio artifacts? → `@quillopy[web-audio] why do I hear clicks when changing gain?`
- Architecture? → `@sequential-thinking design the audio graph for a lo-fi piano`

Use the MCP servers in `.mcp.json` to get expert documentation.

---

**Ready to start? Jump to Week 1 in `LOFI_PIANO_ROADMAP.md`!**

🎹✨
