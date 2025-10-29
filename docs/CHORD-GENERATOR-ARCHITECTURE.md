# MIDI Chord Generator - Complete Architecture

**Status**: Architecture Document v1.0
**Created**: 2025-10-29
**Purpose**: Comprehensive system design for the modular MIDI chord generator with music theory foundation

---

## 1. System Overview

The MIDI Chord Generator is a modular, educational system for building chord progressions in web audio applications. It combines a comprehensive music theory engine with interactive UI components to allow musicians to:

- Select a musical key and scale type
- View all harmonically compatible chords (diatonic chords)
- Create chord progressions with smooth voice leading
- Play chords using the integrated PianoKeyboard
- Learn music theory concepts while building progressions

### Core Architecture Principle

**Separation of Concerns**: The system is divided into three independent layers that communicate through well-defined interfaces:

```
┌─────────────────────────────────────────────────────────────┐
│                    UI LAYER                                 │
│  (Svelte 5 Components - @audio/chord-generator-ui)          │
│  ┌──────────────┬──────────────┬──────────────────────────┐ │
│  │ChordSelector │ChordDisplay  │ProgressionBuilder        │ │
│  │(key/scale)   │(available)   │ (sequences & playback)   │ │
│  └──────────────┴──────────────┴──────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
         ↓ imports from ↓ (dependency injection)
┌─────────────────────────────────────────────────────────────┐
│              MUSIC THEORY LAYER                             │
│  (@audio/music-theory - Pure JavaScript, Framework-Agnostic)│
│  ┌──────────┬──────────┬──────────┬───────────────────────┐ │
│  │ scales   │ chords   │ midi     │ progressions          │ │
│  │ (12 types│(9 types, │(frequency│(harmonic functions,  │ │
│  │ + modes) │inversions│ convert, │ cadences, templates) │ │
│  │          │v.leading)│transpose)│                       │ │
│  └──────────┴──────────┴──────────┴───────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
         ↓ uses ↓
┌─────────────────────────────────────────────────────────────┐
│             WEB AUDIO INTEGRATION LAYER                     │
│  (Existing Modules - synthesis, filters, PianoKeyboard)    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ PianoKeyboard.svelte (plays MIDI notes)              │  │
│  │ AudioState (manages oscillator, effects, routing)   │  │
│  │ Synthesis: Oscillators, Envelopes                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Decision | Rationale | Implementation |
|----------|-----------|-----------------|
| **Pure JS Music Theory** | Framework-agnostic, reusable across Vue/React/etc., testable independently | @audio/music-theory uses no external dependencies |
| **Svelte 5 Runes for UI** | Reactive without complexity, fine-grained reactivity matches audio parameter updates | $state, $derived, $effect for responsive controls |
| **Diatonic Chord Focus** | Harmonically coherent by definition (all from same scale), educational (teaches scale/chord relationship) | generateDiatonicChords() returns 7 chords per key |
| **Voice Leading Integration** | Smooth transitions = better sound + easier to play + professional feel | calculateVoiceLeading() applied automatically in progressions |
| **Modular Components** | Each component solves one problem, can be used independently or together | ChordSelector, ChordDisplay, ProgressionBuilder all self-contained |

---

## 2. Music Theory Layer (@audio/music-theory)

This layer provides all music theory calculations and transformations. It is **completely independent** of any UI framework and can be used in Node.js, browsers, or any JavaScript environment.

### 2.1 Module Structure

```
shared/audio-core/music-theory/
├── index.js              # Public API exports
├── scales.js            # Scale definitions and generation
├── chords.js            # Chord templates and voice leading
├── midi.js              # MIDI/frequency conversions
└── progressions.js      # Progression generation and analysis
```

### 2.2 Core Modules Reference

#### **scales.js** - Scale System

Provides all 13 scale types with interval patterns:

```javascript
import { generateScale, getScaleInfo, getAvailableScales } from '@audio/music-theory';

// List all available scales
const scaleTypes = getAvailableScales();
// Returns: ['major', 'minorNatural', 'minorHarmonic', 'minorMelodic',
//           'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian',
//           'majorPentatonic', 'minorPentatonic', 'blues']

// Generate scale: MIDI notes from root
const cMajor = generateScale(60, 'major', 2);  // 2 octaves
// Returns: [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83]
//          C5, D5, E5, F5, G5, A5, B5, C6, D6, E6, F6, G6, A6, B6

