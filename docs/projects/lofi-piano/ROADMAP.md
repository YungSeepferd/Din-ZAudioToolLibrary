# LoFi Piano Plugin - Development Roadmap

**Project Name**: Nostalgic LoFi Piano
**Purpose**: A vintage, warm piano effect for lo-fi hip-hop beats
**Learning Goals**: Master Svelte 5 Runes, Web Audio synthesis, audio effects chains
**Target Timeline**: 8-12 weeks following the structured learning path

---

## 🎯 Project Overview

The **LoFi Piano** is our first complete plugin to demonstrate all project capabilities: shared audio DSP, UI components, Svelte 5 reactivity, and professional audio design. It's intentionally scoped as a learning project while remaining production-ready.

### Key Characteristics

| Aspect | Details |
|--------|---------|
| **Sound Profile** | Warm, slightly detuned, vintage 70s-80s piano sound |
| **Target Genre** | Lo-fi hip-hop, jazz beats, chill productions |
| **Effect Stack** | Piano synthesis → Detune → Compression → Saturation → Reverb |
| **User Interface** | 6 main controls (velocity, tone, sustain, decay, compression, reverb) |
| **Learning Scope** | Fundamental audio DSP, UI patterns, audio graph design |
| **Plugin Type** | Web-based first; foundation for future VST/AU ports |

### What Makes It "LoFi"

1. **Detuned Oscillators**: Multiple oscillators slightly offset (±10-20 Hz) create chorus/warmth
2. **Gentle Saturation**: Subtle tape saturation adds color and artifacts
3. **Compression**: Light compression keeps dynamics in check
4. **Reverb**: Ambient reverb (verb type) adds space and vintage feel
5. **Envelope Design**: Slower attack, moderate sustain, natural decay

---

## 📚 Learning Path Integration

This project aligns with our **6-phase learning curriculum** (see `docs/LEARNING_PATH.md`):

### Phase 1: Web Audio Fundamentals (Weeks 1-2)
- [ ] Understand AudioContext lifecycle
- [ ] Learn audio nodes and connections
- [ ] Build simple oscillator + gain test
- **Deliverable**: `shared/audio-core/synthesis/piano-voice.js` (single piano voice)

### Phase 2: Audio Graph Design (Weeks 3-4)
- [ ] Design piano voice architecture
- [ ] Implement modular voice object
- [ ] Create effect chain structure
- **Deliverable**: Complete audio routing with all effects

### Phase 3: Svelte 5 Runes (Weeks 5-6)
- [ ] Master $state, $derived, $effect
- [ ] Build interactive UI components
- [ ] Implement parameter binding
- **Deliverable**: Full UI with working knobs/sliders

### Phase 4: Parameter Automation (Weeks 7-8)
- [ ] Smooth parameter changes (no clicks/pops)
- [ ] Real-time frequency modulation
- [ ] Envelope automation
- **Deliverable**: Professional-sounding parameter changes

### Phase 5: Polish & Effects (Weeks 9-10)
- [ ] Add saturation and compression
- [ ] Implement reverb integration
- [ ] Optimize for CPU efficiency
- **Deliverable**: Complete effect chain

### Phase 6: Testing & Documentation (Weeks 11-12)
- [ ] Write component tests
- [ ] Create plugin documentation
- [ ] Performance optimization
- [ ] Cross-browser testing
- **Deliverable**: Production-ready plugin

---

## 🏗️ Architecture Overview

### Audio Graph Design

```
MIDI Input / Keyboard
    ↓
┌─────────────────────────────┐
│   Piano Voice Generator      │
│  (Detuned Oscillators)       │
│  - 3x Oscillators (±detuning)│
│  - ADSR Envelope             │
└──────────┬──────────────────┘
           ↓
    ┌──────────────┐
    │ Gain Node    │
    │ (Velocity)   │
    └──────┬───────┘
           ↓
    ┌──────────────┐
    │ Saturation   │
    │ (Tape Warmth)│
    └──────┬───────┘
           ↓
    ┌──────────────┐
    │ Compressor   │
    │ (Dynamics)   │
    └──────┬───────┘
           ↓
    ┌──────────────┐
    │ Reverb       │
    │ (Space)      │
    └──────┬───────┘
           ↓
    AudioContext.destination
```

