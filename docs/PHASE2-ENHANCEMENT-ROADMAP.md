# Phase 2: Enhancement Roadmap

## Overview

Phase 2 focuses on expanding the MIDI Chord Generator with powerful new features that enhance its capabilities and usability. This phase adds four major feature sets.

**Status**: 🚀 Ready to Implement
**Estimated Duration**: 2-3 weeks
**Priority**: Medium (after Phase 1 testing)

---

## Feature 1: MIDI Input Support (External Keyboards)

### Concept

Enable the MIDI Chord Generator to receive input from external MIDI keyboards and controllers. This allows musicians to:
- Play external keyboard and control the app
- Use MIDI controllers for real-time parameter adjustment
- Sync with hardware instruments

### Implementation Details

#### 1.1 MIDI Input Manager

Create `/shared/audio-core/midi/midi-input-manager.js`:

```javascript
/**
 * Manages MIDI input from external keyboards and controllers
 *
 * Features:
 * - Detect available MIDI inputs
 * - Listen for note-on/note-off events
 * - Listen for control change events (CC)
 * - Handle different MIDI input devices
 */

export class MidiInputManager {
  constructor() {
    this.midiAccess = null;
    this.inputs = new Map();
    this.listeners = new Set();
  }

  async initialize() {
    // Request MIDI access from browser
    this.midiAccess = await navigator.requestMIDIAccess();
    this.setupInputs();
    this.midiAccess.onstatechange = this.setupInputs.bind(this);
  }

  setupInputs() {
    // Detect and register all available MIDI inputs
    for (const input of this.midiAccess.inputs.values()) {
      if (!this.inputs.has(input.id)) {
        input.onmidimessage = this.handleMidiMessage.bind(this);
        this.inputs.set(input.id, input);
      }
    }
  }

  handleMidiMessage(event) {
    // Parse MIDI message and dispatch to listeners
    const [status, data1, data2] = event.data;

    if (isNoteOn(status)) {
      this.emit('noteon', { note: data1, velocity: data2 });
    } else if (isNoteOff(status)) {
      this.emit('noteoff', { note: data1 });
    } else if (isControlChange(status)) {
      this.emit('cc', { cc: data1, value: data2 });
    }
  }

  on(event, callback) {
    // Subscribe to MIDI events
  }

  off(event, callback) {
    // Unsubscribe from MIDI events
  }

  getAvailableInputs() {
    // Return list of available MIDI inputs
    return Array.from(this.midiAccess.inputs.values());
  }

  selectInput(inputId) {
    // Switch to specific MIDI input
  }
}
```

#### 1.2 MIDI-to-Chord Controller

Create `/plugins/lofi-piano/web/src/lib/audio/midi-controller.js`:

```javascript
/**
 * Maps MIDI input to chord generation and playback
 *
 * Mappings:
 * - Note on: Select chord (root note)
 * - CC 1: Adjust scale (mod wheel)
 * - CC 64: Sustain pedal
 */

export class MidiChordController {
  constructor(chordGenerator, midiInputManager) {
    this.chordGenerator = chordGenerator;
    this.midiInputManager = midiInputManager;
    this.setupMidiListeners();
  }

  setupMidiListeners() {
    this.midiInputManager.on('noteon', (event) => {
      this.handleNoteOn(event.note, event.velocity);
    });

    this.midiInputManager.on('noteoff', (event) => {
      this.handleNoteOff(event.note);
    });

    this.midiInputManager.on('cc', (event) => {
      this.handleControlChange(event.cc, event.value);
    });
  }

  handleNoteOn(midiNote, velocity) {
    // Map MIDI note to chord
    const noteInScale = midiNote % 12; // Extract pitch class
    this.chordGenerator.setRootNote(noteInScale);
    this.chordGenerator.playSelectedChord(velocity / 127); // Normalize velocity
  }

  handleControlChange(cc, value) {
    if (cc === 1) {
      // Mod wheel: cycle through scales
      const scaleIndex = Math.floor(value / 127 * 15);
      this.chordGenerator.setScaleType(scaleIndex);
    } else if (cc === 64) {
      // Sustain pedal: hold progression
      if (value > 64) {
        this.chordGenerator.holdProgression();
      } else {
        this.chordGenerator.releaseProgression();
      }
    }
  }
}
```

#### 1.3 MIDI Input UI Component

Create `/plugins/lofi-piano/web/src/lib/components/midi/MidiInputSelector.svelte`:

