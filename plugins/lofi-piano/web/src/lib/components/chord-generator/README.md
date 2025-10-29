# MIDI Chord Generator Components

Complete, modular system for building and playing chord progressions in web audio applications.

## Overview

This directory contains the complete MIDI Chord Generator UI layer - interactive Svelte 5 components for:

- **Selecting musical keys** (root note + scale type)
- **Viewing available chords** (all 7 diatonic chords in a key)
- **Building progressions** (sequences of chords with templates)
- **Playing progressions** (with proper voice leading and tempo control)

The system integrates with the **@audio/music-theory** module (pure JavaScript, framework-agnostic) and the existing **PianoKeyboard** and **audioState** components.

---

## Components

### ChordGenerator.svelte (Main Container)

The primary entry point - combines all sub-components into one cohesive interface.

```svelte
<script>
  import ChordGenerator from '$lib/components/chord-generator/ChordGenerator.svelte';
  import { audioState } from '$lib/audio/audioState.js';
</script>

<ChordGenerator
  audioState={audioState}
  initialRootMidi={60}    <!-- C5 (Middle C) -->
  initialScaleType="major"
/>
```

**Features**:
- Header with current key and progression display
- Two-column layout: key/chord selection (left) + progression builder (right)
- Educational footer with music theory tips
- Responsive design (mobile-friendly)

### ChordSelector.svelte

Interactive key selection - choose root note and scale type.

```svelte
<ChordSelector
  bind:rootMidi={currentRoot}
  bind:scaleType={currentScale}
  onKeyChange={(midi) => console.log('Key changed to', midi)}
  onScaleChange={(type) => console.log('Scale changed to', type)}
/>
```

**Props**:
- `rootMidi`: MIDI note number (0-127)
- `scaleType`: Scale type ('major', 'minorNatural', 'dorian', etc.)
- `onKeyChange`: Callback when root note changes
- `onScaleChange`: Callback when scale type changes

**Features**:
- 12 chromatic note selector
- 13 scale type dropdown
- Octave adjustment controls
- Collapsible scale info panel
- Visual keyboard preview showing scale notes

### ChordDisplay.svelte

Show all 7 diatonic chords available in the current key/scale.

```svelte
<ChordDisplay
  rootMidi={60}
  scaleType="major"
  bind:selectedChordRoman
  audioState={audioState}
  onChordSelect={(roman) => console.log('Selected', roman)}
  onChordPlay={(notes, duration) => audioState.playChord(notes, duration)}
/>
```

**Props**:
- `rootMidi`: Root MIDI note
- `scaleType`: Current scale type
- `selectedChordRoman`: Which chord is selected (I, ii, iii, etc.)
- `audioState`: Reference to audio engine (for playback)
- `onChordSelect`: Callback when user selects chord
- `onChordPlay`: Callback to play chord

**Features**:
- Visual grid showing all 7 diatonic chords
- Color-coded harmonic functions
- Selected chord details panel
- Play button for chord preview
- Harmonic function descriptions

### ProgressionBuilder.svelte

Create and play chord progressions with templates and playback controls.

```svelte
<ProgressionBuilder
  rootMidi={60}
  scaleType="major"
  audioState={audioState}
  onProgressionChange={(prog) => console.log('Progression updated', prog)}
/>
```

**Props**:
- `rootMidi`: Root MIDI note
- `scaleType`: Current scale type
- `audioState`: Reference to audio engine
- `onProgressionChange`: Callback when progression changes

**Features**:
- Load from 13 progression templates
- Add/remove chords from progression
- Playback controls (Play, Stop)
- Tempo adjustment (40-200 BPM)
- Chord duration control (0.5-4 beats)
- Loop toggle
- Voice leading analysis
- Progression status display

---

## Architecture

### Data Flow

```
User selects key/scale in ChordSelector
        ↓
ChordDisplay shows available chords
        ↓
User selects chords in ProgressionBuilder
        ↓
ProgressionBuilder generates progression with voice leading
        ↓
User clicks Play
        ↓
audioState.playChord() called with MIDI notes
        ↓
PianoKeyboard visualizes playing notes
```

