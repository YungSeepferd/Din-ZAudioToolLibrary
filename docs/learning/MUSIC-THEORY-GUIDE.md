# Music Theory Guide - Complete Reference

**Date**: October 29, 2025
**Status**: Complete
**Module**: @audio/music-theory

---

## Overview

This guide explains the music theory concepts and systems used in the MIDI Chord Generator. It's designed to teach music theory while showing how it's implemented in code.

---

## Part 1: Fundamentals

### The Chromatic Scale

Western music uses 12 notes that repeat in a pattern called the chromatic scale:

```
C, C#/Db, D, D#/Eb, E, F, F#/Gb, G, G#/Ab, A, A#/Bb, B, (then C again)
```

**Important concepts**:
- **Semitone (half-step)**: Distance between adjacent notes = 1 MIDI number
- **Whole tone (whole-step)**: Distance of 2 semitones = 2 MIDI numbers
- **Octave**: Pattern repeats every 12 notes = 12 MIDI numbers
- **Enharmonic equivalents**: C# and Db are the same pitch, different names

### MIDI Note Numbers

MIDI (Musical Instrument Digital Interface) represents notes as numbers 0-127:

```
MIDI 0 = C-1 (lowest)
MIDI 12 = C0
MIDI 24 = C1
...
MIDI 60 = C5 (Middle C - common reference)
MIDI 69 = A4 (Concert pitch, 440 Hz)
...
MIDI 127 = G9 (highest)
```

**Why use MIDI numbers?**
- Universal standard for music software
- Easy math: transpose by adding/subtracting
- Works with all instruments
- Easy to store and transmit

### Frequency and Pitch

Music can be represented as either:
1. **MIDI note number** (discrete, musical)
2. **Frequency in Hz** (continuous, acoustic)

**Conversion formula** (Equal Temperament Tuning):
```
f = 440 * 2^((n - 69) / 12)

Where:
- f = frequency in Hz
- n = MIDI note number
- 69 = A4 (reference at 440 Hz)
```

**Key frequencies to know**:
- A4 = 440 Hz (concert pitch, international standard)
- Middle C (C5) ≈ 261.63 Hz
- A3 = 220 Hz (one octave below concert pitch)

---

## Part 2: Scales

### What is a Scale?

A **scale** is an ordered sequence of notes with a specific interval pattern.

**Why scales matter**:
- Foundation of all Western music
- Defines which notes "sound right" together
- Basis for chords and progressions
- Creates tonality and key center

### Major Scale

The **major scale** is the most common, happy-sounding scale:

```
C D E F G A B C
1 2 3 4 5 6 7 8
```

**Interval pattern** (semitones between notes):
```
W W H W W W H
(Whole, Whole, Half, Whole, Whole, Whole, Half)
```

**Semitone pattern**: `[0, 2, 4, 5, 7, 9, 11]`

**Emotional quality**: Bright, happy, resolved

**In code**:
```javascript
const cMajorScale = generateScale(60, 'major');
// Returns MIDI notes: [60, 62, 64, 65, 67, 69, 71, 72, ...]
// Which are: C, D, E, F, G, A, B, C5, ...
```

### Natural Minor Scale

The **minor scale** is darker and more introspective:

```
C D Eb F G Ab Bb C
1 2  3 4 5  6  7 8
```

**Interval pattern**:
```
W H W W H W W
```

**Semitone pattern**: `[0, 2, 3, 5, 7, 8, 10]`

**Emotional quality**: Dark, introspective, melancholic

**In code**:
```javascript
const cMinorScale = generateScale(60, 'minorNatural');
// Returns: [60, 62, 63, 65, 67, 68, 70, 72, ...]
// Which are: C, D, Eb, F, G, Ab, Bb, C5, ...
```

### The Modes (Church Modes)

Modes are created by starting the major scale from different scale degrees:

| Mode | Start Degree | Pattern | Emotion |
|------|---|---------|---------|
| **Ionian** | I (1) | W W H W W W H | Major (bright) |
| **Dorian** | II (2) | W H W W W H W | Jazzy, slightly dark |
| **Phrygian** | III (3) | H W W W H W W | Spanish, exotic |
| **Lydian** | IV (4) | W W W H W W H | Ethereal, quirky |
| **Mixolydian** | V (5) | W W H W W H W | Blues, dominant |
| **Aeolian** | VI (6) | W H W W H W W | Minor (dark) |
| **Locrian** | VII (7) | H W W H W W W | Dissonant, unstable |

**Key insight**: All modes use the same 7 notes as their parent major scale, just starting on different notes.

**In code**:
```javascript
const cDorian = generateScale(60, 'dorian');
// Same notes as Bb major (60, 62, 63, 65, 67, 69, 70)
// But starting from D (scale degree 2)
```

### Pentatonic Scales