```svelte
<script>
  import { onMount } from 'svelte';

  let selectedInput = $state(null);
  let availableInputs = $state([]);
  let isConnected = $state(false);
  let error = $state(null);

  onMount(async () => {
    try {
      const midiAccess = await navigator.requestMIDIAccess();
      loadInputs(midiAccess);
      midiAccess.onstatechange = (e) => loadInputs(e.currentTarget);
    } catch (err) {
      error = 'MIDI not available: ' + err.message;
    }
  });

  function loadInputs(midiAccess) {
    availableInputs = Array.from(midiAccess.inputs.values())
      .map(input => ({ id: input.id, name: input.name }));
  }

  function handleInputChange(event) {
    selectedInput = event.target.value;
    isConnected = !!selectedInput;
  }
</script>

<div class="midi-selector">
  {#if error}
    <div class="error">{error}</div>
  {:else if availableInputs.length > 0}
    <label>
      <span>MIDI Input:</span>
      <select value={selectedInput} onchange={handleInputChange}>
        <option value="">Select MIDI Device</option>
        {#each availableInputs as input}
          <option value={input.id}>{input.name}</option>
        {/each}
      </select>
    </label>
    {#if isConnected}
      <span class="connected">✓ Connected</span>
    {/if}
  {:else}
    <p>No MIDI devices detected</p>
  {/if}
</div>

<style>
  .midi-selector {
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
  }

  .error {
    color: #e74c3c;
    font-size: 0.9rem;
  }

  .connected {
    color: #27ae60;
    margin-left: 0.5rem;
    font-size: 0.9rem;
  }
</style>
```

### Testing

```javascript
describe('MidiInputManager', () => {
  it('should detect available MIDI inputs', async () => {
    const manager = new MidiInputManager();
    await manager.initialize();

    const inputs = manager.getAvailableInputs();
    expect(inputs).toBeDefined();
  });

  it('should emit noteon events', async () => {
    const manager = new MidiInputManager();
    let noteonEmitted = false;

    manager.on('noteon', () => {
      noteonEmitted = true;
    });

    // Simulate MIDI note-on
    manager.handleMidiMessage({ data: [0x90, 60, 100] });

    expect(noteonEmitted).toBe(true);
  });
});
```

---

## Feature 2: MIDI File Export

### Concept

Export chord progressions as standard MIDI files (.mid) that can be:
- Played in DAWs (Ableton, Logic, etc.)
- Used as basis for further arrangement
- Shared with other musicians

### Implementation Details

#### 2.1 MIDI File Writer

Create `/shared/audio-core/midi/midi-writer.js`:

```javascript
/**
 * Writes MIDI files from chord progressions
 *
 * Features:
 * - Standard .mid format (SMF)
 * - Configurable tempo and time signature
 * - Multiple tracks (one per chord)
 * - Velocity and duration control
 */

export class MidiWriter {
  constructor(progression, options = {}) {
    this.progression = progression;
    this.tempo = options.tempo || 120;
    this.timeSignature = options.timeSignature || [4, 4];
    this.ticksPerBeat = options.ticksPerBeat || 480;
    this.tracks = [];
  }

  write() {
    // Create MIDI header
    const headerChunk = this.createHeaderChunk();

    // Create track for each chord
    const trackChunks = this.progression.map((chord, index) => {
      return this.createChordTrack(chord, index);
    });

    // Combine into MIDI file
    return this.combineMidiChunks(headerChunk, trackChunks);
  }

  createHeaderChunk() {
    // MTrk header with timing information
  }

  createChordTrack(chord, index) {
    // Track with notes from chord
  }

  combineMidiChunks(header, tracks) {
    // Combine into valid MIDI file format
  }

  downloadFile(filename = 'progression.mid') {
    const midiData = this.write();
    const blob = new Blob([midiData], { type: 'audio/midi' });
    // Trigger download
  }
}
```

#### 2.2 Export UI Component

Create `/plugins/lofi-piano/web/src/lib/components/ExportMidi.svelte`:

```svelte
<script>
  let progression = $props();
  let filename = $state('progression');
  let tempo = $state(120);
  let isExporting = $state(false);

  async function handleExport() {
    isExporting = true;
    try {
      const writer = new MidiWriter(progression, { tempo });
      writer.downloadFile(`${filename}.mid`);
    } finally {
      isExporting = false;
    }
  }
</script>

<form onsubmit|preventDefault={handleExport}>
  <input
    type="text"
    bind:value={filename}
    placeholder="progression"
  />
  <input
    type="number"
    bind:value={tempo}
    min="40"
    max="200"
  />
  <button disabled={isExporting}>
    {isExporting ? 'Exporting...' : 'Export as MIDI'}
  </button>
</form>
```

---

## Feature 3: Harmonic Analysis

### Concept

Analyze existing audio to:
- Detect chord progressions
- Suggest harmonies
- Identify key and scale
- Generate variations

### Implementation Details

#### 3.1 Frequency Analyzer

