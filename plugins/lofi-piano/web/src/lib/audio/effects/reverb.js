/**
 * Reverb Effect (Space & Ambience)
 *
 * Creates a simple reverb effect to add space and vintage character.
 * Uses a combination of delays to simulate room reflections.
 *
 * Features:
 * - Room size control
 * - Decay time control
 * - Pre-delay for realism
 * - Dry/wet mixing
 * - Simple convolver-based approach
 *
 * @module audio/effects/reverb
 */

import { getAudioContext } from '../context.js';

const DEFAULT_DECAY_TIME = 2.0; // seconds
const DEFAULT_ROOM_SIZE = 0.5; // 0-1
const DEFAULT_PRE_DELAY = 0.02; // 20ms
const DEFAULT_DRY_WET = 0.3; // Subtle reverb

/**
 * Creates a reverb effect for space and ambience
 *
 * @param {Object} options - Configuration options
 * @param {number} [options.decayTime=2.0] - Reverb decay time in seconds
 * @param {number} [options.roomSize=0.5] - Room size (0-1, small to large)
 * @param {number} [options.preDelay=0.02] - Pre-delay before reverb in seconds
 * @param {number} [options.dryWet=0.3] - Dry/wet balance (0-1)
 * @returns {Object} Reverb instance
 * @throws {Error} If parameters are out of valid range
 */
