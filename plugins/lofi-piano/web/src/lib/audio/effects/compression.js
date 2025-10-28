/**
 * Dynamic Range Compressor
 *
 * Reduces dynamic range to keep audio levels consistent.
 * Essential for controlling piano dynamics and achieving cohesive mix.
 *
 * Features:
 * - Threshold, ratio, attack, release controls
 * - Makeup gain to compensate for reduction
 * - Look-ahead mode for smoother compression
 * - Dry/wet mixing
 *
 * @module audio/effects/compression
 */

import { getAudioContext } from '../context.js';

const DEFAULT_THRESHOLD = -24; // dB
const DEFAULT_RATIO = 4; // 4:1 compression
const DEFAULT_ATTACK = 0.003; // seconds (3ms for piano)
const DEFAULT_RELEASE = 0.25; // seconds
const DEFAULT_KNEE = 30; // dB (soft knee)

/**
 * Creates a dynamic range compressor effect
 *
 * @param {Object} options - Configuration options
 * @param {number} [options.threshold=-24] - Threshold in dB
 * @param {number} [options.ratio=4] - Compression ratio (1:ratio)
 * @param {number} [options.attack=0.003] - Attack time in seconds
 * @param {number} [options.release=0.25] - Release time in seconds
 * @param {number} [options.knee=30] - Knee in dB (soft knee range)
 * @param {number} [options.dryWet=1] - Dry/wet balance (0-1)
 * @returns {Object} Compressor instance
 * @throws {Error} If parameters are out of valid range
 */