### State Management

All components use **Svelte 5 Runes**:

- `$props()` - Component input properties
- `$state()` - Local reactive state
- `$derived()` - Computed values (auto-update)
- `$effect()` - Side effects (callbacks, broadcasts)

Example:
```svelte
<script>
  let { rootMidi = 60 } = $props();
  let selectedChord = $state('I');

  let chords = $derived(generateDiatonicChords(rootMidi, scaleType));

  $effect(() => {
    if (onChordSelect) {
      onChordSelect(selectedChord);
    }
  });
</script>
```

### Music Theory Module Integration

All components import from **@audio/music-theory** (pure JavaScript):

```javascript
import {
  generateScale,
  generateDiatonicChords,
  generateProgression,
  analyzeVoiceLeading,
  getAvailableScales,
  // ... etc
} from '@audio/music-theory';
```

The music theory module is:
- **Framework-agnostic** (pure JavaScript, no dependencies)
- **Reusable** (works in any JS environment - Node.js, browsers, etc.)
- **Testable** (all functions are pure/deterministic)
- **Educational** (comprehensive comments and examples)

---

## Usage Example: Complete Workflow

### 1. Basic Integration with lofi-piano

In `plugins/lofi-piano/web/src/routes/+page.svelte`:

```svelte
<script>
  import ChordGenerator from '$lib/components/chord-generator/ChordGenerator.svelte';
  import { audioState } from '$lib/audio/audioState.js';
</script>

<div class="app">
  <ChordGenerator audioState={audioState} />
</div>
```

### 2. Advanced: Custom Configuration

```svelte
<script>
  import ChordGenerator from '$lib/components/chord-generator/ChordGenerator.svelte';
  import { audioState } from '$lib/audio/audioState.js';

  // Start in D Dorian
  let initialKey = 62;  // D
  let initialScale = 'dorian';
</script>

<ChordGenerator
  audioState={audioState}
  initialRootMidi={initialKey}
  initialScaleType={initialScale}
/>
```

### 3. Programmatic Usage

```svelte
<script>
  import {
    generateDiatonicChords,
    generateProgression,
    analyzeVoiceLeading
  } from '@audio/music-theory';

  // Get all chords in F Major
  const chords = generateDiatonicChords(65, 'major');
  console.log(chords);
  // Output: Array of 7 chord objects with notes, quality, function, etc.

  // Create I-IV-V-I progression
  const progression = generateProgression(65, 'major', ['I', 'IV', 'V', 'I']);
  console.log(progression);
  // Output: Progression with voice leading applied

  // Analyze voice leading quality
  const analysis = analyzeVoiceLeading(progression);
  console.log(analysis.quality);  // 'excellent' | 'good' | 'fair'
</script>
```

---

## Music Theory Concepts

### Diatonic Chords

All 7 diatonic chords come from the same scale and are guaranteed to sound good together.

**C Major scale chords**:
- I: C Major (C, E, G)
- ii: D Minor (D, F, A)
- iii: E Minor (E, G, B)
- IV: F Major (F, A, C)
- V: G Major (G, B, D)
- vi: A Minor (A, C, E)
- vii°: B Diminished (B, D, F)

### Harmonic Functions

Each chord has a harmonic role:

- **Tonic (I)**: Home base - stable, resolved
- **Subdominant (IV, ii)**: Move away from home - stable but forward motion
- **Dominant (V, vii°)**: Tension - wants to resolve back to tonic
- **Pre-dominant (ii, iii, vi)**: Transition chords leading to dominant

### Voice Leading

Smooth chord transitions with minimal note movement.

**Without voice leading**:
```
C Major (root position):   C E G
F Major (root position):   F A C
Distance: 5 semitones (C→F, E→A, G→C)
```

**With voice leading** (first inversion F Major):
```
C Major (root position):   C E G
F Major (first inversion): A C F
Distance: 3 semitones (C→A, E→C, G→F)
```

The system automatically applies voice leading for smooth, professional transitions.

---

## Customization

### Styling