// Get scale metadata
const info = getScaleInfo('major');
// Returns: {
//   name: 'Major Scale',
//   intervals: [0, 2, 4, 5, 7, 9, 11],
//   pattern: 'W-W-H-W-W-W-H',
//   degrees: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
//   description: 'Happy, bright, resolved',
//   numNotes: 7,
//   commonUsage: 'Most common, foundational scale...'
// }
```

**Key Exports**:
- `SCALE_DEFINITIONS`: All 13 scale types with intervals and metadata
- `generateScale(rootMidi, scaleType, octaves)`: Generate MIDI notes
- `getScaleInfo(scaleType)`: Get scale metadata
- `getAvailableScales()`: List all available scales
- `getNoteName(midiNote, useSharps)`: Convert MIDI → note name
- `getScaleNoteNames()`: Get human-readable scale notes
- `getScaleDegree()`: Get Roman numeral for scale degree

#### **chords.js** - Chord System

Generates chords with inversions and smooth voice leading:

```javascript
import {
  generateChord,
  generateDiatonicChords,
  calculateVoiceLeading
} from '@audio/music-theory';

// Generate single chord
const cMajor = generateChord(60, 'major');
// Returns: [60, 64, 67] → C5, E5, G5

// Generate all 7 diatonic chords for a key
const chords = generateDiatonicChords(60, 'major');
// Returns: [
//   { degree: 1, roman: 'I', root: 60, notes: [60, 64, 67], quality: 'major' },
//   { degree: 2, roman: 'ii', root: 62, notes: [62, 65, 69], quality: 'minor' },
//   { degree: 3, roman: 'iii', root: 64, notes: [64, 67, 71], quality: 'minor' },
//   ... (4 more chords)
// ]

// Calculate voice leading (best inversion for smooth transition)
const voiceLeading = calculateVoiceLeading(
  [60, 64, 67],  // C Major
  [65, 69, 72]   // F Major (4th)
);
// Returns: {
//   bestInversion: 0,
//   minDistance: 5,
//   suggestedNotes: [65, 69, 72]  // Optimal voicing
// }
```

**Key Exports**:
- `CHORD_TEMPLATES`: 9 chord types (major, minor, dim, aug, maj7, dom7, min7, etc.)
- `DIATONIC_CHORD_QUALITIES`: Harmonic functions for each scale degree
- `generateChord(rootMidi, chordType)`: Generate chord notes
- `generateDiatonicChords(rootMidi, scaleType)`: Generate all 7 chords in key
- `invert(chordNotes, inversion)`: Apply chord inversion
- `calculateVoiceLeading(fromChord, toChord)`: Find smooth transition
- `getChordInfo()`: Get chord metadata
- `getAvailableChords()`: List all chord types

#### **midi.js** - MIDI Utilities

Convert between MIDI numbers, note names, and frequencies:

```javascript
import {
  midiToNoteName,
  noteNameToMidi,
  midiToFrequency,
  transpose,
  getIntervalName
} from '@audio/music-theory';

// MIDI ↔ Note name conversions
midiToNoteName(60);           // "C5" (Middle C)
noteNameToMidi('C5');         // 60
noteNameToMidi('F#3');        // 42

// MIDI ↔ Frequency conversions
midiToFrequency(69);          // 440 (A4, concert pitch)
frequencyToMidi(440);         // 69

// Transposition
transpose(60, 5);             // 65 (C5 → F5, perfect 4th)
transpose([60, 64, 67], 7);   // [67, 71, 74] (C Major → G Major)

// Interval names
getIntervalName(0);           // "unison"
getIntervalName(7);           // "perfect 5th"
getIntervalName(12);          // "octave"
```

**Key Exports**:
- `MIDI_REFERENCE_NOTES`: Standard MIDI reference points
- `midiToNoteName()`: MIDI number → note name
- `noteNameToMidi()`: Note name → MIDI number
- `midiToFrequency()`: MIDI → Hz (equal temperament)
- `frequencyToMidi()`: Hz → MIDI
- `transpose()`: Transpose notes by semitones
- `getIntervalName()`: Semitone distance → interval name
- `clampMidi()`, `isInPianoRange()`: Validation utilities

#### **progressions.js** - Chord Progression System

Generate progressions with harmonic function analysis:

```javascript
import {
  generateProgression,
  analyzeChordFunction,
  getProgressionsByGenre,
  PROGRESSION_TEMPLATES
} from '@audio/music-theory';

