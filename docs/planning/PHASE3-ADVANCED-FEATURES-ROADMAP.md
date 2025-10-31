# Phase 3: Advanced Features Roadmap

## Overview

Phase 3 adds sophisticated features for power users and music educators, transforming the MIDI Chord Generator into a comprehensive music creation and learning platform.

**Status**: 🎯 Planned for implementation
**Estimated Duration**: 3-4 weeks
**Priority**: High (advanced functionality)

---

## Feature 1: Arrangement Variations

### Concept

Generate multiple arrangement variations for a progression:
- Arpeggios (broken chords in various patterns)
- Rhythmic patterns (straight, swing, funk, etc.)
- Octave doublings
- Voice texture variations

### Implementation Details

#### 1.1 Arpeggio Generator

Create `/shared/audio-core/arrangement/arpeggiator.js`:

```javascript
/**
 * Generates arpeggio patterns from chords
 */

export const ARPEGGIO_PATTERNS = {
  'up': {
    name: 'Up',
    pattern: [0, 1, 2, 1], // Root, 3rd, 5th, 3rd (repeating)
    description: 'Ascending then descending pattern'
  },
  'down': {
    name: 'Down',
    pattern: [2, 1, 0, 1], // Reverse of up
    description: 'Descending then ascending pattern'
  },
  'updown': {
    name: 'Up-Down',
    pattern: [0, 1, 2, 1], // Full up and down
    description: 'Simple back-and-forth motion'
  },
  'bounce': {
    name: 'Bounce',
    pattern: [0, 2, 1, 2], // Root, 5th, 3rd, 5th
    description: 'Bouncing between high and low'
  },
  'pinch': {
    name: 'Pinch',
    pattern: [0, 2, 1, 2], // Alternates edges
    description: 'Pinches between outer notes'
  },
  'spiral': {
    name: 'Spiral',
    pattern: [0, 1, 2, 1, 0, 1, 2], // Longer spiral pattern
    description: 'Wider spiraling motion'
  },
};

export class Arpeggiator {
  constructor(chord, pattern = 'up', tempo = 120) {
    this.chord = chord;
    this.pattern = ARPEGGIO_PATTERNS[pattern];
    this.tempo = tempo;
  }

  generateArpeggio(duration = 4) {
    // Generate individual note events from chord
    const notes = [];
    const beatDuration = (60 / this.tempo);
    let currentTime = 0;

    const repeatCount = Math.ceil(duration / this.pattern.pattern.length);
    const notes_flat = [...this.chord.notes, ...this.chord.notes.slice(0, -1)];

    for (let i = 0; i < repeatCount; i++) {
      for (const noteIndex of this.pattern.pattern) {
        if (currentTime >= duration) break;

        notes.push({
          midi: notes_flat[noteIndex],
          startTime: currentTime,
          duration: beatDuration * 0.8, // Leave gap for articulation
          velocity: 0.8,
        });

        currentTime += beatDuration;
      }
    }

    return notes.slice(0, Math.ceil(duration / beatDuration));
  }

  getAvailablePatterns() {
    return Object.keys(ARPEGGIO_PATTERNS);
  }
}
```

#### 1.2 Rhythm Generator