All components use scoped CSS with consistent design tokens:

```
Colors:
  - Primary: #5c3317 (dark brown)
  - Accent: #8b6f47 (medium brown)
  - Light: #d4c4b0 (light tan)

Fonts:
  - Main: Segoe UI, Tahoma, Verdana
  - Code: Courier New (for MIDI numbers)

Spacing:
  - Small: 0.5rem, 0.75rem
  - Medium: 1rem, 1.5rem
  - Large: 2rem
```

To customize, modify the `<style>` sections in each component.

### Component Props

All components expose props for customization:

```svelte
<!-- ChordSelector: control initial key and scale -->
<ChordSelector
  rootMidi={72}  <!-- F5 -->
  scaleType="minorHarmonic"
/>

<!-- ChordDisplay: control selection behavior -->
<ChordDisplay
  rootMidi={60}
  scaleType="major"
  selectedChordRoman="IV"  <!-- Start with IV selected -->
/>

<!-- ProgressionBuilder: configure playback -->
<ProgressionBuilder
  rootMidi={60}
  scaleType="major"
  audioState={audioState}
/>
```

---

## Testing

### Unit Tests for Music Theory

```javascript
import { generateDiatonicChords, analyzeVoiceLeading } from '@audio/music-theory';

test('C Major diatonic chords', () => {
  const chords = generateDiatonicChords(60, 'major');
  expect(chords).toHaveLength(7);
  expect(chords[0].roman).toBe('I');
  expect(chords[0].quality).toBe('major');
});

test('I-IV-V-I progression voice leading', () => {
  const progression = generateProgression(60, 'major', ['I', 'IV', 'V', 'I']);
  const analysis = analyzeVoiceLeading(progression);
  expect(analysis.quality).toBe('good');
  expect(analysis.averageDistance).toBeLessThan(10);
});
```

### Component Tests

Components are testable via Svelte Testing Library:

```javascript
import { render } from '@testing-library/svelte';
import ChordDisplay from './ChordDisplay.svelte';

test('displays 7 diatonic chords', () => {
  const { container } = render(ChordDisplay, {
    props: { rootMidi: 60, scaleType: 'major' }
  });
  expect(container.querySelectorAll('[data-chord]')).toHaveLength(7);
});
```

---

## Performance Considerations

- **Music theory calculations**: O(1) - instant (lookup-based, no loops)
- **Component re-renders**: Optimized with `$derived` (only when dependencies change)
- **Playback timing**: Uses `setTimeout` for accurate scheduling
- **Memory**: Minimal - only stores 7 chords per key, small progression array

All operations complete within milliseconds on any modern device.

---

## Accessibility

All components include:

- ✅ ARIA labels and roles
- ✅ Keyboard navigation support
- ✅ Color-independent visual indicators
- ✅ Screen reader friendly
- ✅ Focus indicators
- ✅ High contrast text (WCAG 2.1 AA)

---

## Learning Resources

- **MUSIC-THEORY-GUIDE.md**: Comprehensive music theory education
- **CHORD-GENERATOR-ARCHITECTURE.md**: Complete system design documentation
- **@audio/music-theory**: Source code with JSDoc comments
- **Footer tips**: Built-in learning tips in ChordGenerator

---

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support (responsive design)
- IE11: ❌ Not supported (requires ES2020+)

---

## File Structure

```
chord-generator/
├── ChordGenerator.svelte      # Main container
├── ChordSelector.svelte       # Key/scale selection
├── ChordDisplay.svelte        # Chord visualization
├── ProgressionBuilder.svelte  # Progression creation & playback
└── README.md                  # This file
```

---

## Future Enhancements

- MIDI input support (external keyboards)
- Export progressions as MIDI files
- Harmonic analysis of existing audio
- Chord substitution suggestions
- Arrangement variations (arpeggios, rhythmic patterns)
- Ear training exercises
- Preset system for favorite keys/progressions

---

**Created**: 2025-10-29
**Version**: 1.0
**Status**: Complete and ready for use
**Integration**: Tested with lofi-piano plugin and audioState