```javascript
/**
 * Analyzes frequency content to detect chords
 */

export class HarmonicAnalyzer {
  constructor(audioContext) {
    this.audioContext = audioContext;
    this.analyser = audioContext.createAnalyser();
    this.analyser.fftSize = 4096;
  }

  async analyzeAudio(audioBuffer) {
    // Perform FFT to get frequency spectrum
    const spectrum = this.getFrequencySpectrum(audioBuffer);

    // Detect pitch from fundamental frequency
    const fundamentalFreq = this.detectPitch(spectrum);

    // Identify closest MIDI note
    const midiNote = frequencyToMidi(fundamentalFreq);

    // Analyze harmonics to detect chord
    const detectedChord = this.detectChord(spectrum, midiNote);

    return {
      fundamentalFrequency: fundamentalFreq,
      estimatedNote: midiToNoteName(midiNote),
      detectedChord,
      confidence: 0.8, // How confident in the detection
    };
  }

  detectChord(spectrum, rootMidi) {
    // Look for harmonic patterns matching known chords
  }

  detectKey(analysisResults) {
    // From multiple chords, infer the key
  }
}
```

---

## Feature 4: Chord Substitution Suggestions

### Concept

Suggest harmonic substitutions:
- Secondary dominants
- Tritone substitutions
- Modal interchange
- Borrowed chords

### Implementation Details

#### 4.1 Substitution Engine

```javascript
/**
 * Suggests harmonic substitutions
 */

export class SubstitutionSuggester {
  constructor(scaleType = 'major') {
    this.scaleType = scaleType;
  }

  suggestSubstitutions(chord, scale) {
    const suggestions = [];

    // Secondary dominants
    suggestions.push(...this.getSecondaryDominants(chord));

    // Tritone substitutions
    suggestions.push(...this.getTritoneSubs(chord));

    // Borrowed chords (modal interchange)
    suggestions.push(...this.getBorrowedChords(chord, scale));

    // Parallel chords
    suggestions.push(...this.getParallelChords(chord));

    return suggestions.sort((a, b) => b.relevance - a.relevance);
  }

  getSecondaryDominants(chord) {
    // For any chord, find its secondary dominant
    // Example: for C chord, secondary dominant is G7 (V7/V)
    return [{
      chord: resolveSecondaryDominant(chord),
      type: 'secondary-dominant',
      relevance: 0.8,
      description: 'Creates tension before resolving back'
    }];
  }

  getTritoneSubs(chord) {
    // Chords that share tritone interval
  }

  getBorrowedChords(chord, scale) {
    // Chords from parallel scale
  }

  getParallelChords(chord) {
    // Same root, different quality
  }
}
```

#### 4.2 UI Component

```svelte
<script>
  import { SubstitutionSuggester } from '@audio/music-theory';

  let selectedChord = $props();
  let scale = $props();

  let suggestions = $derived.by(() => {
    const suggester = new SubstitutionSuggester(scale);
    return suggester.suggestSubstitutions(selectedChord, scale);
  });

  function applySubstitution(suggestion) {
    // Replace chord in progression with suggestion
    selectedChord.substitute(suggestion.chord);
  }
</script>

<div class="substitutions">
  {#each suggestions as suggestion}
    <div class="suggestion">
      <h4>{suggestion.chord.roman}</h4>
      <p>{suggestion.description}</p>
      <button onclick={() => applySubstitution(suggestion)}>
        Use This
      </button>
    </div>
  {/each}
</div>
```

---

## Implementation Order

1. **Week 1**: MIDI Input Support
   - MidiInputManager core
   - MIDI event handling
   - UI selector component
   - Testing

2. **Week 2**: MIDI Export + Harmonic Analysis
   - MIDI file writer
   - Frequency analyzer
   - Pitch detection
   - Testing

3. **Week 3**: Chord Substitution
   - Substitution engine
   - UI component
   - Integration testing
   - Documentation

---

## Testing Strategy

### Unit Tests
- MIDI input parsing
- MIDI file generation
- Frequency to note conversion
- Substitution suggestions

### Integration Tests
- MIDI input → Chord selection
- Chord progression → MIDI file
- Audio upload → Chord detection
- Substitution → Progression update

### E2E Tests
- Full MIDI input workflow
- Export and import cycle
- Audio analysis workflow

---

## Documentation

- MIDI Input Setup Guide
- MIDI File Export Tutorial
- Harmonic Analysis Guide
- Chord Substitution Examples

---

## Success Criteria

- ✅ MIDI input detected and working
- ✅ MIDI files export with correct timing
- ✅ Harmonic analysis accurate (>80% chord detection)
- ✅ Substitution suggestions musically valid
- ✅ All tests passing
- ✅ Documentation complete

---

**Document Status**: 📋 Phase 2 Roadmap
**Target Start**: After Phase 1 completion
**Estimated Duration**: 2-3 weeks