### Project Structure (SvelteKit SPA)

```
plugins/lofi-piano/web/
├── src/
│   ├── lib/
│   │   ├── audio/                    # 🎵 Audio DSP modules
│   │   │   ├── synthesis/
│   │   │   │   ├── piano-voice.js    # Core piano voice (3 osc + ADSR)
│   │   │   │   └── voice-pool.js     # Polyphony management
│   │   │   ├── effects/
│   │   │   │   ├── saturation.js     # Tape saturation
│   │   │   │   ├── compression.js    # Dynamic range compression
│   │   │   │   └── reverb.js         # Spatial reverb
│   │   │   ├── effects-chain.js      # Audio graph coordinator
│   │   │   └── context.js            # AudioContext singleton
│   │   ├── components/               # 🎨 UI components
│   │   │   ├── controls/
│   │   │   │   ├── Knob.svelte       # Parameter knob (from @ui or local)
│   │   │   │   ├── Slider.svelte     # Range input
│   │   │   │   └── Button.svelte     # Interactive button
│   │   │   ├── piano/
│   │   │   │   ├── PianoKeyboard.svelte
│   │   │   │   ├── ControlPanel.svelte
│   │   │   │   └── Visualizer.svelte
│   │   │   └── Layout.svelte         # Root layout
│   │   ├── stores/                   # 📊 Reactive state
│   │   │   └── audio-state.svelte.js # Global $state using Svelte 5
│   │   ├── types/                    # 📝 TypeScript types
│   │   │   └── audio.ts
│   │   └── utils/                    # 🔧 Helper functions
│   │       ├── note-to-frequency.js
│   │       ├── midi-manager.js
│   │       └── constants.js
│   ├── routes/
│   │   ├── +page.svelte              # Main SPA page
│   │   └── +layout.svelte            # Root layout wrapper
│   ├── app.html                      # HTML template
│   ├── hooks.client.js               # Client hooks (optional)
│   └── service-worker.js             # PWA support (optional)
├── static/
│   ├── favicon.png
│   └── manifest.json                 # PWA manifest
├── tests/
│   ├── audio.test.js                 # Audio module unit tests
│   └── components.test.js            # Component tests (vitest)
├── package.json
├── svelte.config.js
├── tsconfig.json
├── vite.config.js
├── vitest.config.js                  # Testing configuration
└── .prettierrc / .eslintrc            # Code quality tools

Key: This is a SPA (Single-Page App), NOT a full-stack SvelteKit app
- No server-side routes (no +server.js files)
- No SSR needed (all client-side rendering)
- Minimal SvelteKit overhead
- Can be deployed as static site or standalone

Imports from shared (monorepo):
    ├── @audio/synthesis/oscillators    (if available)
    ├── @audio/synthesis/envelopes      (if available)
    ├── @ui/controls/Knob               (if available)
    ├── @ui/controls/Slider             (if available)
    └── @ui/controls/Button             (if available)

Or create local implementations in src/lib/
```

---

## 🛠️ Development Phases

### Phase 1: Foundation (Week 1-2)

#### Sprint 1.1: Setup & Basic Voice
- [x] Create plugin from template: `pnpm create-plugin`
- [ ] Set up development environment
- [ ] Create `piano-voice.js` with single detuned oscillator
- [ ] Implement basic ADSR envelope
- [ ] Test audio output in browser

**Tasks**:
1. Generate plugin scaffolding
2. Study `plugins/_template/web/` structure
3. Review `shared/audio-core/synthesis/oscillators.js` for patterns
4. Create piano voice module with 3 detuned oscillators
5. Wire up ADSR envelope from `shared/audio-core/synthesis/envelopes.js`
6. Add simple Svelte component for play/stop testing