**Pentatonic** means "5 notes" (penta = 5).

**Major Pentatonic**:
```
C D E G A (C)
```
Removes IV and VII from major scale. Hard to play wrong, very musical.

**Minor Pentatonic**:
```
C Eb F G Bb (C)
```
Removes II and VI from natural minor. Very common in blues and rock.

**In code**:
```javascript
const cMajorPent = generateScale(60, 'majorPentatonic');
const cMinorPent = generateScale(60, 'minorPentatonic');
```

---

## Part 3: Chords

### What is a Chord?

A **chord** is 3+ notes played simultaneously.

**Why chords matter**:
- Harmonic building blocks of music
- Create emotional context
- Form the basis of chord progressions
- Every song uses chords (even if implicit)

### Triads (3-note chords)

**Major Triad**: Root + Major 3rd (4 semitones) + Perfect 5th (7 semitones)

```
C Major = C E G (MIDI: 60, 64, 67)
Intervals: [0, 4, 7]
```

**Sound**: Happy, bright, resolved

**Minor Triad**: Root + Minor 3rd (3 semitones) + Perfect 5th (7 semitones)

```
C Minor = C Eb G (MIDI: 60, 63, 67)
Intervals: [0, 3, 7]
```

**Sound**: Sad, dark, introspective

**Diminished Triad**: Root + Minor 3rd (3 semitones) + Diminished 5th (6 semitones)

```
C Diminished = C Eb Gb (MIDI: 60, 63, 66)
Intervals: [0, 3, 6]
```

**Sound**: Unstable, needs resolution

**Augmented Triad**: Root + Major 3rd (4 semitones) + Augmented 5th (8 semitones)

```
C Augmented = C E G# (MIDI: 60, 64, 68)
Intervals: [0, 4, 8]
```

**Sound**: Tense, unusual, exotic

### Seventh Chords (4-note chords)

**Major 7th**: Major triad + Major 7th (11 semitones from root)

```
Cmaj7 = C E G B (MIDI: 60, 64, 67, 71)
Intervals: [0, 4, 7, 11]
```

**Sound**: Jazz, sophisticated, bright

**Dominant 7th**: Major triad + Minor 7th (10 semitones from root)

```
C7 = C E G Bb (MIDI: 60, 64, 67, 70)
Intervals: [0, 4, 7, 10]
```

**Sound**: Blues, funk, dominant tension (wants to resolve)

**Minor 7th**: Minor triad + Minor 7th

```
Cm7 = C Eb G Bb (MIDI: 60, 63, 67, 70)
Intervals: [0, 3, 7, 10]
```

**Sound**: Jazz, funk, dark and smooth

### Diatonic Chords

**Diatonic chords** are chords built using only notes from a single scale.

**C Major scale diatonic chords**:

```
Scale: C D E F G A B

I chord (1-3-5):     C E G     = C Major
ii chord (2-4-6):    D F A     = D minor
iii chord (3-5-7):   E G B     = E minor
IV chord (4-6-1):    F A C     = F Major
V chord (5-7-2):     G B D     = G Major
vi chord (6-1-3):    A C E     = A minor
vii° chord (7-2-4):  B D F     = B diminished
```

**Key insight**: Each chord quality (major/minor/diminished) follows naturally from the scale intervals.

**In code**:
```javascript
const cMajorChords = generateDiatonicChords(60, 'major');
// Returns array of 7 chord objects with notes and harmonic function

// Each chord object contains:
// { degree: 1, roman: 'I', notes: [60, 64, 67], quality: 'major', ... }
```

### Voice Leading

**Voice leading** is the art of connecting chords smoothly.

**Goal**: Minimize note movement between chords for smooth transitions.

**Example**:
```
C Major to F Major:

Root position:
C Major = C E G (60, 64, 67)
F Major = F A C (65, 69, 72)
Total movement: (65-60) + (69-64) + (72-67) = 5+5+5 = 15 semitones

Better with inversion:
C Major = C E G (60, 64, 67)
F Major = C F A (60, 65, 69) [first inversion]
Total movement: (60-60) + (65-64) + (69-67) = 0+1+2 = 3 semitones (much better!)
```

**In code**:
```javascript
const voiceLeading = calculateVoiceLeading([60, 64, 67], [65, 69, 72]);
// Returns: {
//   bestInversion: 1,
//   suggestedNotes: [60, 65, 69],
//   minDistance: 3
// }
```

---

## Part 4: Chord Progressions

### What is a Chord Progression?

A **chord progression** is a sequence of chords forming the harmonic structure of a song.

**Why progressions matter**:
- Create the "emotional journey" of a song
- Foundation of songwriting
- Can analyze any song by its progression
- Different progressions evoke different feelings

### Harmonic Function

Each chord plays a role in the harmonic scheme:

