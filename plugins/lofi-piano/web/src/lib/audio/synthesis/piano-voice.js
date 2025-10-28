/**
 * Piano Voice Generator
 *
 * Creates a single polyphonic voice with three detuned oscillators
 * and ADSR envelope. Designed for warm, chorus-like timbre.
 *
 * @module audio/synthesis/piano-voice
 */

import { getAudioContext } from '../context.js';

const DEFAULT_DETUNE_CENTS = [0, 15, -20];
const DEFAULT_ATTACK = 0.05;
const DEFAULT_DECAY = 0.2;
const DEFAULT_SUSTAIN = 0.6;
const DEFAULT_RELEASE = 1;

/**
 * Creates a piano voice with detuned oscillators and envelope
 *
 * @param {Object} options - Configuration options
 * @param {number} options.frequency - Frequency in Hz
 * @param {number} options.velocity - Velocity (0-127)
 * @param {number} options.attackTime - Attack time in seconds
 * @param {number} options.decayTime - Decay time in seconds
 * @param {number} options.sustainLevel - Sustain level (0-1)
 * @param {number} options.releaseTime - Release time in seconds
 * @returns {Object} Piano voice instance
 */
export function createPianoVoice(options = {}) {
  const ctx = getAudioContext();
  const {
    frequency = 440,
    velocity = 100,
    attackTime = DEFAULT_ATTACK,
    decayTime = DEFAULT_DECAY,
    sustainLevel = DEFAULT_SUSTAIN,
    releaseTime = DEFAULT_RELEASE
  } = options;

  // Validate inputs
  if (frequency < 20 || frequency > 20000) {
    throw new Error(`Frequency out of range: ${frequency}`);
  }

  // Create oscillators with detuning
  const oscillators = DEFAULT_DETUNE_CENTS.map((cents) => {
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
  velocityGain.gain.value = normalizedVelocity * 0.3;

  // Connect oscillators to envelope
  oscillators.forEach((osc) => osc.connect(envelope));
  envelope.connect(velocityGain);

  // Public interface
  return {
    oscillators,
    envelope,
    velocityGain,

    /**
     * Start the voice and trigger envelope
     */
    noteOn() {
      const now = ctx.currentTime;
      oscillators.forEach((osc) => osc.start(now));

      // Envelope attack
      envelope.gain.setValueAtTime(0, now);
      envelope.gain.linearRampToValueAtTime(1, now + attackTime);

      // Envelope decay to sustain
      envelope.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
    },

    /**
     * Release the voice (trigger release phase)
     */
    noteOff() {
      const now = ctx.currentTime;
      envelope.gain.setValueAtTime(envelope.gain.value, now);
      envelope.gain.linearRampToValueAtTime(0, now + releaseTime);

      // Stop oscillators after release
      oscillators.forEach((osc) => osc.stop(now + releaseTime));
    },

    /**
     * Connect voice to destination
     * @param {AudioNode} destination - Where to connect
     */
    connect(destination) {
      velocityGain.connect(destination);
      return this;
    },

    /**
     * Disconnect from destination
     */
    disconnect() {
      velocityGain.disconnect();
    },

    /**
     * Set frequency
     * @param {number} freq - Frequency in Hz
     */
    setFrequency(freq) {
      const now = ctx.currentTime;
      oscillators.forEach((osc) => {
        osc.frequency.linearRampToValueAtTime(freq, now + 0.05);
      });
    },

    /**
     * Set velocity
     * @param {number} vel - Velocity (0-127)
     */
    setVelocity(vel) {
      const now = ctx.currentTime;
      const normalizedVel = vel / 127;
      velocityGain.gain.linearRampToValueAtTime(normalizedVel * 0.3, now + 0.01);
    }
  };
}
