/**
 * Synthesis Module Exports
 *
 * Provides oscillators, envelopes, and filters for audio synthesis
 *
 * @module @audio-playground/audio-core/synthesis
 */

// Oscillators
export {
  createOscillator,
  createWavetableOscillator,
  waveforms
} from './oscillators.js';

// Envelopes
export {
  createADSREnvelope,
  createAREnvelope,
  createExponentialEnvelope,
  generateEnvelopeCurve
} from './envelopes.js';

// Filters
export {
  createLowPassFilter,
  createHighPassFilter,
  createBandPassFilter,
  createPeakingEQFilter,
  createShelfFilter,
  createMultiPoleFilter,
  filterUtils
} from './filters.js';