**Tonic (I chord)**: Home, rest, resolution
- Stable and satisfying
- Where you want to end
- Creates sense of arrival

**Subdominant (IV chord)**: Moving away from home
- Prepares for the dominant
- Pre-dominant function
- Creates sense of progression

**Dominant (V chord)**: Tension, needs resolution
- Wants to resolve back to tonic
- Creates anticipation
- Strongest harmonic pull

**Pre-dominant (ii, iii, vi chords)**: Leads to dominant
- Bridges between tonic and dominant
- Smooth transitions
- Flexible harmonic function

### Common Progressions

**I-IV-V-I** (Classic progression)
```
C Major: C - F - G - C
Roman: I - IV - V - I
Function: Tonic - Subdominant - Dominant - Tonic
Feel: Resolved, satisfied, complete
```

**vi-IV-I-V** (Sad to happy)
```
C Major: Am - F - C - G
Roman: vi - IV - I - V
Feel: Emotional journey from sadness to joy
```

**I-V-vi-IV** (Modern pop)
```
C Major: C - G - Am - F
Roman: I - V - vi - IV
Feel: Uplifting, energetic, extremely popular
Used in: Countless pop songs
```

**ii-V-I** (Jazz standard)
```
C Major: Dm - G - C
Roman: ii - V - I
Function: Pre-dominant - Dominant - Tonic
Feel: Smooth, professional, sophisticated
```

**12-Bar Blues**
```
C Blues:
I I I I I IV IV I I V IV I (V)
C C C C C F F C C G F C
```

**In code**:
```javascript
const progression = generateProgression(60, 'major', ['I', 'IV', 'V', 'I']);
// Returns array of chord objects with full voice leading applied
```

### Cadences

A **cadence** is the ending phrase of a chord progression that creates closure.

**Authentic (Perfect) Cadence**: V - I
- Strongest resolution
- Feels complete and final
- Most common ending

**Plagal Cadence**: IV - I
- Peaceful, hymn-like
- Feels final but softer than authentic

**Deceptive Cadence**: V - vi
- Expects I but gets vi (relative minor)
- Creates surprise and pathos
- Often continues the song

**Half Cadence**: I - V (or IV - V)
- Ends on V (tension, not resolution)
- Feels incomplete, invites continuation
- Creates anticipation

---

## Part 5: Code Examples

### Example 1: Generate a Major Scale

```javascript
import { generateScale, getScaleNoteNames } from '@audio/music-theory';

// Generate C Major scale
const cMajor = generateScale(60, 'major', 2);  // 2 octaves
console.log(cMajor);
// Output: [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83]

// Get note names
const notes = getScaleNoteNames(60, 'major', 2);
console.log(notes);
// Output: ["C5", "D5", "E5", "F5", "G5", "A5", "B5", "C6", "D6", "E6", "F6", "G6", "A6", "B6"]
```

### Example 2: Generate Diatonic Chords

```javascript
import { generateDiatonicChords } from '@audio/music-theory';

// Get all diatonic chords in C Major
const chords = generateDiatonicChords(60, 'major');

// Returns:
// [
//   { degree: 1, roman: 'I', notes: [60, 64, 67], quality: 'major' },
//   { degree: 2, roman: 'ii', notes: [62, 65, 69], quality: 'minor' },
//   { degree: 3, roman: 'iii', notes: [64, 67, 71], quality: 'minor' },
//   { degree: 4, roman: 'IV', notes: [65, 69, 72], quality: 'major' },
//   { degree: 5, roman: 'V', notes: [67, 71, 74], quality: 'major' },
//   { degree: 6, roman: 'vi', notes: [69, 72, 76], quality: 'minor' },
//   { degree: 7, roman: 'vii°', notes: [71, 74, 77], quality: 'diminished' }
// ]
```

### Example 3: Create a Chord Progression

```javascript
import { generateProgression, analyzeVoiceLeading } from '@audio/music-theory';

// Create I-IV-V-I progression in C Major
const progression = generateProgression(60, 'major', ['I', 'IV', 'V', 'I']);

// Analyze voice leading
const analysis = analyzeVoiceLeading(progression);
console.log(analysis.quality);  // 'good' or 'excellent'

// Use progression for playback
for (const chord of progression) {
  console.log(`Playing ${chord.roman}: ${chord.notes}`);
  audioState.playChord(chord.notes, 1.0);  // 1 second duration
}
```

### Example 4: MIDI Conversion

