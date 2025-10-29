/**
 * Vitest Setup File
 *
 * Global test setup including Web Audio API mocks
 */

import { vi } from 'vitest';

// Mock Web Audio API
class MockAudioContext {
  constructor() {
    this.currentTime = 0;
    this.destination = {};
    this.state = 'running';
    this.sampleRate = 44100;
  }

  createOscillator() {
    return {
      type: 'sine',
      frequency: {
        value: 440,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn()
      },
      detune: {
        value: 0,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn()
      },
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn()
    };
  }

  createGain() {
    return {
      gain: {
        value: 1,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        setTargetAtTime: vi.fn()
      },
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn()
    };
  }

  createBuffer(channels, length, sampleRate) {
    return {
      numberOfChannels: channels,
      length,
      sampleRate,
      duration: length / sampleRate,
      getChannelData: () => new Float32Array(length)
    };
  }

  createBufferSource() {
    return {
      buffer: null,
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn()
    };
  }

  createDynamicsCompressor() {
    return {
      threshold: { value: -24, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
      knee: { value: 30, setValueAtTime: vi.fn() },
      ratio: { value: 12, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
      attack: { value: 0.003, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
      release: { value: 0.25, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
      reduction: 0,
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn()
    };
  }

  createBiquadFilter() {
    return {
      type: 'lowpass',
      frequency: { value: 350, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
      Q: { value: 1, setValueAtTime: vi.fn() },
      gain: { value: 0, setValueAtTime: vi.fn() },
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn()
    };
  }

  createDelay(maxDelayTime = 1.0) {
    return {
      delayTime: { value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn()
    };
  }

  createConvolver() {
    return {
      buffer: null,
      normalize: true,
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn()
    };
  }

  async resume() {
    this.state = 'running';
    return Promise.resolve();
  }

  async suspend() {
    this.state = 'suspended';
    return Promise.resolve();
  }

  async close() {
    this.state = 'closed';
    return Promise.resolve();
  }
}

// Set up global window object with Web Audio API
// In jsdom environment, window is already defined
globalThis.AudioContext = MockAudioContext;
globalThis.webkitAudioContext = MockAudioContext;

if (typeof window !== 'undefined') {
  window.AudioContext = MockAudioContext;
  window.webkitAudioContext = MockAudioContext;
}

if (typeof global !== 'undefined') {
  global.AudioContext = MockAudioContext;
  global.webkitAudioContext = MockAudioContext;
}
