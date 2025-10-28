/**
 * Audio Context Manager
 *
 * Provides a singleton AudioContext instance with browser compatibility
 * handling and unlock functionality for iOS/Safari.
 *
 * @module audio/context
 */

let audioContext = null;

/**
 * Get the global AudioContext instance
 * @returns {AudioContext} The audio context
 */
export function getAudioContext() {
  if (!audioContext) {
    const AudioContextClass =
      (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) ||
      globalThis.AudioContext ||
      globalThis.webkitAudioContext;

    if (!AudioContextClass) {
      throw new Error('AudioContext is not available in this environment');
    }

    audioContext = new AudioContextClass();
  }
  return audioContext;
}

/**
 * Unlock AudioContext on iOS (required for user interaction)
 * @returns {Promise<void>}
 */
export async function unlockAudioContext() {
  const ctx = getAudioContext();

  if (ctx.state === 'suspended') {
    const buffer = ctx.createBuffer(1, 1, 8000);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);

    try {
      await ctx.resume();
      console.log('✓ AudioContext unlocked');
    } catch (error) {
      console.error('Failed to unlock AudioContext:', error);
    }
  }
}

/**
 * Suspend AudioContext
 */
export function suspendAudioContext() {
  if (audioContext && audioContext.state === 'running') {
    audioContext.suspend();
  }
}