// Generate progression with voice leading
const progression = generateProgression(60, 'major', ['I', 'IV', 'V', 'I']);
// Returns: [
//   { roman: 'I', notes: [60, 64, 67], function: 'tonic', voiceLeadingDistance: 0 },
//   { roman: 'IV', notes: [65, 69, 72], function: 'subdominant', voiceLeadingDistance: 5 },
//   { roman: 'V', notes: [67, 71, 74], function: 'dominant', voiceLeadingDistance: 3 },
//   { roman: 'I', notes: [67, 72, 76], function: 'tonic', voiceLeadingDistance: 5 }
// ]

// Analyze harmonic function
const func = analyzeChordFunction('V', 'major');
// Returns: {
//   primary: 'dominant',
//   secondary: [],
//   qualities: ['unstable', 'tension']
// }

// Get progressions by genre
const jazzProgressions = getProgressionsByGenre('jazz');
// Returns all progressions with 'jazz' in genre field

// Available progression templates
console.log(PROGRESSION_TEMPLATES.popProgression);
// Returns: {
//   name: 'Popular Pop Progression',
//   roman: ['I', 'V', 'vi', 'IV'],
//   description: 'One of the most common progressions in modern pop',
//   genre: 'pop, rock',
//   feel: 'uplifting, energetic'
// }
```

**Key Exports**:
- `HARMONIC_FUNCTIONS`: Tonic, subdominant, dominant, pre-dominant definitions
- `PROGRESSION_TEMPLATES`: 13 common progressions (pop, jazz, blues, classical)
- `generateProgression()`: Create progression with voice leading
- `analyzeChordFunction()`: Get harmonic function
- `analyzeVoiceLeading()`: Analyze progression quality
- `getProgressionsByGenre()`: Filter by genre

### 2.3 Data Flow

**State Management in Music Theory Layer**:

The music theory layer is **stateless** - all functions are pure (same input → same output):

```javascript
// No side effects, purely functional
const chords = generateDiatonicChords(60, 'major');  // Same result every time
const progression = generateProgression(60, 'major', ['I', 'IV', 'V']);  // Deterministic
```

This design allows:
- Easy testing (no mock state)
- Predictable behavior
- Reusability in different UI frameworks
- Server-side usage (Node.js, Deno, etc.)

---

## 3. UI Layer - Svelte 5 Components

Interactive components for building chord progressions. These components import from `@audio/music-theory` and use Svelte 5 Runes for reactivity.

### 3.1 Component Architecture

```
@audio/chord-generator-ui/
├── ChordSelector.svelte       # Key + Scale selection
├── ChordDisplay.svelte        # Show available diatonic chords
├── ProgressionBuilder.svelte  # Create chord sequences
└── ChordGenerator.svelte      # Main container combining all above
```

### 3.2 Component Specifications

#### **ChordSelector.svelte**

**Purpose**: Select the musical key and scale type

**Props**:
```javascript
let {
  rootMidi = 60,              // MIDI note for root (C5 = 60)
  scaleType = 'major',        // Scale type
  onKeyChange = undefined,    // Callback when key changes
  onScaleChange = undefined,  // Callback when scale changes
} = $props();
```

**Features**:
- Dropdown for 12 chromatic notes (C, C#, D, ... B)
- Dropdown for 13 scale types (major, minor variants, modes, pentatonic, blues)
- Visual feedback showing selected key (e.g., "C Major")
- Displays scale info (pattern, common usage)

**Internal State** ($state):
- `selectedRoot`: MIDI note of selected key
- `selectedScale`: Current scale type
- `showScaleInfo`: Toggle scale description display

**Effects** ($effect):
- When key/scale change, broadcast via `onKeyChange` and `onScaleChange` callbacks
- Update derived state (scale notes, available chords list)

**Usage Example**:
```svelte
<script>
  import ChordSelector from '@audio/chord-generator-ui/ChordSelector.svelte';
  let currentKey = $state(60);
  let currentScale = $state('major');

  function handleKeyChange(midi) {
    currentKey = midi;
    // Trigger: regenerate diatonic chords
  }
</script>

<ChordSelector
  bind:rootMidi={currentKey}
  bind:scaleType={currentScale}
  onKeyChange={handleKeyChange}