export function createReverb(options = {}) {
  const ctx = getAudioContext();
  const {
    decayTime = DEFAULT_DECAY_TIME,
    roomSize = DEFAULT_ROOM_SIZE,
    preDelay = DEFAULT_PRE_DELAY,
    dryWet = DEFAULT_DRY_WET
  } = options;

  // Validate inputs
  if (decayTime < 0.1 || decayTime > 10) {
    throw new Error(`Decay time out of range: ${decayTime}s. Valid range: 0.1-10s`);
  }

  if (roomSize < 0 || roomSize > 1) {
    throw new Error(`Room size out of range: ${roomSize}. Valid range: 0-1`);
  }

  if (preDelay < 0 || preDelay > 1) {
    throw new Error(`Pre-delay out of range: ${preDelay}s. Valid range: 0-1s`);
  }

  if (dryWet < 0 || dryWet > 1) {
    throw new Error(`Dry/wet balance out of range: ${dryWet}. Valid range: 0-1`);
  }

  // Input stage
  const inputGain = ctx.createGain();
  inputGain.gain.value = 1;

  // Dry signal path
  const dryGain = ctx.createGain();
  dryGain.gain.value = 1 - dryWet;

  // Wet signal path (reverb)
  const wetGain = ctx.createGain();
  wetGain.gain.value = dryWet;

  // Pre-delay
  const preDelayNode = ctx.createDelay(5); // Max 5 second delay
  preDelayNode.delayTime.value = preDelay;

  // Create multi-tap delay for reverb simulation
  // Using multiple delays at different times to simulate room reflections
  const delays = [];
  const delayTimes = [0.037, 0.041, 0.043, 0.047]; // Prime numbers for natural sound
  const delayGains = [];

  delayTimes.forEach((time) => {
    const delay = ctx.createDelay(time + 0.1);
    delay.delayTime.value = time * roomSize; // Scale by room size
    delays.push(delay);

    const gain = ctx.createGain();
    // Feedback to create decay
    gain.gain.value = Math.pow(0.5, time / decayTime);
    delayGains.push(gain);
  });

  // Tone control for reverb (low-pass filter to darken reflections)
  const toneFilter = ctx.createBiquadFilter();
  toneFilter.type = 'lowpass';
  toneFilter.frequency.value = 5000; // Darken the reverb tail
  toneFilter.Q.value = 0.7;

  // Output stage
  const outputGain = ctx.createGain();
  outputGain.gain.value = 1;

  // Internal state
  let currentDecayTime = decayTime;
  let currentRoomSize = roomSize;
  let currentPreDelay = preDelay;
  let currentDryWet = dryWet;

  // Audio graph connections
  inputGain.connect(dryGain);
  inputGain.connect(preDelayNode);

  // Delay chain with feedback
  preDelayNode.connect(delays[0]);
  for (let i = 0; i < delays.length; i++) {
    delays[i].connect(delayGains[i]);
    delayGains[i].connect(toneFilter);

    // Create feedback loop (except for last delay)
    if (i < delays.length - 1) {
      delayGains[i].connect(delays[i + 1]);
    }
  }

  // Final reverb path
  // REMOVED FEEDBACK LOOP: feedbackGain.connect(preDelayNode) caused infinite buildup
  // The delay chain already provides natural decay, no circular routing needed
  toneFilter.connect(wetGain);

  // Mix dry and wet
  dryGain.connect(outputGain);
  wetGain.connect(outputGain);

  // Public interface
  return {
    // Audio nodes for routing
    get input() {
      return inputGain;
    },

    get output() {
      return outputGain;
    },

    // State getters
    getDecayTime() {
      return currentDecayTime;
    },

    getRoomSize() {
      return currentRoomSize;
    },

    getPreDelay() {
      return currentPreDelay;
    },

    getDryWet() {
      return currentDryWet;
    },

    /**
     * Set reverb decay time
     *
     * @param {number} newDecayTime - Decay time in seconds (0.1-10)
     * @returns {Object} this (for chaining)
     * @throws {Error} If decay time is out of valid range
     */
    setDecayTime(newDecayTime) {
      if (newDecayTime < 0.1 || newDecayTime > 10) {
        throw new Error(`Decay time out of range: ${newDecayTime}s. Valid range: 0.1-10s`);
      }

      currentDecayTime = newDecayTime;
      const now = ctx.currentTime;

      // Update feedback gains based on new decay time
      delayGains.forEach((gain, index) => {
        const newGainValue = Math.pow(0.5, delayTimes[index] / newDecayTime);
        gain.gain.linearRampToValueAtTime(newGainValue, now + 0.1);
      });

      return this;
    },

    /**
     * Set room size
     *
     * @param {number} newRoomSize - Room size (0-1, small to large)
     * @returns {Object} this (for chaining)
     * @throws {Error} If room size is out of valid range
     */
    setRoomSize(newRoomSize) {
      if (newRoomSize < 0 || newRoomSize > 1) {
        throw new Error(`Room size out of range: ${newRoomSize}. Valid range: 0-1`);
      }

      currentRoomSize = newRoomSize;
      const now = ctx.currentTime;

      // Update delay times based on room size
      delays.forEach((delay, index) => {
        const newDelayTime = delayTimes[index] * newRoomSize;
        delay.delayTime.linearRampToValueAtTime(newDelayTime, now + 0.05);
      });

      return this;
    },

    /**
     * Set pre-delay
     *
     * @param {number} newPreDelay - Pre-delay in seconds (0-1)
     * @returns {Object} this (for chaining)
     * @throws {Error} If pre-delay is out of valid range
     */
    setPreDelay(newPreDelay) {
      if (newPreDelay < 0 || newPreDelay > 1) {
        throw new Error(`Pre-delay out of range: ${newPreDelay}s. Valid range: 0-1s`);
      }

      currentPreDelay = newPreDelay;
      const now = ctx.currentTime;

      preDelayNode.delayTime.linearRampToValueAtTime(newPreDelay, now + 0.05);

      return this;
    },

    /**
     * Set dry/wet balance
     *
     * @param {number} newDryWet - Balance (0=dry, 1=wet)
     * @returns {Object} this (for chaining)
     * @throws {Error} If balance is out of valid range
     */
    setDryWet(newDryWet) {
      if (newDryWet < 0 || newDryWet > 1) {
        throw new Error(`Dry/wet balance out of range: ${newDryWet}. Valid range: 0-1`);
      }

      currentDryWet = newDryWet;
      const now = ctx.currentTime;

      dryGain.gain.linearRampToValueAtTime(1 - newDryWet, now + 0.05);
      wetGain.gain.linearRampToValueAtTime(newDryWet, now + 0.05);

      return this;
    },

    /**
     * Set reverb tone (brightness of reverb tail)
     *
     * @param {number} frequency - Filter frequency in Hz
     * @returns {Object} this (for chaining)
     */
    setTone(frequency) {
      if (frequency < 100 || frequency > 20000) {
        throw new Error(`Tone frequency out of range: ${frequency} Hz`);
      }

      const now = ctx.currentTime;
      toneFilter.frequency.linearRampToValueAtTime(frequency, now + 0.05);

      return this;
    },

    /**
     * Connect reverb to input
     *
     * @param {AudioNode} source - Source to connect from
     * @returns {Object} this (for chaining)
     */
    connect(source) {
      source.connect(this.input);
      return this;
    },

    /**
     * Disconnect reverb
     *
     * @returns {Object} this (for chaining)
     */
    disconnect() {
      inputGain.disconnect();
      dryGain.disconnect();
      wetGain.disconnect();
      preDelayNode.disconnect();
      delays.forEach((delay) => delay.disconnect());
      delayGains.forEach((gain) => gain.disconnect());
      toneFilter.disconnect();
      outputGain.disconnect();
      return this;
    },

    /**
     * Get current effect state
     *
     * @returns {Object} Effect state
     */
    getState() {
      return {
        decayTime: currentDecayTime,
        roomSize: currentRoomSize,
        preDelay: currentPreDelay,
        dryWet: currentDryWet
      };
    }
  };
}