```javascript
import {
  midiToNoteName,
  noteNameToMidi,
  midiToFrequency,
  getIntervalName
} from '@audio/music-theory';

// MIDI to note name
midiToNoteName(60);   // "C5" (Middle C)
midiToNoteName(69);   // "A4" (Concert pitch)
midiToNoteName(61);   // "C#5"

// Note name to MIDI
noteNameToMidi('C5');   // 60
noteNameToMidi('A4');   // 69
noteNameToMidi('Bb5');  // 70

// MIDI to frequency
midiToFrequency(69);    // 440 (Hz)
midiToFrequency(60);    // ~261.63 (Hz)

// Interval names
getIntervalName(0);     // "unison"
getIntervalName(7);     // "perfect 5th"
getIntervalName(12);    // "octave"
```

### Example 5: Work with Different Scales

```javascript
import { generateScale, getAvailableScales } from '@audio/music-theory';

// List all available scales
const scales = getAvailableScales();
// Returns: ['major', 'minorNatural', 'minorHarmonic', 'minorMelodic',
//          'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian',
//          'majorPentatonic', 'minorPentatonic', 'blues']

// Generate different scales starting from C
const cMajor = generateScale(60, 'major');
const cDorian = generateScale(60, 'dorian');
const cBlues = generateScale(60, 'blues');
```

---

## Part 6: Learning Path

### Beginner (Understand Basic Concepts)

1. **MIDI and Notes**
   - Understand MIDI note numbering (0-127)
   - Know Middle C (MIDI 60) and A4 (MIDI 69)
   - Practice converting between note names and MIDI

2. **Major and Minor Scales**
   - Listen to C Major vs C minor
   - Understand interval patterns
   - Generate scales in code

3. **Basic Triads**
   - Learn major, minor, diminished sounds
   - Generate chords from scales
   - Play them on a keyboard

4. **Simple Progressions**
   - I-IV-V-I (fundamental)
   - vi-IV-I-V (emotional)
   - I-V-vi-IV (pop)

### Intermediate (Combine Concepts)

1. **Harmonic Function**
   - Understand tonic/subdominant/dominant
   - Predict chord behavior
   - Analyze real songs

2. **Voice Leading**
   - Smooth chord transitions
   - Calculate voice leading
   - Apply inversions

3. **Extended Chords**
   - Add seventh, ninth, etc.
   - Understand jazz chord symbols
   - Use in progressions

4. **Modal Music**
   - Understand modes as borrowed chords
   - Use modes in improvisation
   - Create exotic sounds

### Advanced (Create Original Music)

1. **Composition**
   - Write original progressions
   - Understand harmonic tension/release
   - Use voice leading intentionally

2. **Improvisation**
   - Understand scale/chord relationships
   - Target chord tones
   - Create melodic lines

3. **Harmonic Analysis**
   - Analyze complex songs
   - Understand non-diatonic chords
   - Recognize compositional techniques

---

## Part 7: Reference Tables

### Note Numbers and Names

| MIDI | Note | Frequency | Context |
|------|------|-----------|---------|
| 21 | A0 | 27.5 Hz | Lowest piano key |
| 24 | C1 | 32.7 Hz | |
| 48 | C4 | 130.8 Hz | One octave below Middle C |
| 60 | C5 | 261.6 Hz | **Middle C** (common reference) |
| 69 | A4 | 440 Hz | **Concert Pitch** (tuning standard) |
| 81 | A5 | 880 Hz | |
| 108 | C8 | 4186 Hz | Highest piano key |

### Scale Degree Names

| Degree | Roman | Name | Function |
|--------|-------|------|----------|
| 1 | I | Tonic | Home |
| 2 | II | Supertonic | Pre-dominant |
| 3 | III | Mediant | Relative |
| 4 | IV | Subdominant | Moving away |
| 5 | V | Dominant | Tension |
| 6 | VI | Submediant | Relative |
| 7 | VII | Subtonic/Leading tone | Pulls to I |

### Interval Names and Semitones

| Semitones | Interval | Example |
|-----------|----------|---------|
| 0 | Unison | C - C |
| 1 | Minor 2nd | C - Db |
| 2 | Major 2nd | C - D |
| 3 | Minor 3rd | C - Eb |
| 4 | Major 3rd | C - E |
| 5 | Perfect 4th | C - F |
| 6 | Tritone | C - F# |
| 7 | Perfect 5th | C - G |
| 8 | Minor 6th | C - Ab |
| 9 | Major 6th | C - A |
| 10 | Minor 7th | C - Bb |
| 11 | Major 7th | C - B |
| 12 | Octave | C - C |

---

## Conclusion

This music theory module provides:
- **Comprehensive scale system** (major, minor, modes, pentatonic, blues)
- **Complete chord generation** (triads, sevenths, inversions)
- **Voice leading algorithms** (smooth transitions)
- **Progression analysis** (harmonic function, cadences)
- **MIDI utilities** (conversion, transposition, intervals)

All with **educational documentation** explaining the "why" behind each concept.

Use this to build audio applications that teach music while being musically correct!

---

**Last Updated**: October 29, 2025
**Module Status**: ✅ Complete and Production Ready