**Learning Focus**:
- AudioContext lifecycle
- Oscillator node configuration
- Envelope parameter automation
- Avoiding clicks/pops with scheduling

**MCP Usage**: `@svelte explain oscillator detuning patterns`

---

#### Sprint 1.2: Test & Validate
- [ ] Load audio in real browser
- [ ] Test detuning parameters (audition different offsets)
- [ ] Measure CPU load
- [ ] Document audio pipeline

**Learning Focus**:
- Browser AudioContext behavior
- Parameter scheduling
- Performance profiling

---

### Phase 2: Audio Graph (Week 3-4)

#### Sprint 2.1: Build Effect Chain
- [ ] Create saturation effect module (`shared/audio-core/effects/saturation.js`)
- [ ] Create compression effect (`shared/audio-core/effects/compression.js`)
- [ ] Create reverb effect (`shared/audio-core/effects/reverb.js`)
- [ ] Wire effects in proper order

**Tasks**:
1. Research tape saturation algorithm (waveshaper)
2. Implement saturation with input/output gain
3. Study compressor control (threshold, ratio, attack, release)
4. Implement dynamic range compression using GainNode automation
5. Choose reverb approach:
   - Option A: ConvolverNode with sample IRs
   - Option B: Algorithm-based reverb (delay network)
   - Option C: Use simple delay + feedback for lo-fi vibe
6. Connect all effects in chain

**Learning Focus**:
- Waveshaper distortion
- Compressor control signals
- Reverb algorithms or convolution
- Audio routing best practices

**MCP Usage**: `@quillopy[web-audio] how do I implement tape saturation? @svelte how to structure effect modules?`

---

#### Sprint 2.2: Parameter Routing
- [ ] Create `effect-chain.js` coordinator
- [ ] Expose all effect parameters through unified interface
- [ ] Implement smooth parameter automation (no artifacts)

**Learning Focus**:
- Module composition patterns
- AudioParam automation curves
- Ramping vs. scheduling

---

### Phase 3: UI & Interactivity (Week 5-6)

#### Sprint 3.1: Control Panel
- [ ] Create main `ControlPanel.svelte` component
- [ ] Add 6 main control knobs:
  1. **Velocity** (0-127) - how hard keys are struck
  2. **Tone** (0-100) - filter cutoff
  3. **Sustain** (0-100) - sustain level
  4. **Decay** (0.1-5s) - decay time
  5. **Compression** (0-100) - compression amount
  6. **Reverb** (0-100) - reverb mix
- [ ] Import Knob components from `@ui/controls/Knob.svelte`

**Tasks**:
1. Create `audio-state.js` store with Svelte 5 `$state`
2. Bind each knob to audio parameter
3. Implement smooth updates using `$effect()` rune
4. Add parameter labels and units

**Learning Focus**:
- Svelte 5 $state, $derived, $effect runes
- Two-way binding with `bind:value`
- Reactive side effects in audio

**MCP Usage**: `@svelte explain how to create reactive audio parameters with $state and $effect`

---

#### Sprint 3.2: Keyboard Interface
- [ ] Create `PianoKeyboard.svelte` component
- [ ] Implement 88-key piano keyboard UI
- [ ] Add mouse click and computer keyboard support
- [ ] Add octave shift controls

**Tasks**:
1. Design responsive keyboard grid (white/black keys)
2. Implement key press/release events
3. Map computer keyboard to MIDI notes (e.g., Z-M for octave)
4. Add visual feedback (key highlight on press)
5. Implement polyphony (track multiple pressed keys)

**Learning Focus**:
- Complex Svelte component structure
- Event handling and state management
- Visual feedback patterns

---

#### Sprint 3.3: Visualization
- [ ] Create `WaveformVisualizer.svelte` component
- [ ] Display real-time FFT spectrum
- [ ] Show envelope automation

**Tasks**:
1. Use AnalyserNode from Web Audio API
2. Extract frequency data with getByteFrequencyData()
3. Render spectrum bars or waveform
4. Display envelope curve over time

**Learning Focus**:
- AnalyserNode usage
- Canvas rendering for audio visualization
- Real-time data updating

