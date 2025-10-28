import { getAudioContext } from '../utils/audio-context.js';

/**
 * ADSR Envelope Generator
 * @param {Object} params - { attack, decay, sustain, release }
 * @returns {Object} Envelope instance with control methods
 */
export function createADSREnvelope(params = {}) {
  const {
    attack = 0.01,
    decay = 0.1,
    sustain = 0.7,
    release = 0.5
  } = params;

  const ctx = getAudioContext();
  const gain = ctx.createGain();
  gain.gain.value = 0;

  return {
    gain,
    attack,
    decay,
    sustain,
    release,

    trigger: (velocity = 1) => {
      const now = ctx.currentTime;
      const peakGain = velocity;

      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + attack);
      gain.gain.linearRampToValueAtTime(sustain * peakGain, now + attack + decay);
    },

    release: () => {
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + this.release);
    },

    setAttack: (time) => {
      this.attack = Math.max(0.001, time);
    },
    setDecay: (time) => {
      this.decay = Math.max(0.001, time);
    },
    setSustain: (level) => {
      this.sustain = Math.max(0, Math.min(1, level));
    },
    setRelease: (time) => {
      this.release = Math.max(0.001, time);
    },

    connect: (destination) => gain.connect(destination),
    disconnect: () => gain.disconnect(),
    getGain: () => gain
  };
}

/**
 * Simple AR (Attack-Release) Envelope for percussion sounds
 */
export function createAREnvelope(attack = 0.01, release = 0.2) {
  const ctx = getAudioContext();
  const gain = ctx.createGain();
  gain.gain.value = 0;

  return {
    gain,

    trigger: (velocity = 1) => {
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(velocity, now + attack);
    },

    release: (releaseTime = release) => {
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + releaseTime);
    },

    connect: (destination) => gain.connect(destination),
    disconnect: () => gain.disconnect(),
    getGain: () => gain
  };
}

/**
 * Exponential decay envelope
 */
export function createExponentialEnvelope(startLevel = 1, decayTime = 1) {
  const ctx = getAudioContext();
  const gain = ctx.createGain();
  gain.gain.value = startLevel;

  return {
    gain,

    decay: (targetLevel = 0, time = decayTime) => {
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.exponentialRampToValueAtTime(
        Math.max(0.001, targetLevel),
        now + time
      );
    },

    reset: () => {
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(startLevel, now);
    },

    connect: (destination) => gain.connect(destination),
    disconnect: () => gain.disconnect(),
    getGain: () => gain
  };
}

/**
 * Generate an envelope curve and return as audio buffer
 */
export function generateEnvelopeCurve(type = 'linear', duration = 1, sampleRate = 44100) {
  const ctx = getAudioContext();
  const samples = Math.round(duration * sampleRate);
  const buffer = ctx.createBuffer(1, samples, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < samples; i++) {
    const t = i / samples;

    switch (type) {
      case 'linear':
        data[i] = 1 - t;
        break;
      case 'exponential':
        data[i] = Math.exp(-t * 5);
        break;
      case 'logarithmic':
        data[i] = Math.log(1 + t) / Math.log(2);
        break;
      case 'sine':
        data[i] = Math.sin((t * Math.PI) / 2);
        break;
      default:
        data[i] = 1 - t;
    }
  }

  return buffer;
}