/>
```

#### **ChordDisplay.svelte**

**Purpose**: Display all 7 diatonic chords available in the selected key/scale

**Props**:
```javascript
let {
  rootMidi = 60,
  scaleType = 'major',
  selectedChordRoman = undefined,  // Which chord is selected
  onChordSelect = undefined,       // Callback when user selects chord
  onChordPlay = undefined,         // Callback to play chord
} = $props();
```

**Features**:
- Display 7 diatonic chords in a grid/row layout
- Show chord: Roman numeral, quality (maj/min/dim), notes, function
- Visual highlighting of selected chord
- "Play" button for each chord
- Tooltip showing harmonic function (Tonic, Subdominant, Dominant, etc.)

**Internal State** ($state):
- `chords`: Array of diatonic chords (regenerated when key/scale change)
- `hoveredChord`: Visual feedback on hover
- `selectedChord`: User selection

**Derived State** ($derived):
- `diatonicChords`: From root/scale via generateDiatonicChords()
- `selectedChordNotes`: MIDI notes of selected chord

**Effects** ($effect):
- When rootMidi or scaleType change, regenerate diatonic chords
- When user selects chord, call onChordSelect callback

**Usage Example**:
```svelte
<ChordDisplay
  {rootMidi}
  {scaleType}
  bind:selectedChordRoman
  onChordSelect={(roman) => { selectedRoman = roman; }}
  onChordPlay={(notes) => { audioState.playChord(notes); }}
/>
```

#### **ProgressionBuilder.svelte**

**Purpose**: Create sequences of chords (progressions) and play them back

**Props**:
```javascript
let {
  rootMidi = 60,
  scaleType = 'major',
  availableChordRomans = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
  audioState = undefined,          // Reference to Web Audio engine
  progressionTemplates = undefined, // Available progression templates
  onProgressionChange = undefined,  // Callback when progression changes
} = $props();
```

**Features**:
- Drag-and-drop to build progression sequence
- Dropdown to select from progression templates (pop, jazz, blues, etc.)
- Display current progression as Roman numerals
- Visual analysis: voice leading quality, harmonic function
- Play, pause, stop buttons for playback
- Tempo control for playback
- Loop option for repeated practice

**Internal State** ($state):
- `progression`: Array of Roman numerals ['I', 'IV', 'V', 'I']
- `isPlaying`: Playback state
- `currentChordIndex`: Which chord is playing
- `tempo`: BPM (beats per minute)
- `chordDuration`: Duration per chord (in beats)
- `loopEnabled`: Whether to loop when finished

**Derived State** ($derived):
- `progressionChords`: Full chord objects from progressions.js
- `voiceLeadingAnalysis`: Quality metrics from analyzeVoiceLeading()
- `totalDuration`: Total playback time

**Effects** ($effect):
- When progression changes, recalculate derived state and call onProgressionChange
- When isPlaying changes, start/stop audio playback

**Usage Example**:
```svelte
<ProgressionBuilder
  {rootMidi}
  {scaleType}
  {audioState}
  on:progressionChange={(prog) => currentProgression = prog}
/>
```

#### **ChordGenerator.svelte** (Main Container)

**Purpose**: Combine all components into a cohesive interface

**Props**:
```javascript
let {
  audioState = undefined,  // Reference to audio engine (PianoKeyboard's audioState)
  initialRootMidi = 60,
  initialScaleType = 'major',
} = $props();
```

**Structure**:
```svelte
<div class="chord-generator">
  <!-- Section 1: Key Selection -->
  <ChordSelector bind:rootMidi bind:scaleType />

  <!-- Section 2: Available Chords -->
  <ChordDisplay {rootMidi} {scaleType} bind:selectedChord />

  <!-- Section 3: Progression Building -->
  <ProgressionBuilder {rootMidi} {scaleType} {audioState} />

  <!-- Section 4: Current Progression Display -->
  <div class="progression-status">
    Current progression: {currentProgression.join(' - ')}
  </div>
</div>
```

**Internal State** ($state):
- `rootMidi`: Current root note
- `scaleType`: Current scale type
- `selectedChord`: User's selected chord
- `currentProgression`: Current progression sequence

**Features**:
- Unified interface for complete chord progression workflow
- Consistent styling following existing LoFi Piano design
- Integration point for PianoKeyboard audio playback
- Educational tooltips and learning aids

### 3.3 Svelte 5 Patterns Used

All components follow Svelte 5 best practices:

**Runes Pattern**:
```svelte
<script>
  // Props with defaults
  let { rootMidi = 60, scaleType = 'major' } = $props();

  // Reactive state
  let selectedChord = $state('I');
  let isPlaying = $state(false);

  // Derived state (auto-updates)
  let diatonicChords = $derived(
    generateDiatonicChords(rootMidi, scaleType)
  );

  // Effects (run when dependencies change)
  $effect(() => {
    // When rootMidi or scaleType change, update chords
    console.log(`Changed to ${scaleType} in key ${rootMidi}`);
  });