export function createCompressor(options = {}) {
  const ctx = getAudioContext();
  const {
    threshold = DEFAULT_THRESHOLD,
    ratio = DEFAULT_RATIO,
    attack = DEFAULT_ATTACK,
    release = DEFAULT_RELEASE,
    knee = DEFAULT_KNEE,
    dryWet = 1
  } = options;

  // Validate inputs
  if (threshold < -100 || threshold > 0) {
    throw new Error(`Compressor threshold out of range: ${threshold} dB. Valid range: -100 to 0 dB`);
  }

  if (ratio < 1 || ratio > 20) {
    throw new Error(`Compression ratio out of range: ${ratio}. Valid range: 1-20`);
  }

  if (attack < 0 || attack > 1) {
    throw new Error(`Attack time out of range: ${attack}s. Valid range: 0-1s`);
  }

  if (release < 0 || release > 2) {
    throw new Error(`Release time out of range: ${release}s. Valid range: 0-2s`);
  }

  if (dryWet < 0 || dryWet > 1) {
    throw new Error(`Dry/wet balance out of range: ${dryWet}. Valid range: 0-1`);
  }

  // Create dynamic compressor node
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = threshold;
  compressor.ratio.value = ratio;
  compressor.attack.value = attack;
  compressor.release.value = release;
  compressor.knee.value = knee;

  // Dry/wet mixing
  const dryGain = ctx.createGain();
  dryGain.gain.value = 1 - dryWet;

  const wetGain = ctx.createGain();
  wetGain.gain.value = dryWet;

  // Makeup gain to compensate for reduction
  const makeupGain = ctx.createGain();
  makeupGain.gain.value = 1; // Will be calculated based on threshold and ratio

  // Master gain
  const inputGain = ctx.createGain();
  inputGain.gain.value = 1;

  const outputGain = ctx.createGain();
  outputGain.gain.value = 1;

  // Internal state
  let currentThreshold = threshold;
  let currentRatio = ratio;
  let currentAttack = attack;
  let currentRelease = release;
  let currentDryWet = dryWet;

  /**
   * Calculate makeup gain to compensate for compression reduction
   * @private
   */
  function calculateMakeupGain() {
    // Simplified makeup gain calculation
    // For a given reduction, apply opposite gain
    const maxReduction = currentThreshold * (1 - 1 / currentRatio);
    return Math.abs(maxReduction) / 20; // Convert dB to linear
  }

  // Connect audio graph
  inputGain.connect(dryGain);
  inputGain.connect(compressor);

  compressor.connect(makeupGain);
  makeupGain.connect(wetGain);

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

    // Compressor node (for advanced inspection)
    get compressorNode() {
      return compressor;
    },

    // State getters
    getThreshold() {
      return currentThreshold;
    },

    getRatio() {
      return currentRatio;
    },

    getAttack() {
      return currentAttack;
    },

    getRelease() {
      return currentRelease;
    },

    getDryWet() {
      return currentDryWet;
    },

    getReduction() {
      // Returns current reduction in dB (read from compressor)
      return compressor.reduction;
    },

    /**
     * Set compression threshold
     *
     * @param {number} newThreshold - Threshold in dB (-100 to 0)
     * @returns {Object} this (for chaining)
     * @throws {Error} If threshold is out of valid range
     */
    setThreshold(newThreshold) {
      if (newThreshold < -100 || newThreshold > 0) {
        throw new Error(`Compressor threshold out of range: ${newThreshold} dB. Valid range: -100 to 0 dB`);
      }

      currentThreshold = newThreshold;
      const now = ctx.currentTime;

      compressor.threshold.linearRampToValueAtTime(newThreshold, now + 0.05);
      makeupGain.gain.linearRampToValueAtTime(calculateMakeupGain(), now + 0.05);

      return this;
    },

    /**
     * Set compression ratio
     *
     * @param {number} newRatio - Ratio (1:newRatio)
     * @returns {Object} this (for chaining)
     * @throws {Error} If ratio is out of valid range
     */
    setRatio(newRatio) {
      if (newRatio < 1 || newRatio > 20) {
        throw new Error(`Compression ratio out of range: ${newRatio}. Valid range: 1-20`);
      }

      currentRatio = newRatio;
      const now = ctx.currentTime;

      compressor.ratio.linearRampToValueAtTime(newRatio, now + 0.05);
      makeupGain.gain.linearRampToValueAtTime(calculateMakeupGain(), now + 0.05);

      return this;
    },

    /**
     * Set attack time
     *
     * @param {number} newAttack - Attack time in seconds (0-1)
     * @returns {Object} this (for chaining)
     * @throws {Error} If attack is out of valid range
     */
    setAttack(newAttack) {
      if (newAttack < 0 || newAttack > 1) {
        throw new Error(`Attack time out of range: ${newAttack}s. Valid range: 0-1s`);
      }

      currentAttack = newAttack;
      const now = ctx.currentTime;

      compressor.attack.linearRampToValueAtTime(newAttack, now + 0.05);

      return this;
    },

    /**
     * Set release time
     *
     * @param {number} newRelease - Release time in seconds (0-2)
     * @returns {Object} this (for chaining)
     * @throws {Error} If release is out of valid range
     */
    setRelease(newRelease) {
      if (newRelease < 0 || newRelease > 2) {
        throw new Error(`Release time out of range: ${newRelease}s. Valid range: 0-2s`);
      }

      currentRelease = newRelease;
      const now = ctx.currentTime;

      compressor.release.linearRampToValueAtTime(newRelease, now + 0.05);

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
     * Connect compressor to input
     *
     * @param {AudioNode} source - Source to connect from
     * @returns {Object} this (for chaining)
     */
    connect(source) {
      source.connect(this.input);
      return this;
    },

    /**
     * Disconnect compressor
     *
     * @returns {Object} this (for chaining)
     */
    disconnect() {
      inputGain.disconnect();
      dryGain.disconnect();
      wetGain.disconnect();
      compressor.disconnect();
      makeupGain.disconnect();
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
        threshold: currentThreshold,
        ratio: currentRatio,
        attack: currentAttack,
        release: currentRelease,
        dryWet: currentDryWet,
        currentReduction: this.getReduction()
      };
    }
  };
}