```javascript
/**
 * Applies rhythmic patterns to progressions
 */

export const RHYTHM_PATTERNS = {
  'straight': {
    name: 'Straight',
    pattern: [1, 0, 0.5, 0.5], // Whole, two eighths
    swing: 0,
  },
  'swing': {
    name: 'Swing',
    pattern: [1, 0, 0.5, 0.5],
    swing: 0.33, // Shuffle/triplet feel
  },
  'funk': {
    name: 'Funk',
    pattern: [0.75, 0.25, 0.5, 1], // Syncopated
    swing: 0.2,
  },
  'jazz': {
    name: 'Jazz',
    pattern: [1, 0.5, 0.5, 0.5, 0.5],
    swing: 0.5, // Heavy swing
  },
  'bossa': {
    name: 'Bossa Nova',
    pattern: [0.5, 1, 0.5, 0.5, 0.5],
    swing: 0.25,
  },
};

export class RhythmGenerator {
  constructor(progression, rhythmPattern = 'straight', tempo = 120) {
    this.progression = progression;
    this.rhythmPattern = RHYTHM_PATTERNS[rhythmPattern];
    this.tempo = tempo;
  }

  generateRhythm() {
    // Apply rhythm pattern to each chord
    return this.progression.map((chord, index) => {
      const pattern = this.rhythmPattern.pattern;
      const duration = pattern.reduce((a, b) => a + b) * (60 / this.tempo);

      return {
        ...chord,
        duration,
        rhythm: this.rhythmPattern.name,
        startTime: this.calculateStartTime(index),
      };
    });
  }

  calculateStartTime(chordIndex) {
    let time = 0;
    for (let i = 0; i < chordIndex; i++) {
      time += this.progression[i].duration || 2;
    }
    return time;
  }
}
```

#### 1.3 Arrangement Component

```svelte
<script>
  import { Arpeggiator, RhythmGenerator } from '@audio/arrangement';

  let progression = $props();
  let selectedArpeggio = $state('up');
  let selectedRhythm = $state('straight');
  let tempo = $state(120);

  let generatedNotes = $derived.by(() => {
    if (!progression) return [];

    let notes = [];
    let currentTime = 0;

    progression.forEach(chord => {
      const arpeggiator = new Arpeggiator(chord, selectedArpeggio, tempo);
      const arpNotes = arpeggiator.generateArpeggio(2); // 2 beat duration

      const withTime = arpNotes.map(note => ({
        ...note,
        startTime: currentTime + note.startTime,
      }));

      notes = [...notes, ...withTime];
      currentTime += 2;
    });

    return notes;
  });

  function playArrangement() {
    audioState.playArrangement(generatedNotes);
  }
</script>

<div class="arrangement-controls">
  <div class="control-group">
    <label>Arpeggio Pattern:</label>
    <select bind:value={selectedArpeggio}>
      <option value="up">Up</option>
      <option value="down">Down</option>
      <option value="bounce">Bounce</option>
      <option value="spiral">Spiral</option>
    </select>
  </div>

  <div class="control-group">
    <label>Rhythm:</label>
    <select bind:value={selectedRhythm}>
      <option value="straight">Straight</option>
      <option value="swing">Swing</option>
      <option value="funk">Funk</option>
      <option value="jazz">Jazz</option>
    </select>
  </div>

  <button onclick={playArrangement}>Play Arrangement</button>
</div>

<style>
  .arrangement-controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
  }
</style>
```

---

## Feature 2: Ear Training Module

### Concept

Interactive exercises to develop music theory and listening skills:
- Chord recognition
- Interval identification
- Scale detection
- Progression listening
- Harmonic analysis

### Implementation Details

#### 2.1 Ear Training Engine

