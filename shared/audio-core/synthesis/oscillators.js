import { getAudioContext } from '../utils/audio-context.js';

/**
 * Create a basic oscillator with frequency and type control
 * @param {string} type - 'sine', 'square', 'sawtooth', or 'triangle'
 * @param {number} frequency - Starting frequency in Hz
 * @returns {Object} Oscillator instance with control methods
 */
export function createOscillator(type = 'sine', frequency = 440) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.value = 0.3;

  osc.connect(gain);

  return {
    oscillator: osc,
    gainNode: gain,
    getFrequency: () => osc.frequency.value,
    setFrequency: (freq) => {
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
    },
    getType: () => osc.type,
    setType: (newType) => {
      osc.type = newType;
    },
    getGain: () => gain.gain.value,
    setGain: (value) => {
      gain.gain.setValueAtTime(value, ctx.currentTime);
    },
    connect: (destination) => gain.connect(destination),
    disconnect: () => gain.disconnect(),
    start: () => osc.start(),
    stop: () => osc.stop()
  };
}

/**
 * Create a wavetable oscillator for custom waveforms
 * @param {Float32Array} wavetable - Custom waveform data
 * @param {number} frequency - Starting frequency in Hz
 * @returns {Object} Wavetable oscillator instance
 */
export function createWavetableOscillator(wavetable, frequency = 440) {
  const ctx = getAudioContext();
  const gain = ctx.createGain();
  const osc = ctx.createOscillator();

  // Create a PeriodicWave from the wavetable
  const real = new Float32Array(wavetable.length);
  const imag = new Float32Array(wavetable.length);

  for (let i = 0; i < wavetable.length; i++) {
    real[i] = wavetable[i];
    imag[i] = 0;
  }

  const periodicWave = ctx.createPeriodicWave(real, imag);
  osc.setPeriodicWave(periodicWave);
  osc.frequency.value = frequency;
  gain.gain.value = 0.3;

  osc.connect(gain);

  return {
    oscillator: osc,
    gainNode: gain,
    setFrequency: (freq) => {
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
    },
    setGain: (value) => {
      gain.gain.setValueAtTime(value, ctx.currentTime);
    },
    connect: (destination) => gain.connect(destination),
    start: () => osc.start(),
    stop: () => osc.stop()
  };
}

/**
 * Utility function to generate common waveforms
 */
export const waveforms = {
  sine: (size = 2048) => {
    const arr = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      arr[i] = Math.sin((2 * Math.PI * i) / size);
    }
    return arr;
  },

  square: (size = 2048) => {
    const arr = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      arr[i] = i < size / 2 ? 1 : -1;
    }
    return arr;
  },

  sawtooth: (size = 2048) => {
    const arr = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      arr[i] = 2 * (i / size) - 1;
    }
    return arr;
  },

  triangle: (size = 2048) => {
    const arr = new Float32Array(size);
    const half = size / 2;
    for (let i = 0; i < size; i++) {
      if (i < half) {
        arr[i] = (2 * i) / size - 1;
      } else {
        arr[i] = 1 - (2 * (i - half)) / size;
      }
    }
    return arr;
  }
};