---

### Phase 4: Polish (Week 7-8)

#### Sprint 4.1: Fine-tune Sound
- [ ] Adjust detuning amounts for optimal chorus
- [ ] Tune ADSR envelope for natural feel
- [ ] Adjust compressor threshold/ratio
- [ ] Tune saturation amount
- [ ] Adjust reverb parameters

**Experimentation**:
- Compare different detuning offsets (5Hz, 10Hz, 15Hz)
- A/B test envelope settings
- Audition reverb size/decay

**Reference**: Listen to lo-fi piano samples (YouTube, Spotify)

---

#### Sprint 4.2: CPU Optimization
- [ ] Measure CPU usage under load
- [ ] Optimize oscillator calculations
- [ ] Consider note stealing if too many voices
- [ ] Profile in DevTools

**Learning Focus**:
- Performance analysis
- AudioWorklet (optional, advanced)
- Browser profiling tools

---

### Phase 5: Complete Effects (Week 9-10)

#### Sprint 5.1: Advanced Effects
- [ ] Add LFO modulation (optional):
  - Modulate filter cutoff with slow LFO
  - Modulate reverb with tempo sync
- [ ] Add tone control (low-pass filter)
- [ ] Add dynamics display

**Tasks**:
1. Implement LFO oscillator (slow sine wave)
2. Route to filter cutoff frequency
3. Add LFO rate control
4. Add filter resonance control

---

#### Sprint 5.2: Preset System
- [ ] Create preset save/load functionality
- [ ] Store 10 default presets:
  - Classic Lo-Fi
  - Bright & Clear
  - Dark & Warm
  - Retro 70s
  - Jazz Fusion
  - Cinematic
  - Ambient Pad
  - Funk Groove
  - Percussive
  - Custom (user-editable)
- [ ] Implement localStorage for user presets

**Tasks**:
1. Create preset object format
2. Build preset selector UI
3. Save/load from browser storage
4. Implement preset import/export

---

### Phase 6: Testing & Release (Week 11-12)

#### Sprint 6.1: Testing
- [ ] Unit tests for `piano-voice.js`
- [ ] Component tests for UI (effects, not just snapshots)
- [ ] Browser compatibility testing (Chrome, Firefox, Safari)
- [ ] Mobile testing (touch support)

**Tools**: Vitest, @testing-library/svelte

---

#### Sprint 6.2: Documentation
- [ ] Write README with usage instructions
- [ ] Create video demo (screen recording)
- [ ] Document all parameters
- [ ] Write code comments and function docs
- [ ] Create troubleshooting guide

**Deliverables**:
- `plugins/lofi-piano/web/README.md`
- Function documentation in all `.js` files
- `docs/LOFI_PIANO_GUIDE.md` (user guide)

---

#### Sprint 6.3: Production Build & Optimization
- [ ] Run production build: `pnpm build`
- [ ] Test production build in browser
- [ ] Measure bundle size
- [ ] Optimize large dependencies
- [ ] Create CHANGELOG

**Performance Target**:
- Bundle size: < 500 KB
- Audio latency: < 50 ms
- CPU usage: < 15% (sustained)

---

## 📋 Implementation Checklist

### Core Audio Components

- [ ] `piano-voice.js` - Detuned oscillators + ADSR
- [ ] `saturation.js` - Tape saturation effect
- [ ] `compression.js` - Dynamic range compression
- [ ] `reverb.js` - Reverb effect (choose algorithm)
- [ ] `effect-chain.js` - Audio graph coordinator

### UI Components

- [ ] `ControlPanel.svelte` - 6 main knobs
- [ ] `PianoKeyboard.svelte` - 88-key interface
- [ ] `WaveformVisualizer.svelte` - Real-time spectrum
- [ ] Preset selector component
- [ ] Master volume/pan controls

### Utilities

- [ ] `note-to-frequency.js` - MIDI note conversion
- [ ] `midi-manager.js` - MIDI input handler
- [ ] `audio-state.js` - Global state management
- [ ] Performance profiler