```javascript
/**
 * Ear training exercise generator and evaluator
 */

export const EXERCISE_TYPES = {
  'chord-recognition': {
    name: 'Chord Recognition',
    description: 'Identify played chords',
    difficulty: ['easy', 'medium', 'hard'],
  },
  'interval-identification': {
    name: 'Interval Identification',
    description: 'Name the interval between two notes',
    difficulty: ['easy', 'medium', 'hard'],
  },
  'scale-detection': {
    name: 'Scale Detection',
    description: 'Identify which scale is being played',
    difficulty: ['easy', 'medium', 'hard'],
  },
  'progression-listening': {
    name: 'Progression Listening',
    description: 'Identify chord progression from listening',
    difficulty: ['easy', 'medium', 'hard'],
  },
};

export class EarTrainingEngine {
  constructor() {
    this.score = 0;
    this.streak = 0;
    this.totalAnswers = 0;
  }

  generateChordRecognitionExercise(difficulty = 'easy') {
    const chordTypes = difficulty === 'easy'
      ? ['major', 'minor', 'dominant7']
      : ['major', 'minor', 'diminished', 'augmented', 'maj7', 'dom7'];

    const rootNote = Math.floor(Math.random() * 12) + 60;
    const chordType = chordTypes[Math.floor(Math.random() * chordTypes.length)];

    return {
      type: 'chord-recognition',
      chord: generateChord(rootNote, chordType),
      correctAnswer: chordType,
      options: this.getRandomWrongAnswers(chordType, chordTypes),
    };
  }

  generateIntervalExercise(difficulty = 'easy') {
    const intervals = difficulty === 'easy'
      ? ['major-3rd', 'perfect-5th', 'octave']
      : ['all']; // All possible intervals

    const rootNote = Math.floor(Math.random() * 12) + 60;
    const intervalSemitones = intervals[Math.floor(Math.random() * intervals.length)];
    const secondNote = rootNote + getIntervalSemitones(intervalSemitones);

    return {
      type: 'interval',
      notes: [rootNote, secondNote],
      correctAnswer: intervalSemitones,
      options: this.getRandomIntervalOptions(intervalSemitones),
    };
  }

  evaluateAnswer(userAnswer, exercise) {
    const correct = userAnswer === exercise.correctAnswer;

    if (correct) {
      this.streak++;
      this.score += 10 + this.streak;
    } else {
      this.streak = 0;
    }

    this.totalAnswers++;

    return {
      correct,
      streak: this.streak,
      score: this.score,
      correct_answer: exercise.correctAnswer,
    };
  }

  getRandomWrongAnswers(correct, pool) {
    return pool
      .filter(c => c !== correct)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
  }
}
```

#### 2.2 Ear Training Component

```svelte
<script>
  import { EarTrainingEngine } from '@audio/training';

  let engine = new EarTrainingEngine();
  let currentExercise = $state(null);
  let selectedAnswer = $state(null);
  let feedback = $state(null);
  let difficulty = $state('easy');

  onMount(() => {
    generateNewExercise();
  });

  function generateNewExercise() {
    currentExercise = engine.generateChordRecognitionExercise(difficulty);
    selectedAnswer = null;
    feedback = null;
  }

  function playExercise() {
    audioState.playChord(currentExercise.chord);
  }

  function submitAnswer(answer) {
    selectedAnswer = answer;
    const result = engine.evaluateAnswer(answer, currentExercise);
    feedback = result;
  }

  function nextExercise() {
    generateNewExercise();
  }
</script>

<div class="ear-training">
  <div class="header">
    <h2>Ear Training</h2>
    <div class="score">Score: {engine.score} | Streak: {engine.streak}</div>
  </div>

  <div class="difficulty">
    <label>Difficulty:</label>
    <select bind:value={difficulty} onchange={generateNewExercise}>
      <option value="easy">Easy</option>
      <option value="medium">Medium</option>
      <option value="hard">Hard</option>
    </select>
  </div>

  {#if currentExercise}
    <div class="exercise">
      <button onclick={playExercise} class="play-button">
        🔊 Play Sound
      </button>

      <div class="options">
        {#each currentExercise.options as option}
          <button
            onclick={() => submitAnswer(option)}
            class="option"
            disabled={selectedAnswer !== null}
          >
            {option}
          </button>
        {/each}
      </div>

      {#if feedback}
        <div class={feedback.correct ? 'correct' : 'incorrect'}>
          {feedback.correct ? '✓ Correct!' : '✗ Wrong'}
          {#if !feedback.correct}
            <p>The answer was: {feedback.correct_answer}</p>
          {/if}
        </div>

        <button onclick={nextExercise}>Next</button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .ear-training {
    padding: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 1rem;
    color: white;
  }

  .score {
    font-size: 1.2rem;
    margin-top: 0.5rem;
  }

  .options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin: 2rem 0;
  }

  .option {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid white;
    border-radius: 0.5rem;
    color: white;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.3s;
  }

  .option:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }

  .correct {
    color: #4caf50;
    font-weight: bold;
  }

  .incorrect {
    color: #f44336;
    font-weight: bold;
  }
</style>
```

---

## Feature 3: Preset System

### Concept

Save and load user preferences:
- Favorite progressions
- Preferred scales
- Custom arrangements
- Ear training progress
- UI preferences

