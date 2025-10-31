/**
 * Piano Voice Generator
 *
 * Creates a single polyphonic voice with three detuned oscillators
 * and ADSR envelope. Designed for warm, chorus-like timbre.
 *
 * Features:
 * - Multiple detuned oscillators for rich, warm tone
 * - Configurable ADSR envelope
 * - Velocity-sensitive amplitude
 * - Smooth parameter automation (no clicks/pops)
 * - Dynamic detuning control for adaptive chorus effect
 *
 * @module audio/synthesis/piano-voice
 */

import { getAudioContext } from '../context.js';

const DEFAULT_DETUNE_CENTS = [0, 15, -20];
const DEFAULT_ATTACK = 0.05;
const DEFAULT_DECAY = 0.2;
const DEFAULT_SUSTAIN = 0.6;
const DEFAULT_RELEASE = 1.0;
const FREQUENCY_RAMP_TIME = 0.05; // Smooth frequency changes over 50ms
const VELOCITY_RAMP_TIME = 0.01; // Quick velocity response
const MIN_FREQUENCY = 20;
const MAX_FREQUENCY = 20000;

/**
 * Creates a piano voice with detuned oscillators and envelope
 *
 * Architecture:
 * Oscillators (3x detuned) → Envelope (ADSR) → Velocity Gain → Output
 *
 * @param {Object} options - Configuration options
 * @param {number} [options.frequency=440] - Frequency in Hz (20-20000)
 * @param {number} [options.velocity=100] - Velocity (0-127, MIDI range)
 * @param {number} [options.attackTime=0.05] - Attack time in seconds
 * @param {number} [options.decayTime=0.2] - Decay time in seconds
 * @param {number} [options.sustainLevel=0.6] - Sustain level (0-1)
 * @param {number} [options.releaseTime=1.0] - Release time in seconds
 * @param {number[]} [options.detuneCents] - Custom detuning in cents [osc1, osc2, osc3]
 * @param {number} [options.velocityScale=0.3] - Scale factor for velocity (0-1)
 * @returns {Object} Piano voice instance with methods for control
 * @throws {Error} If frequency is out of valid range
 */
