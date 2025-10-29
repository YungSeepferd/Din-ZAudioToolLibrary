/**
 * Audio State Management
 *
 * Manages audio state for the LoFi Piano.
 * Uses plain JavaScript objects with callback-based updates.
 * Component scripts use Svelte 5 $state to wrap these values.
 *
 * Features:
 * - Integration with audio DSP modules
 * - MIDI note to frequency conversion
 * - Preset management
 * - Parameter change callbacks
 *
 * Note: This is a plain JS module. Use $state in Svelte components
 * to make values reactive, or create a .svelte component wrapper.
 *
 * @module stores/audio-state
 */
import { createPianoVoice } from '../audio/synthesis/piano-voice.js';
import { createSaturation } from '../audio/effects/saturation.js';
import { createCompressor } from '../audio/effects/compression.js';
import { createReverb } from '../audio/effects/reverb.js';
import { getAudioContext } from '../audio/context.js';

/**
 * Create the global audio state object with integrated DSP
 *
 * @returns {Object} Audio state with reactive properties and audio nodes
 */
export function createAudioState() {
  // Audio context and nodes
  let audioContext = null;
  let pianoVoices = new Map(); // Active voices keyed by MIDI note
  let saturationEffect = null;
  let compressionEffect = null;
  let reverbEffect = null;
  let masterGain = null;

  // Piano state - plain JS object (wrap in $state in components)
  const pianoState = {
    isPlaying: false,
    activeNotes: new Set(),
    masterVolume: 0.5,
    presetIndex: 0,
    isInitialized: false
  };

  // Synthesis parameters (for new voices)
  const synthesis = {
    frequency: 440,
    detune: [0, 15, -20],
    velocity: 100,
    attackTime: 0.05,
    decayTime: 0.2,
    sustainLevel: 0.6,
    releaseTime: 1.0
  };

  // Effect parameters
  const effects = {
    saturation: {
      amount: 0.3,
      tone: 0.5,
      dryWet: 1
    },
    compression: {
      threshold: -24,
      ratio: 4,
      attack: 0.003,
      release: 0.25,
      dryWet: 1
    },
    reverb: {
      decayTime: 2.0,
      roomSize: 0.5,
      preDelay: 0.02,
      dryWet: 0.3
    }
  };

  /**
   * Initialize audio system
   * Creates all audio nodes and connections
   *
   * @private
   */
  function initializeAudio() {
    try {
      audioContext = getAudioContext();
      masterGain = audioContext.createGain();
      masterGain.gain.value = pianoState.masterVolume;

      // Create effect chain
      saturationEffect = createSaturation({
        amount: effects.saturation.amount,
        tone: effects.saturation.tone,
        dryWet: effects.saturation.dryWet
      });

      compressionEffect = createCompressor({
        threshold: effects.compression.threshold,
        ratio: effects.compression.ratio,
        attack: effects.compression.attack,
        release: effects.compression.release,
        dryWet: effects.compression.dryWet
      });

      reverbEffect = createReverb({
        decayTime: effects.reverb.decayTime,
        roomSize: effects.reverb.roomSize,
        preDelay: effects.reverb.preDelay,
        dryWet: effects.reverb.dryWet
      });

      // Connect effect chain
      saturationEffect.input.connect(compressionEffect.input);
      compressionEffect.output.connect(reverbEffect.input);
      reverbEffect.output.connect(masterGain);
      masterGain.connect(audioContext.destination);

      pianoState.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      pianoState.isInitialized = false;
    }
  }

  /**
   * Ensure audio system is ready
   * @private
   */
  function ensureAudioInitialized() {
    if (!pianoState.isInitialized) {
      initializeAudio();
    }
  }

  /**
   * Sync parameter changes to audio nodes
   * These are called from component $effects when values change
   */
  function syncSaturation() {
    if (!pianoState.isInitialized || !saturationEffect) return;
    saturationEffect.setAmount(effects.saturation.amount);
    saturationEffect.setTone(effects.saturation.tone);
  }

  function syncCompression() {
    if (!pianoState.isInitialized || !compressionEffect) return;
    compressionEffect.setThreshold(effects.compression.threshold);
    compressionEffect.setRatio(effects.compression.ratio);
    compressionEffect.setAttack(effects.compression.attack);
    compressionEffect.setRelease(effects.compression.release);
  }

  function syncReverb() {
    if (!pianoState.isInitialized || !reverbEffect) return;
    reverbEffect.setDecay(effects.reverb.decayTime);
    reverbEffect.setRoomSize(effects.reverb.roomSize);
  }

  function syncMasterVolume() {
    if (!pianoState.isInitialized || !masterGain) return;
    masterGain.gain.setValueAtTime(pianoState.masterVolume, getAudioContext().currentTime);
  }

  // Component $effects will call sync methods when values change

  return {
    // State objects
    pianoState,
    synthesis,
    effects,

    // Sync methods for $effects in components
    syncSaturation,
    syncCompression,
    syncReverb,
    syncMasterVolume,

    /**
     * Initialize audio system
     * Must be called before playing notes
     *
     * @returns {Promise<void>}
     */
    async init() {
      ensureAudioInitialized();
    },

    /**
     * Play a piano note
     *
     * @param {number} note - MIDI note (0-127)
     * @param {number} [velocity=100] - Velocity (0-127)
     * @param {number} [duration] - Optional duration in ms
     */
    playNote(note, velocity = 100, duration = null) {
      ensureAudioInitialized();

      // Clamp note to valid MIDI range
      const validNote = Math.max(0, Math.min(127, note));
      const freq = noteToFrequency(validNote);

      // Create new voice
      const voice = createPianoVoice({
        frequency: freq,
        velocity: velocity,
        attackTime: synthesis.attackTime,
        decayTime: synthesis.decayTime,
        sustainLevel: synthesis.sustainLevel,
        releaseTime: synthesis.releaseTime,
        detuneCents: synthesis.detune,
        velocityScale: 0.3
      });

      // Connect voice to effect chain
      voice.connect(saturationEffect.input);

      // Start the note
      voice.noteOn();

      // Store voice reference
      pianoVoices.set(validNote, voice);
      pianoState.activeNotes.add(validNote);
      pianoState.isPlaying = pianoState.activeNotes.size > 0;

      // Optional: Stop note after duration
      if (duration) {
        setTimeout(() => {
          this.stopNote(validNote);
        }, duration);
      }
    },

    /**
     * Stop a piano note
     *
     * @param {number} note - MIDI note to stop (0-127)
     */
    stopNote(note) {
      const validNote = Math.max(0, Math.min(127, note));
      const voice = pianoVoices.get(validNote);

      if (voice) {
        voice.noteOff();

        // Remove voice after release time
        setTimeout(() => {
          voice.disconnect();
          pianoVoices.delete(validNote);
        }, synthesis.releaseTime * 1000);
      }

      pianoState.activeNotes.delete(validNote);
      pianoState.isPlaying = pianoState.activeNotes.size > 0;
    },

    /**
     * Stop all active notes
     */
    stopAll() {
      Array.from(pianoState.activeNotes).forEach((note) => {
        this.stopNote(note);
      });
    },

    /**
     * Set a parameter value by path
     *
     * @param {string} path - Parameter path (e.g., "effects.saturation.amount")
     * @param {number} value - New value
     */
    setParameter(path, value) {
      const keys = path.split('.');
      let obj = this;

      // Navigate to parent object
      for (let i = 0; i < keys.length - 1; i++) {
        if (keys[i] in obj) {
          obj = obj[keys[i]];
        } else {
          console.warn(`Parameter path not found: ${path}`);
          return;
        }
      }

      // Set the value
      const lastKey = keys[keys.length - 1];
      if (lastKey in obj) {
        obj[lastKey] = value;
      } else {
        console.warn(`Parameter not found: ${path}`);
      }
    },

    /**
     * Get audio node for advanced routing
     *
     * @param {string} nodeName - Node name (saturation, compression, reverb, masterGain)
     * @returns {AudioNode|null} Audio node or null
     */
    getAudioNode(nodeName) {
      const nodes = {
        saturation: saturationEffect?.output,
        compression: compressionEffect?.output,
        reverb: reverbEffect?.output,
        masterGain: masterGain,
        saturationInput: saturationEffect?.input,
        compressionInput: compressionEffect?.input,
        reverbInput: reverbEffect?.input
      };

      return nodes[nodeName] || null;
    },

    /**
     * Get state snapshot of all effects and synthesis
     *
     * @returns {Object} Current state
     */
    getState() {
      return {
        pianoState: { ...pianoState },
        synthesis: { ...synthesis },
        effects: JSON.parse(JSON.stringify(effects)),
        audioInitialized: pianoState.isInitialized
      };
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