</script>
```

**Event Handling**:
```svelte
<!-- Two-way binding -->
<input type="number" bind:value={rootMidi} />

<!-- Callbacks -->
<button onclick={() => playChord(selectedChord)}>Play</button>

<!-- Event dispatching (for parent communication) -->
<button onclick={() => dispatch('chordSelected', { roman: 'I' })}>
  I Chord
</button>
```

---

## 4. Integration with PianoKeyboard

### 4.1 Data Flow

```
User selects chord in ChordDisplay
         ↓
ChordDisplay.onChordPlay called with MIDI notes
         ↓
ProgressionBuilder receives notes
         ↓
ProgressionBuilder plays via audioState.playChord()
         ↓
audioState triggers synthesis (oscillators, envelopes)
         ↓
PianoKeyboard receives and visualizes playing notes
```

### 4.2 AudioState Integration

The `audioState` object (from `plugins/lofi-piano/web/src/lib/audio/audioState.js`) provides:

```javascript
// Playing notes
audioState.playNote(midiNote, duration, velocity);      // Single note
audioState.playChord(midiNotes, duration, velocity);    // Multiple notes (array)

// Stopping
audioState.stopNote(midiNote);
audioState.stopAll();

// Parameter control
audioState.setFilterFrequency(frequency);
audioState.setVolume(level);
audioState.setTempo(bpm);

// State queries
audioState.isNoteActive(midiNote);
audioState.getActiveNotes();
```

### 4.3 Chord Playback Pattern

```javascript
// In ProgressionBuilder.svelte
async function playProgression() {
  for (const chordRoman of progression) {
    // Get chord notes from music theory
    const chord = diatonicChords.find(c => c.roman === chordRoman);

    // Play in audioState
    audioState.playChord(chord.notes, chordDuration, velocity);

    // Wait for chord to finish
    await new Promise(resolve =>
      setTimeout(resolve, chordDuration * 1000)
    );

    // Move to next chord
    currentChordIndex += 1;
  }
}
```

### 4.4 PianoKeyboard Visualization

The PianoKeyboard component has a built-in `activeKeys` state that visualizes currently playing notes:

```javascript
// PianoKeyboard tracks which MIDI notes are active
let activeKeys = $state(new Map()); // midiNote -> isActive

// When chord is played:
for (const midiNote of chordNotes) {
  activeKeys.set(midiNote, true);  // Visual highlight
}

// When chord stops:
for (const midiNote of chordNotes) {
  activeKeys.delete(midiNote);     // Remove highlight
}
```

---

## 5. Data Structures & APIs

### 5.1 Scale Object

```javascript
{
  name: 'Major Scale',
  intervals: [0, 2, 4, 5, 7, 9, 11],      // Semitones from root
  pattern: 'W-W-H-W-W-W-H',               // Whole/Half step pattern
  degrees: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],  // Roman numerals
  description: 'Happy, bright, resolved',
  numNotes: 7,
  commonUsage: 'Most common scale in Western music...',
  midiNotes: [60, 62, 64, 65, 67, 69, 71, 72, ...]  // Generated for specific key
}
```

### 5.2 Chord Object

```javascript
{
  degree: 1,                               // Scale degree (1-7)
  roman: 'I',                              // Roman numeral
  root: 60,                                // Root MIDI note
  notes: [60, 64, 67],                     // MIDI notes
  quality: 'major',                        // Chord quality
  function: 'tonic',                       // Harmonic function
  name: 'I',                               // Display name
  voiceLeadingInversion: 0,                // Inversion applied (0/1/2)
  voiceLeadingDistance: 0,                 // Semitone movement from previous
}
```

### 5.3 Progression Object

```javascript
[
  {
    degree: 1,
    roman: 'I',
    root: 60,
    notes: [60, 64, 67],
    quality: 'major',
    function: 'tonic',
    voiceLeadingDistance: 0,
    analysis: {
      harmonic: 'Tonic - home, rest, resolution',
      inversion: 'root position'
    }
  },
  // ... more chords
]
```

### 5.4 Voice Leading Analysis

```javascript
{
  totalDistance: 42,              // Total semitones moved across progression
  averageDistance: 8.4,           // Average per transition
  quality: 'good',                // 'excellent' | 'good' | 'fair'
  distances: [0, 5, 3, 12, ...],  // Per-transition distances
  suggestions: [
    'Consider applying voice leading inversions',
    'Try spreading chord inversions more evenly'
  ]
}
```

---

## 6. Example Usage Workflows

### 6.1 Basic Workflow: Play a Simple Progression

```svelte
<script>
  import ChordGenerator from '@audio/chord-generator-ui/ChordGenerator.svelte';
  import { audioState } from '$lib/audio/audioState.js';

  let selectedKey = $state(60);    // C5
  let selectedScale = $state('major');
