// Singleton AudioContext manager
let audioContext = null;
let isUnlocked = false;

export function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

export async function unlockAudioContext() {
  if (isUnlocked) return;

  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  // iOS unlock hack
  const buffer = ctx.createBuffer(1, 1, 22050);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(0);

  isUnlocked = true;
}

export function suspendAudioContext() {
  if (audioContext && audioContext.state === 'running') {
    audioContext.suspend();
  }
}