### Implementation Details

#### 3.1 Preset Manager

```javascript
/**
 * Manages user presets and favorites
 */

export class PresetManager {
  constructor() {
    this.presets = this.loadPresets();
  }

  savePreset(name, progression, metadata = {}) {
    const preset = {
      id: Date.now(),
      name,
      progression,
      metadata: {
        ...metadata,
        createdAt: new Date().toISOString(),
        version: 1,
      },
    };

    this.presets[preset.id] = preset;
    this.persist();
    return preset;
  }

  loadPreset(id) {
    return this.presets[id];
  }

  deletePreset(id) {
    delete this.presets[id];
    this.persist();
  }

  getAllPresets() {
    return Object.values(this.presets);
  }

  getPresetsByTag(tag) {
    return Object.values(this.presets)
      .filter(p => p.metadata.tags?.includes(tag));
  }

  private loadPresets() {
    const stored = localStorage.getItem('chord-generator-presets');
    return stored ? JSON.parse(stored) : {};
  }

  private persist() {
    localStorage.setItem('chord-generator-presets', JSON.stringify(this.presets));
  }

  exportPresets() {
    const dataStr = JSON.stringify(this.presets, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    return dataBlob;
  }

  importPresets(fileContent) {
    try {
      const imported = JSON.parse(fileContent);
      Object.assign(this.presets, imported);
      this.persist();
      return true;
    } catch (e) {
      console.error('Failed to import presets:', e);
      return false;
    }
  }
}
```

---

## Feature 4: Collaborative Progression Builder

### Concept

Real-time collaboration features:
- Share progressions with others
- Collaborative editing with live updates
- Comments and suggestions
- Version history
- Export for sharing

### Implementation Details

#### 4.1 Collaboration Manager

```javascript
/**
 * Manages collaborative progression editing
 */

export class CollaborationManager {
  constructor(userId, progressionId) {
    this.userId = userId;
    this.progressionId = progressionId;
    this.collaborators = new Map();
    this.changeHistory = [];
  }

  async initializeSession() {
    // Connect to WebSocket or similar for real-time updates
    // await this.connectToCollaborativeServer();
  }

  shareProgression(emails) {
    // Invite specific users to collaborate
    return {
      shareUrl: `app.local/share/${this.progressionId}`,
      invitedUsers: emails,
    };
  }

  addCollaborator(userId, name, permissions = 'edit') {
    this.collaborators.set(userId, {
      name,
      permissions,
      joinedAt: new Date(),
      lastActive: new Date(),
    });
  }

  broadcastChange(change) {
    // Send chord change to all connected collaborators
    this.changeHistory.push({
      ...change,
      userId: this.userId,
      timestamp: new Date(),
    });

    // Notify other clients
    // this.webSocket.send(JSON.stringify(change));
  }

  addComment(position, text) {
    return {
      id: Date.now(),
      userId: this.userId,
      position, // Which chord
      text,
      timestamp: new Date(),
    };
  }

  getChangeHistory() {
    return this.changeHistory;
  }
}
```

---

## Implementation Order

1. **Week 1**: Arrangement Variations
   - Arpeggiator engine
   - Rhythm patterns
   - UI component
   - Playback integration

2. **Week 2**: Ear Training Module
   - Exercise generator
   - Evaluator
   - Interactive component
   - Score tracking

3. **Week 3**: Preset System
   - Preset manager
   - LocalStorage integration
   - Import/export
   - UI components

4. **Week 4**: Collaborative Features
   - Collaboration manager
   - WebSocket setup (optional)
   - Share component
   - Version history

---

## Success Criteria

- ✅ Arpeggiator generates varied patterns
- ✅ Ear training adjusts difficulty dynamically
- ✅ Presets save/load correctly
- ✅ Collaboration features work smoothly
- ✅ All tests passing
- ✅ Documentation complete

---

**Document Status**: 📋 Phase 3 Roadmap
**Target Start**: After Phase 2 completion
**Estimated Duration**: 3-4 weeks