</script>

<ChordGenerator
  {audioState}
  initialRootMidi={selectedKey}
  initialScaleType={selectedScale}
/>
```

**User Actions**:
1. Select "C Major" from ChordSelector
2. See all 7 diatonic chords in ChordDisplay (I, ii, iii, IV, V, vi, vii°)
3. Select "I-V-vi-IV" progression from template in ProgressionBuilder
4. Click "Play" → Chord progression plays with voice leading applied
5. PianoKeyboard shows notes lighting up as they play

### 6.2 Educational Workflow: Learn About Harmonic Functions

```svelte
<script>
  import ChordDisplay from '@audio/chord-generator-ui/ChordDisplay.svelte';

  let rootMidi = 60;
  let scaleType = 'major';
</script>

<ChordDisplay {rootMidi} {scaleType} />

<!-- Component shows:
- I chord highlighted as "Tonic" (home)
- IV chord highlighted as "Subdominant" (moving away)
- V chord highlighted as "Dominant" (tension)
- vi chord highlighted as "Relative Minor" (alternative home)

Tooltips explain each function -->
```

### 6.3 Advanced Workflow: Custom Progression with Voice Leading Analysis

```svelte
<script>
  import ProgressionBuilder from '@audio/chord-generator-ui/ProgressionBuilder.svelte';
  import { analyzeVoiceLeading } from '@audio/music-theory';

  let progression = ['I', 'IV', 'V', 'I'];
  let rootMidi = 60;
  let scaleType = 'major';

  let voiceLeadingAnalysis = $derived(
    analyzeVoiceLeading(
      generateProgression(rootMidi, scaleType, progression)
    )
  );
</script>

<ProgressionBuilder {rootMidi} {scaleType} bind:progression />

<div class="analysis">
  <p>Voice Leading Quality: {voiceLeadingAnalysis.quality}</p>
  <p>Average Movement: {voiceLeadingAnalysis.averageDistance} semitones</p>
</div>
```

---

## 7. Module Dependencies

### 7.1 Import Structure

**UI Components → Music Theory**:
```javascript
import {
  generateScale,
  getAvailableScales,
  generateDiatonicChords,
  generateProgression,
  analyzeVoiceLeading,
  analyzeChordFunction,
  midiToNoteName,
  getProgressionsByGenre,
  PROGRESSION_TEMPLATES
} from '@audio/music-theory';
```

**UI Components → Web Audio**:
```javascript
import { audioState } from '$lib/audio/audioState.js';
import PianoKeyboard from '$lib/components/piano/PianoKeyboard.svelte';
```

**Music Theory → Nothing** (pure JavaScript, no dependencies)

### 7.2 Dependency Graph

```
ChordGenerator.svelte
├── ChordSelector.svelte
│   └── @audio/music-theory (scales, getAvailableScales)
├── ChordDisplay.svelte
│   ├── @audio/music-theory (generateDiatonicChords, analyzeChordFunction)
│   └── audioState
├── ProgressionBuilder.svelte
│   ├── @audio/music-theory (generateProgression, analyzeVoiceLeading, PROGRESSION_TEMPLATES)
│   └── audioState
└── PianoKeyboard.svelte (existing, passes audioState)

@audio/music-theory/
├── scales.js (standalone)
├── chords.js (imports scales)
├── midi.js (standalone)
└── progressions.js (imports chords)
```

---

## 8. File Structure

```
plugins/lofi-piano/web/
└── src/
    └── lib/
        ├── components/
        │   ├── piano/
        │   │   └── PianoKeyboard.svelte (existing - unchanged)
        │   └── chord-generator/              [NEW]
        │       ├── ChordSelector.svelte
        │       ├── ChordDisplay.svelte
        │       ├── ProgressionBuilder.svelte
        │       └── ChordGenerator.svelte