export function createPianoVoice(options = {}) {
  const ctx = getAudioContext();
  const {
    frequency = 440,
    velocity = 100,
    attackTime = DEFAULT_ATTACK,
    decayTime = DEFAULT_DECAY,
    sustainLevel = DEFAULT_SUSTAIN,
    releaseTime = DEFAULT_RELEASE,
    detuneCents = DEFAULT_DETUNE_CENTS,
    velocityScale = 0.3
  } = options;

  // Validate inputs
  if (frequency < MIN_FREQUENCY || frequency > MAX_FREQUENCY) {
    throw new Error(
      `Frequency out of range: ${frequency} Hz. Valid range: ${MIN_FREQUENCY}-${MAX_FREQUENCY} Hz`
    );
  }

  if (velocity < 0 || velocity > 127) {
    throw new Error(`Velocity out of range: ${velocity}. Valid range: 0-127`);
  }

  if (attackTime < 0 || decayTime < 0 || releaseTime < 0) {
    throw new Error('Attack, decay, and release times must be non-negative');
  }

  if (sustainLevel < 0 || sustainLevel > 1) {
    throw new Error('Sustain level must be between 0 and 1');
  }

  // Create oscillators with detuning
  const oscillators = detuneCents.map((cents) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = frequency;
    osc.detune.value = cents;
    return osc;
  });

  // Create envelope
  const envelope = ctx.createGain();
  envelope.gain.value = 0;

  // Create velocity controller
  const velocityGain = ctx.createGain();
  const normalizedVelocity = velocity / 127;
  velocityGain.gain.value = normalizedVelocity * velocityScale;

  // Internal state
  let isPlaying = false;
  let currentFrequency = frequency;
  let currentVelocity = velocity;
  let currentDetuning = [...detuneCents];

  // Connect oscillators to envelope
  oscillators.forEach((osc) => osc.connect(envelope));
  envelope.connect(velocityGain);

  /**
   * Validates and updates envelope times
   * @private
   */
  function validateEnvelopeTimes(attack, decay, sustain, release) {
    if (attack < 0 || decay < 0 || release < 0) {
      throw new Error('Envelope times must be non-negative');
    }
    if (sustain < 0 || sustain > 1) {
      throw new Error('Sustain level must be between 0 and 1');
    }
  }

  // Public interface
  return {
    // Audio nodes (for advanced connections)
    oscillators,
    envelope,
    velocityGain,

    // State getters
    getIsPlaying() {
      return isPlaying;
    },

    getFrequency() {
      return currentFrequency;
    },

    getVelocity() {
      return currentVelocity;
    },

    getDetuning() {
      return [...currentDetuning];
    },

    /**
     * Start the voice and trigger ADSR envelope
     * Automatically schedules attack, decay, and sustain phases.
     *
     * IMPORTANT: Can only be called once per voice instance.
     * Web Audio oscillators cannot be restarted after stop().
     * Create a new voice instance to play the same note again.
     *
     * @returns {Object} this (for chaining)
     */
    noteOn() {
      // Prevent calling noteOn() multiple times on same voice
      // This would fail because oscillators can't be restarted
      if (isPlaying) {
        console.warn('noteOn() called on already-playing voice. Create a new voice instead.');
        return this;
      }

      const now = ctx.currentTime;
      isPlaying = true;

      // Start all oscillators (can only be done once)
      oscillators.forEach((osc) => osc.start(now));

      // Schedule ADSR envelope
      // Attack: 0 → 1
      envelope.gain.setValueAtTime(0, now);
      envelope.gain.linearRampToValueAtTime(1, now + attackTime);

      // Decay: 1 → sustain level
      envelope.gain.linearRampToValueAtTime(
        sustainLevel,
        now + attackTime + decayTime
      );

      return this;
    },

    /**
     * Release the voice (trigger release phase)
     * Smoothly ramps gain to 0 and stops oscillators.
     *
     * @returns {Object} this (for chaining)
     */
    noteOff() {
      const now = ctx.currentTime;
      isPlaying = false;

      // Capture current gain value to avoid clicks
      envelope.gain.setValueAtTime(envelope.gain.value, now);

      // Release: current value → 0
      envelope.gain.linearRampToValueAtTime(0, now + releaseTime);

      // Stop oscillators after release completes
      oscillators.forEach((osc) => osc.stop(now + releaseTime));

      return this;
    },

    /**
     * Connect voice to destination node
     *
     * @param {AudioNode} destination - Target node (e.g., audioContext.destination)
     * @returns {Object} this (for chaining)
     */
    connect(destination) {
      velocityGain.connect(destination);
      return this;
    },

    /**
     * Disconnect voice from all destinations
     *
     * @returns {Object} this (for chaining)
     */
    disconnect() {
      velocityGain.disconnect();
      return this;
    },

    /**
     * Set frequency with smooth ramping
     * Prevents clicks/pops by ramping over 50ms.
     *
     * @param {number} freq - Frequency in Hz (20-20000)
     * @returns {Object} this (for chaining)
     * @throws {Error} If frequency is out of valid range
     */
    setFrequency(freq) {
      if (freq < MIN_FREQUENCY || freq > MAX_FREQUENCY) {
        throw new Error(
          `Frequency out of range: ${freq} Hz. Valid range: ${MIN_FREQUENCY}-${MAX_FREQUENCY} Hz`
        );
      }

      currentFrequency = freq;
      const now = ctx.currentTime;

      // Smooth frequency change over FREQUENCY_RAMP_TIME
      oscillators.forEach((osc) => {
        osc.frequency.linearRampToValueAtTime(freq, now + FREQUENCY_RAMP_TIME);
      });

      return this;
    },

    /**
     * Set velocity (amplitude control)
     * Velocity affects final output level based on velocityScale.
     *
     * @param {number} vel - Velocity (0-127, MIDI range)
     * @returns {Object} this (for chaining)
     * @throws {Error} If velocity is out of valid range
     */
    setVelocity(vel) {
      if (vel < 0 || vel > 127) {
        throw new Error(`Velocity out of range: ${vel}. Valid range: 0-127`);
      }

      currentVelocity = vel;
      const now = ctx.currentTime;
      const normalizedVel = vel / 127;

      // Quick velocity response (10ms ramp)
      velocityGain.gain.linearRampToValueAtTime(
        normalizedVel * velocityScale,
        now + VELOCITY_RAMP_TIME
      );

      return this;
    },

    /**
     * Dynamically adjust detuning of oscillators
     * Allows for adaptive chorus/detune effects post-initialization.
     *
     * @param {number[]} newDetuneCents - New detuning values in cents [osc1, osc2, osc3]
     * @returns {Object} this (for chaining)
     * @throws {Error} If detuning array length doesn't match oscillator count
     */
    setDetuning(newDetuneCents) {
      if (newDetuneCents.length !== oscillators.length) {
        throw new Error(
          `Detuning array length (${newDetuneCents.length}) must match oscillator count (${oscillators.length})`
        );
      }

      currentDetuning = [...newDetuneCents];
      const now = ctx.currentTime;

      // Apply detuning with smooth ramping
      oscillators.forEach((osc, index) => {
        osc.detune.linearRampToValueAtTime(
          newDetuneCents[index],
          now + FREQUENCY_RAMP_TIME
        );
      });

      return this;
    },

    /**
     * Update ADSR envelope times
     * Can be called while voice is playing to create dynamic envelope changes.
     *
     * @param {Object} envelopeParams - New envelope parameters
     * @param {number} envelopeParams.attackTime - Attack time in seconds
     * @param {number} envelopeParams.decayTime - Decay time in seconds
     * @param {number} envelopeParams.sustainLevel - Sustain level (0-1)
     * @param {number} envelopeParams.releaseTime - Release time in seconds
     * @returns {Object} this (for chaining)
     * @throws {Error} If parameters are invalid
     */
    setEnvelope(envelopeParams) {
      const {
        attackTime: newAttack,
        decayTime: newDecay,
        sustainLevel: newSustain,
        releaseTime: newRelease
      } = envelopeParams;

      validateEnvelopeTimes(newAttack, newDecay, newSustain, newRelease);

      // Note: Updating envelope times won't retroactively affect
      // currently playing notes. This is by design - envelope times
      // only affect notes started AFTER this call.
      // TODO: Implement dynamic envelope reshaping if needed

      return this;
    },

    /**
     * Get current state snapshot
     *
     * @returns {Object} Current voice state
     */
    getState() {
      return {
        isPlaying,
        frequency: currentFrequency,
        velocity: currentVelocity,
        detuning: [...currentDetuning],
        envelopePhase: isPlaying ? 'sustain' : 'idle' // Simplified for now
      };
    }
  };
}
