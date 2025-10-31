/**
 * Audio Context Manager
 *
 * Manages the singleton AudioContext with proper browser unlock handling.
 * IMPORTANT: unlockAudioContext() MUST be called in response to user interaction
 * (click, touch, etc.) due to browser autoplay policies.
 *
 * @module audio-context
 */

let audioContext = null;
let isUnlocked = false;
let unlockPromise = null;

/**
 * Gets or creates the singleton AudioContext
 * @returns {AudioContext} The audio context instance
 */
export function getAudioContext() {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('✓ AudioContext created', {
        state: audioContext.state,
        sampleRate: audioContext.sampleRate
      });
    } catch (err) {
      console.error('✗ Failed to create AudioContext:', err);
      throw new Error('Web Audio API not supported in this browser');
    }
  }
  return audioContext;
}

/**
 * Unlocks the AudioContext for playback (required on mobile/iOS)
 * MUST be called within a user interaction event handler (click, touch, etc.)
 *
 * @async
 * @returns {Promise<void>}
 * @throws {Error} If called outside of user interaction context
 */
export async function unlockAudioContext() {
  // Return existing promise if already unlocking
  if (unlockPromise) {
    return unlockPromise;
  }

  if (isUnlocked) {
    return Promise.resolve();
  }

  unlockPromise = (async () => {
    try {
      const ctx = getAudioContext();

      // Resume suspended context (required on iOS/Safari)
      if (ctx.state === 'suspended') {
        console.log('AudioContext suspended, attempting resume...');
        await ctx.resume();
        console.log('✓ AudioContext resumed successfully');
      }

      // iOS unlock: play silent buffer to fully unlock audio
      // Some iOS versions need this even after resume()
      try {
        const buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        console.log('✓ iOS unlock buffer played');
      } catch (err) {
        console.warn('Warning: Could not play iOS unlock buffer:', err.message);
        // This is non-critical, continue even if it fails
      }

      isUnlocked = true;
      console.log('✓ AudioContext unlocked and ready');
    } catch (err) {
      console.error('✗ Failed to unlock AudioContext:', err);
      throw new Error(`Audio unlock failed: ${err.message}`);
    } finally {
      unlockPromise = null;
    }
  })();

  return unlockPromise;
}

/**
 * Suspends the AudioContext (pauses audio processing)
 */
export function suspendAudioContext() {
  if (audioContext && audioContext.state === 'running') {
    audioContext.suspend();
    console.log('AudioContext suspended');
  }
}

/**
 * Resumes the AudioContext (resumes audio processing)
 */
export function resumeAudioContext() {
  if (audioContext && audioContext.state === 'suspended') {
    return audioContext.resume();
  }
  return Promise.resolve();
}
