import { getAudioContext } from '../utils/audio-context.js';

/**
 * Create a delay effect
 * @param {number} time - Delay time in seconds (max 5 seconds)
 * @param {number} feedback - Feedback amount (0-0.8)
 * @returns {Object} Delay instance with control methods
 */
export function createDelayEffect(time = 0.5, feedback = 0.3) {
  const ctx = getAudioContext();

  const input = ctx.createGain();
  const delayNode = ctx.createDelay(5);
  const feedbackGain = ctx.createGain();
  const output = ctx.createGain();

  // Set initial values
  delayNode.delayTime.value = time;
  feedbackGain.gain.value = feedback;
  output.gain.value = 1;

  // Connect: Input → Delay → FeedbackGain → Delay (feedback loop)
  input.connect(delayNode);
  delayNode.connect(output);
  delayNode.connect(feedbackGain);
  feedbackGain.connect(delayNode);

  return {
    delayNode,
    feedbackGain,
    output,
    input,

    setTime: (delayTime) => {
      delayNode.delayTime.setValueAtTime(delayTime, ctx.currentTime);
    },

    setFeedback: (fb) => {
      feedbackGain.gain.setValueAtTime(Math.max(0, Math.min(0.8, fb)), ctx.currentTime);
    },

    setWetDry: (wet) => {
      output.gain.setValueAtTime(wet, ctx.currentTime);
    },

    connect: (destination) => output.connect(destination),
    disconnect: () => output.disconnect(),

    getInput: () => input
  };
}

/**
 * Create a ping-pong delay (alternates between left and right channels)
 */
export function createPingPongDelay(time = 0.5, feedback = 0.3) {
  const ctx = getAudioContext();

  const input = ctx.createGain();
  const delayLeft = ctx.createDelay(5);
  const delayRight = ctx.createDelay(5);
  const feedbackGain = ctx.createGain();
  const splitter = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
  const output = ctx.createGain();

  // Set initial values
  delayLeft.delayTime.value = time;
  delayRight.delayTime.value = time;
  feedbackGain.gain.value = feedback;

  // Connect ping-pong pattern
  input.connect(delayLeft);
  input.connect(delayRight);

  delayLeft.connect(output);
  delayRight.connect(output);

  delayLeft.connect(feedbackGain);
  feedbackGain.connect(delayRight);

  delayRight.connect(feedbackGain);
  feedbackGain.connect(delayLeft);

  return {
    setTime: (delayTime) => {
      delayLeft.delayTime.setValueAtTime(delayTime, ctx.currentTime);
      delayRight.delayTime.setValueAtTime(delayTime, ctx.currentTime);
    },

    setFeedback: (fb) => {
      feedbackGain.gain.setValueAtTime(Math.max(0, Math.min(0.8, fb)), ctx.currentTime);
    },

    connect: (destination) => output.connect(destination),
    disconnect: () => output.disconnect(),

    getInput: () => input
  };
}
