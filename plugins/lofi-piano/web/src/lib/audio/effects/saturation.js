/**
 * Saturation Effect (Tape Warmth)
 *
 * Adds gentle harmonic saturation for a warm, vintage tape-like tone.
 * Uses soft clipping to simulate tape saturation without harsh distortion.
 *
 * Features:
 * - Soft clipping saturation
 * - Tone control (adjustable harmonic character)
 * - Input/output gain control
 * - Smooth parameter automation
 *
 * @module audio/effects/saturation
 */

import { getAudioContext } from '../context.js';

const DEFAULT_AMOUNT = 0.3; // 0-1, how much saturation
const DEFAULT_TONE = 0.5; // 0-1, brightness of saturation
const MIN_FREQUENCY = 100; // Hz
const MAX_FREQUENCY = 10000; // Hz

/**
 * Creates a soft-clipping saturation effect for warm tone
 *
 * @param {Object} options - Configuration options
 * @param {number} [options.amount=0.3] - Saturation amount (0-1)
 * @param {number} [options.tone=0.5] - Tone color (0-1, dark to bright)
 * @param {number} [options.dryWet=1] - Dry/wet balance (0=dry, 1=wet)
 * @returns {Object} Saturation effect instance
 * @throws {Error} If parameters are out of valid range
 */
export function createSaturation(options = {}) {
  const ctx = getAudioContext();
  const {
    amount = DEFAULT_AMOUNT,
    tone = DEFAULT_TONE,
    dryWet = 1
  } = options;

  // Validate inputs
  if (amount < 0 || amount > 1) {
    throw new Error(`Saturation amount out of range: ${amount}. Valid range: 0-1`);
  }

  if (tone < 0 || tone > 1) {
    throw new Error(`Saturation tone out of range: ${tone}. Valid range: 0-1`);
  }

  if (dryWet < 0 || dryWet > 1) {
    throw new Error(`Dry/wet balance out of range: ${dryWet}. Valid range: 0-1`);
  }

  // Input gain control
  const inputGain = ctx.createGain();
  inputGain.gain.value = 1 + amount * 2; // Increase gain based on saturation amount

  // Dry signal path
  const dryGain = ctx.createGain();
  dryGain.gain.value = 1 - dryWet;

  // Wet signal path with saturation
  const wetGain = ctx.createGain();
  wetGain.gain.value = dryWet;

  // Tone shaping (high-pass filter to control brightness)
  const toneFilter = ctx.createBiquadFilter();
  toneFilter.type = 'highshelf';
  toneFilter.frequency.value = MIN_FREQUENCY + tone * (MAX_FREQUENCY - MIN_FREQUENCY);
  toneFilter.gain.value = -10 + tone * 20; // -10dB to +10dB

  // Output gain
  const outputGain = ctx.createGain();
  outputGain.gain.value = 1 / (1 + amount * 2); // Compensate for input gain

  // Internal state
  let currentAmount = amount;
  let currentTone = tone;
  let currentDryWet = dryWet;

  /**
   * Soft clipping saturation curve
   * Uses tanh-like curve for smooth saturation
   *
   * @private
   * @param {Float32Array} buffer - Audio buffer to process
   * @param {number} intensity - Saturation intensity (0-1)
   */
  function applySoftClipping(buffer, intensity) {
    const factor = 1 + intensity * 50; // Scale factor for saturation curve

    for (let i = 0; i < buffer.length; i++) {
      const sample = buffer[i];
      // Soft clipping curve: tanh-like behavior
      buffer[i] = (sample * factor) / (1 + Math.abs(sample * factor));
    }
  }

  // Create a local offline context for saturation processing (if needed)
  // For now, saturation is applied in real-time via ScriptProcessorNode
  const processor = ctx.createScriptProcessor(4096, 1, 1);

  processor.onaudioprocess = (event) => {
    const input = event.inputBuffer.getChannelData(0);
    const output = event.outputBuffer.getChannelData(0);

    // Apply soft clipping saturation
    applySoftClipping(input, currentAmount);

    // Copy processed audio to output
    for (let i = 0; i < input.length; i++) {
      output[i] = input[i];
    }
  };

  // Connect audio graph
  // Input → Input Gain → (Dry Path & Tone-shaped Path) → Output Gain → Output
  inputGain.connect(dryGain);
  inputGain.connect(processor);
  inputGain.connect(toneFilter);

  dryGain.connect(outputGain);
  processor.connect(toneFilter);
  toneFilter.connect(wetGain);
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
    getAmount() {
      return currentAmount;
    },

    getTone() {
      return currentTone;
    },

    getDryWet() {
      return currentDryWet;
    },

    /**
     * Set saturation amount
     *
     * @param {number} newAmount - Saturation amount (0-1)
     * @returns {Object} this (for chaining)
     * @throws {Error} If amount is out of valid range
     */
    setAmount(newAmount) {
      if (newAmount < 0 || newAmount > 1) {
        throw new Error(`Saturation amount out of range: ${newAmount}. Valid range: 0-1`);
      }

      currentAmount = newAmount;
      const now = ctx.currentTime;

      // Smooth gain changes
      const newGainValue = 1 + newAmount * 2;
      inputGain.gain.linearRampToValueAtTime(newGainValue, now + 0.05);
      outputGain.gain.linearRampToValueAtTime(1 / newGainValue, now + 0.05);

      return this;
    },

    /**
     * Set tone (brightness of saturation)
     *
     * @param {number} newTone - Tone control (0=dark, 1=bright)
     * @returns {Object} this (for chaining)
     * @throws {Error} If tone is out of valid range
     */
    setTone(newTone) {
      if (newTone < 0 || newTone > 1) {
        throw new Error(`Saturation tone out of range: ${newTone}. Valid range: 0-1`);
      }

      currentTone = newTone;
      const now = ctx.currentTime;

      // Smooth tone filter changes
      const newFrequency = MIN_FREQUENCY + newTone * (MAX_FREQUENCY - MIN_FREQUENCY);
      const newGain = -10 + newTone * 20;

      toneFilter.frequency.linearRampToValueAtTime(newFrequency, now + 0.05);
      toneFilter.gain.linearRampToValueAtTime(newGain, now + 0.05);

      return this;
    },

    /**
     * Set dry/wet balance
     *
     * @param {number} newDryWet - Balance (0=dry only, 1=wet only)
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
     * Connect saturation to input source
     *
     * @param {AudioNode} source - Source to connect from
     * @returns {Object} this (for chaining)
     */
    connect(source) {
      source.connect(this.input);
      return this;
    },

    /**
     * Disconnect saturation effect
     *
     * @returns {Object} this (for chaining)
     */
    disconnect() {
      inputGain.disconnect();
      dryGain.disconnect();
      wetGain.disconnect();
      processor.disconnect();
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
        amount: currentAmount,
        tone: currentTone,
        dryWet: currentDryWet
      };
    }
  };
}