shared/audio-core/
└── music-theory/                           [CREATED IN PREVIOUS STEP]
    ├── index.js
    ├── scales.js
    ├── chords.js
    ├── midi.js
    └── progressions.js

docs/
├── MUSIC-THEORY-GUIDE.md                  [CREATED IN PREVIOUS STEP]
└── CHORD-GENERATOR-ARCHITECTURE.md        [THIS DOCUMENT]
```

---

## 9. Implementation Roadmap

### Phase 1: Foundation (Completed)
- [x] Create @audio/music-theory module (5 files, 3500+ LOC)
- [x] Test all modules independently
- [x] Create MUSIC-THEORY-GUIDE.md (education)

### Phase 2: UI Components (Next)
- [ ] ChordSelector component with key/scale selection
- [ ] ChordDisplay component showing diatonic chords
- [ ] ProgressionBuilder component with playback
- [ ] ChordGenerator main container

### Phase 3: Integration (After UI)
- [ ] Connect ChordGenerator to existing PianoKeyboard
- [ ] Implement chord playback via audioState
- [ ] Add visual feedback (notes lighting up)
- [ ] Test end-to-end workflow

### Phase 4: Enhancement (After Integration)
- [ ] Add progression templates (pop, jazz, blues, etc.)
- [ ] Implement voice leading visualization
- [ ] Add harmonic function highlighting
- [ ] Create example projects

### Phase 5: Documentation & Testing
- [ ] Unit tests for music theory module
- [ ] Component tests for UI elements
- [ ] Integration tests (e2e)
- [ ] User guide and tutorial

---

## 10. Technical Specifications

### 10.1 Performance Considerations

**Music Theory Calculations**:
- Scale generation: O(n) where n = number of octaves (instant)
- Diatonic chord generation: O(1) per key (7 chords, always same)
- Progression generation: O(m) where m = number of chords in progression
- Voice leading: O(k²) where k = notes per chord (usually 3-4)

**Svelte Component Rendering**:
- ChordSelector: Re-renders only when root/scale change
- ChordDisplay: Re-renders when diatonic chords change
- ProgressionBuilder: Updates during playback (frequent, but optimized with $derived)

### 10.2 Browser Compatibility

- **Modern browsers only** (ES2020+, Web Audio API)
- Chrome, Firefox, Safari, Edge (latest versions)
- AudioContext must be unlocked on iOS (user interaction required)

### 10.3 Accessibility

- Keyboard navigation (QWERTY mapping from PianoKeyboard)
- ARIA labels on all interactive elements
- Color contrast meets WCAG 2.1 AA standards
- Screen reader support for chord/function descriptions

---

## 11. Testing Strategy

### Unit Tests (@audio/music-theory)

```javascript
// scales.test.js
test('generateScale returns correct MIDI notes for C Major', () => {
  const scale = generateScale(60, 'major', 1);
  expect(scale).toEqual([60, 62, 64, 65, 67, 69, 71, 72]);
});

test('getAvailableScales returns all 13 scales', () => {
  const scales = getAvailableScales();
  expect(scales).toHaveLength(13);
});

// chords.test.js
test('generateDiatonicChords returns 7 chords in major', () => {
  const chords = generateDiatonicChords(60, 'major');
  expect(chords).toHaveLength(7);
  expect(chords[0].quality).toBe('major');  // I
  expect(chords[1].quality).toBe('minor');  // ii
});

test('calculateVoiceLeading finds optimal inversion', () => {
  const voiceLeading = calculateVoiceLeading(
    [60, 64, 67],   // C Major
    [65, 69, 72]    // F Major
  );
  expect(voiceLeading.bestInversion).toBe(0);
  expect(voiceLeading.minDistance).toBeLessThan(10);
});
```

### Component Tests (Svelte)

```javascript
// ChordSelector.test.js
test('displays 12 chromatic notes', async () => {
  const { container } = render(ChordSelector);
  const options = container.querySelectorAll('option');
  expect(options).toHaveLength(12);
});

test('updates selectedRoot when user selects note', async () => {
  const { component } = render(ChordSelector);
  await user.selectOption(
    container.querySelector('[aria-label="Root Note"]'),
    '62'  // D
  );
  expect(component.rootMidi).toBe(62);
});