### Testing & Docs

- [ ] Unit tests for audio modules
- [ ] Component tests for UI
- [ ] E2E tests for plugin
- [ ] README with examples
- [ ] Code comments and JSDoc

---

## 🎓 Learning Outcomes

By completing this project, you will:

### Audio Knowledge
- ✅ Understand Web Audio API architecture
- ✅ Design modular audio effects chains
- ✅ Implement synthesis algorithms
- ✅ Optimize audio code for performance
- ✅ Schedule parameters without artifacts

### JavaScript/TypeScript
- ✅ Build modular JavaScript libraries
- ✅ Implement factory patterns
- ✅ Handle async/promises correctly
- ✅ Optimize for performance

### Svelte 5
- ✅ Master reactive state with $state
- ✅ Create derived values with $derived
- ✅ Manage side effects with $effect
- ✅ Build interactive UI components
- ✅ Handle complex component patterns

### UI/UX
- ✅ Design audio plugin interfaces
- ✅ Implement accessible controls
- ✅ Provide real-time feedback
- ✅ Create usable keyboard/MIDI input

### Professional Practices
- ✅ Write clean, documented code
- ✅ Follow audio best practices
- ✅ Version control workflow
- ✅ Test and optimize code
- ✅ Create user documentation

---

## 🚀 Getting Started

### Week 1 - Day 1 Setup

```bash
# Navigate to project
cd /Users/dinz/Coding\ Projects/AudioPlug/Din-ZAudioToolLibrary

# Install dependencies (if not done)
pnpm install

# Create plugin from template
pnpm create-plugin
# Follow prompts:
# - Name: lofi-piano
# - Description: Nostalgic LoFi Piano for Lo-Fi Hip-Hop
# - Author: [Your Name]

# Navigate to plugin
cd plugins/lofi-piano/web

# Start dev server
pnpm dev
```

### Reading Order (Before Starting)

1. `docs/LEARNING_PATH.md` - Overview of 6 phases
2. `CLAUDE.md` - Project structure and tools
3. `docs/PLUGIN_DEVELOPMENT.md` - Detailed plugin guide
4. `docs/CODE_QUALITY_GUIDE.md` - Code standards

### Key Resources

| Topic | Resource |
|-------|----------|
| **Web Audio** | https://www.w3.org/TR/webaudio/, MDN Web Docs |
| **Svelte 5** | https://svelte.dev/docs (use @svelte MCP server) |
| **Audio Design** | https://supercollider.github.io/ (synthesis patterns) |
| **LoFi Sound Design** | YouTube lo-fi producers, Spotify playlists |

---

## 📊 Success Metrics

### Audio Quality
- [ ] Sounds warm and nostalgic
- [ ] No clicks, pops, or artifacts
- [ ] All controls respond smoothly
- [ ] CPU load under 15%

### UI/UX
- [ ] Intuitive control layout
- [ ] Real-time visual feedback
- [ ] Keyboard and MIDI input work
- [ ] Responsive on mobile

### Code Quality
- [ ] All functions documented
- [ ] No linting errors
- [ ] Tests pass
- [ ] Follows project conventions

### Documentation
- [ ] README is clear and complete
- [ ] Code comments are helpful
- [ ] Learning outcomes are documented
- [ ] Examples are provided

---

## 🔗 Related Documents

- [LEARNING_PATH.md](./LEARNING_PATH.md) - 6-phase curriculum
- [PLUGIN_DEVELOPMENT.md](./PLUGIN_DEVELOPMENT.md) - Detailed plugin guide
- [CODE_QUALITY_GUIDE.md](./CODE_QUALITY_GUIDE.md) - Code standards
- [FRAMEWORKS_AND_TOOLS.md](./FRAMEWORKS_AND_TOOLS.md) - Framework reference
- [CLAUDE.md](../CLAUDE.md) - Project context for Claude Code

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-28 | Initial roadmap creation |

---

**Last Updated**: 2025-10-28
**Author**: Senior Audio Plugin Developer
**Status**: Ready for Implementation
