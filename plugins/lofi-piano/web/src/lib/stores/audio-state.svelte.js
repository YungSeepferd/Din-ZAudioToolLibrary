/**
 * Audio State Management
 *
 * Reactive state for the LoFi Piano using Svelte 5 Runes.
 * This file uses .svelte.js extension for shared reactive logic.
 *
 * @module stores/audio-state
 */

import { $state, $derived } from 'svelte';

/**
 * Create the global audio state object
 * @returns {Object} Audio state with $state and $derived properties
 */
export function createAudioState() {
  // Piano state
  let pianoState = $state({
    isPlaying: false,
    activeNotes: new Set(),
    masterVolume: 0.5,
    presetIndex: 0
  });

  // Synthesis parameters
  let synthesis = $state({
    frequency: 440,
    detune: [0, 15, -20],
    velocity: 100
  });

  // Envelope parameters
  let envelope = $state({
    attack: 0.05,
    decay: 0.2,
    sustain: 0.6,
    release: 1.0
  });

  // Effect parameters
  let effects = $state({
    saturation: 0.3,
    compression: {
      threshold: -24,
      ratio: 4,
      attack: 0.003,
      release: 0.25
    },
    reverb: {
      wet: 0.3,
      dry: 0.7,
      time: 2.0
    }
  });

  // Computed derived values
  const frequency$derived = $derived(synthesis.frequency);
  const isActiveNote$ = (note) => $derived(pianoState.activeNotes.has(note));

  return {
    // State objects
    pianoState,
    synthesis,
    envelope,
    effects,

    // Derived values
    frequency$derived,
    isActiveNote$,

    // Methods
    playNote(note, velocity = 100) {
      pianoState.activeNotes.add(note);
      pianoState.isPlaying = pianoState.activeNotes.size > 0;
      synthesis.frequency = noteToFrequency(note);
      synthesis.velocity = velocity;
    },

    stopNote(note) {
      pianoState.activeNotes.delete(note);
      pianoState.isPlaying = pianoState.activeNotes.size > 0;
    },

    stopAll() {
      pianoState.activeNotes.clear();
      pianoState.isPlaying = false;
    },

    setParameter(path, value) {
      const keys = path.split('.');
      let obj = this;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
    }
  };
}

/**
 * Convert MIDI note to frequency
 * @param {number} note - MIDI note (0-127)
 * @returns {number} Frequency in Hz
 */
export function noteToFrequency(note) {
  // A4 (MIDI note 69) = 440 Hz
  return 440 * Math.pow(2, (note - 69) / 12);
}

/**
 * Convert frequency to MIDI note
 * @param {number} frequency - Frequency in Hz
 * @returns {number} MIDI note (0-127)
 */
export function frequencyToNote(frequency) {
  return Math.round(69 + 12 * Math.log2(frequency / 440));
}

/**
 * Singleton instance
 */
export const audioState = createAudioState();
