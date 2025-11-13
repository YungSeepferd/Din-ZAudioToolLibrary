import { getAudioContext } from '../utils/audio-context.js';

/**
 * Create a low-pass filter
 * @param {number} frequency - Cutoff frequency in Hz
 * @param {number} q - Q factor (resonance)
 * @returns {Object} Filter instance with control methods
 */
export function createLowPassFilter(frequency = 1000, q = 1) {
  const ctx = getAudioContext();
  const filter = ctx.createBiquadFilter();

  filter.type = 'lowpass';
  filter.frequency.value = frequency;
  filter.Q.value = q;

  return {
    filter,
    setFrequency: (freq) => {
      const now = ctx.currentTime;
      filter.frequency.setValueAtTime(filter.frequency.value, now);
      filter.frequency.linearRampToValueAtTime(freq, now + 0.05); // 50ms smoothing
    },
    setQ: (qValue) => {
      const now = ctx.currentTime;
      filter.Q.setValueAtTime(filter.Q.value, now);
      filter.Q.linearRampToValueAtTime(qValue, now + 0.05); // 50ms smoothing
    },
    getFrequency: () => filter.frequency.value,
    getQ: () => filter.Q.value,
    connect: (destination) => filter.connect(destination),
    disconnect: () => filter.disconnect(),
    getFilter: () => filter
  };
}

/**
 * Create a high-pass filter
 */
export function createHighPassFilter(frequency = 100, q = 1) {
  const ctx = getAudioContext();
  const filter = ctx.createBiquadFilter();

  filter.type = 'highpass';
  filter.frequency.value = frequency;
  filter.Q.value = q;

  return {
    filter,
    setFrequency: (freq) => {
      const now = ctx.currentTime;
      filter.frequency.setValueAtTime(filter.frequency.value, now);
      filter.frequency.linearRampToValueAtTime(freq, now + 0.05); // 50ms smoothing
    },
    setQ: (qValue) => {
      const now = ctx.currentTime;
      filter.Q.setValueAtTime(filter.Q.value, now);
      filter.Q.linearRampToValueAtTime(qValue, now + 0.05); // 50ms smoothing
    },
    getFrequency: () => filter.frequency.value,
    getQ: () => filter.Q.value,
    connect: (destination) => filter.connect(destination),
    disconnect: () => filter.disconnect(),
    getFilter: () => filter
  };
}

/**
 * Create a band-pass filter
 */
export function createBandPassFilter(frequency = 1000, q = 10) {
  const ctx = getAudioContext();
  const filter = ctx.createBiquadFilter();

  filter.type = 'bandpass';
  filter.frequency.value = frequency;
  filter.Q.value = q;

  return {
    filter,
    setFrequency: (freq) => {
      const now = ctx.currentTime;
      filter.frequency.setValueAtTime(filter.frequency.value, now);
      filter.frequency.linearRampToValueAtTime(freq, now + 0.05); // 50ms smoothing
    },
    setQ: (qValue) => {
      const now = ctx.currentTime;
      filter.Q.setValueAtTime(filter.Q.value, now);
      filter.Q.linearRampToValueAtTime(qValue, now + 0.05); // 50ms smoothing
    },
    getFrequency: () => filter.frequency.value,
    getQ: () => filter.Q.value,
    connect: (destination) => filter.connect(destination),
    disconnect: () => filter.disconnect(),
    getFilter: () => filter
  };
}

/**
 * Create a peaking EQ filter
 */
export function createPeakingEQFilter(frequency = 1000, q = 1, gain = 0) {
  const ctx = getAudioContext();
  const filter = ctx.createBiquadFilter();

  filter.type = 'peaking';
  filter.frequency.value = frequency;
  filter.Q.value = q;
  filter.gain.value = gain;

  return {
    filter,
    setFrequency: (freq) => {
      const now = ctx.currentTime;
      filter.frequency.setValueAtTime(filter.frequency.value, now);
      filter.frequency.linearRampToValueAtTime(freq, now + 0.05); // 50ms smoothing
    },
    setQ: (qValue) => {
      const now = ctx.currentTime;
      filter.Q.setValueAtTime(filter.Q.value, now);
      filter.Q.linearRampToValueAtTime(qValue, now + 0.05); // 50ms smoothing
    },
    setGain: (gainValue) => {
      const now = ctx.currentTime;
      filter.gain.setValueAtTime(filter.gain.value, now);
      filter.gain.linearRampToValueAtTime(gainValue, now + 0.05); // 50ms smoothing
    },
    connect: (destination) => filter.connect(destination),
    disconnect: () => filter.disconnect(),
    getFilter: () => filter
  };
}

/**
 * Create a shelf filter (low-shelf or high-shelf)
 */
export function createShelfFilter(type = 'lowshelf', frequency = 200, gain = 0) {
  const ctx = getAudioContext();
  const filter = ctx.createBiquadFilter();

  filter.type = type; // 'lowshelf' or 'highshelf'
  filter.frequency.value = frequency;
  filter.gain.value = gain;

  return {
    filter,
    setFrequency: (freq) => {
      const now = ctx.currentTime;
      filter.frequency.setValueAtTime(filter.frequency.value, now);
      filter.frequency.linearRampToValueAtTime(freq, now + 0.05); // 50ms smoothing
    },
    setGain: (gainValue) => {
      const now = ctx.currentTime;
      filter.gain.setValueAtTime(filter.gain.value, now);
      filter.gain.linearRampToValueAtTime(gainValue, now + 0.05); // 50ms smoothing
    },
    connect: (destination) => filter.connect(destination),
    disconnect: () => filter.disconnect(),
    getFilter: () => filter
  };
}

/**
 * Create a multi-pole filter using cascaded biquad filters
 */
export function createMultiPoleFilter(poles = 2, frequency = 1000, q = 1) {
  const ctx = getAudioContext();
  const filters = [];

  for (let i = 0; i < poles; i++) {
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = frequency;
    filter.Q.value = q;

    if (i > 0) {
      filters[i - 1].connect(filter);
    }

    filters.push(filter);
  }

  return {
    filters,
    setFrequency: (freq) => {
      const now = ctx.currentTime;
      filters.forEach((f) => {
        f.frequency.setValueAtTime(f.frequency.value, now);
        f.frequency.linearRampToValueAtTime(freq, now + 0.05); // 50ms smoothing
      });
    },
    setQ: (qValue) => {
      const now = ctx.currentTime;
      filters.forEach((f) => {
        f.Q.setValueAtTime(f.Q.value, now);
        f.Q.linearRampToValueAtTime(qValue, now + 0.05); // 50ms smoothing
      });
    },
    connect: (destination) => {
      filters[filters.length - 1].connect(destination);
    },
    disconnect: () => {
      filters[filters.length - 1].disconnect();
    },
    getInput: () => filters[0]
  };
}

/**
 * Frequency to note name conversion utilities
 */
export const filterUtils = {
  freqToNote: (freq) => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteNum = Math.round(12 * Math.log2(freq / 440)) + 69;
    const octave = Math.floor(noteNum / 12) - 1;
    const noteName = notes[noteNum % 12];
    return `${noteName}${octave}`;
  },

  noteToFreq: (note) => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteParts = note.match(/([A-G]#?)(-?\d+)/);
    if (!noteParts) return 440;

    const noteIndex = notes.indexOf(noteParts[1]);
    const octave = parseInt(noteParts[2]);
    const noteNum = (octave + 1) * 12 + noteIndex;

    return 440 * Math.pow(2, (noteNum - 69) / 12);
  }
};