// ChordDisplay.test.js
test('displays all 7 diatonic chords', async () => {
  const { container } = render(ChordDisplay, {
    props: { rootMidi: 60, scaleType: 'major' }
  });
  const chordButtons = container.querySelectorAll('[data-chord]');
  expect(chordButtons).toHaveLength(7);
});

test('emits onChordPlay when play button clicked', async () => {
  const onChordPlay = vi.fn();
  render(ChordDisplay, {
    props: { rootMidi: 60, scaleType: 'major', onChordPlay }
  });
  await user.click(container.querySelector('[data-chord="I"] button'));
  expect(onChordPlay).toHaveBeenCalledWith([60, 64, 67]);
});
```

### Integration Tests

```javascript
// End-to-end: Select key → Choose progression → Play
test('E2E: Complete chord progression workflow', async () => {
  // 1. Render ChordGenerator
  const { container } = render(ChordGenerator, {
    props: { audioState: mockAudioState }
  });

  // 2. User selects C Major
  await user.selectOption(container.querySelector('[aria-label="Scale"]'), 'major');

  // 3. User selects I-IV-V-I progression
  await user.click(container.querySelector('[data-template="classicCadence"]'));

  // 4. User clicks Play
  await user.click(container.querySelector('[aria-label="Play Progression"]'));

  // 5. Verify audioState.playChord called correctly
  expect(mockAudioState.playChord).toHaveBeenCalledWith(
    [60, 64, 67],  // I
    expect.any(Number),
    expect.any(Number)
  );
  expect(mockAudioState.playChord).toHaveBeenCalledWith(
    [65, 69, 72],  // IV
    expect.any(Number),
    expect.any(Number)
  );
  // ... etc for V and I
});
```

---

## 12. Common Questions & Answers

### Q: How do I change keys without rebuilding the UI?

**A**: Simply change `rootMidi` prop on ChordSelector. All derived state ($derived) automatically updates:
```javascript
let rootMidi = $state(60);  // C Major
rootMidi = 62;              // D Major - all chords update automatically
```

### Q: Can I use progressions outside this key?

**A**: Not easily - the system is designed for diatonic progressions (chords from the same scale). To use non-diatonic chords, you'd need to manually construct them with `generateChord()` instead of `generateDiatonicChords()`.

### Q: How do I transpose an entire progression?

**A**: Use the `transpose()` function from @audio/music-theory:
```javascript
const transposed = progression.map(chord => ({
  ...chord,
  notes: transpose(chord.notes, 5)  // Up a perfect 4th
}));
```

### Q: What about inversions for bass lines?

**A**: Voice leading automatically applies optimal inversions, but you can manually apply with `invert()`:
```javascript
const inverted = invert([60, 64, 67], 1);  // First inversion
```

### Q: Can I save/load progressions?

**A**: Yes - progressions are just arrays of Roman numerals + root/scale. Simple to serialize:
```javascript
const saved = JSON.stringify({ rootMidi, scaleType, progression });
const loaded = JSON.parse(saved);
```

---

## 13. Future Enhancements

- **MIDI I/O**: Connect to external MIDI keyboards and controllers
- **Harmonic Analysis**: Analyze existing audio for chord detection
- **Chord Substitution**: Suggest alternative chords (tritone substitution, etc.)
- **Arrangement Templates**: Variation patterns (arpeggios, inversions, etc.)
- **Ear Training**: Interactive exercises to learn chord recognition
- **Export**: Save progressions as MIDI files or lead sheets
- **Performance Visualization**: Display wave analysis, spectrogram, frequency response
- **Preset System**: Save/load favorite keys, scales, progressions
- **Collaborative**: Real-time progression building with other musicians

---

## 14. Reference & Resources

### Internal Documentation
- `docs/MUSIC-THEORY-GUIDE.md` - Complete music theory education
- `shared/audio-core/music-theory/` - Source code with JSDoc
- `plugins/lofi-piano/web/` - Integration example

### External Resources
- [Web Audio API](https://www.w3.org/TR/webaudio/) - Browser audio standard
- [Music Theory Fundamentals](https://musictheory.net/) - Interactive learning
- [Chord Progressions Reference](https://en.wikipedia.org/wiki/Chord_progression) - Common patterns
- [Svelte 5 Documentation](https://svelte.dev/docs) - UI framework

---

**Document Version**: 1.0
**Last Updated**: 2025-10-29
**Author**: Claude Code (AI Senior Audio Engineer & Svelte Designer)
**Status**: Complete - Ready for Implementation Phase 2
