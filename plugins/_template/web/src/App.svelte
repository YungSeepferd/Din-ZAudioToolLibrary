<script>
  import { onMount } from 'svelte';
  import Knob from '@ui/controls/Knob.svelte';
  import Button from '@ui/controls/Button.svelte';
  import { getAudioContext, unlockAudioContext } from '@audio/utils/audio-context.js';
  import { createOscillator } from '@audio/synthesis/oscillators.js';

  let isRunning = $state(false);
  let frequency = $state(440);
  let oscillator = null;

  onMount(async () => {
    await unlockAudioContext();
  });

  function startAudio() {
    const ctx = getAudioContext();
    oscillator = createOscillator('sine', frequency);
    oscillator.connect(ctx.destination);
    oscillator.start();
    isRunning = true;
  }

  function stopAudio() {
    if (oscillator) {
      oscillator.stop();
      isRunning = false;
    }
  }

  function handleFrequencyChange() {
    if (oscillator && isRunning) {
      oscillator.setFrequency(frequency);
    }
  }

  $effect(() => {
    if (isRunning) {
      handleFrequencyChange();
    }
  });
</script>

<div class="container">
  <h1>Audio Plugin Template</h1>
  <p>Welcome to your new audio plugin! Start building by modifying this component.</p>

  <div class="controls">
    <Knob bind:value={frequency} min={20} max={2000} step={1} label="Frequency" />
    <Button
      label={isRunning ? 'Stop' : 'Play'}
      variant={isRunning ? 'danger' : 'primary'}
      onclick={isRunning ? stopAudio : startAudio}
    />
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background: linear-gradient(135deg, #1f2937, #111827);
    color: #f3f4f6;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
      Cantarell, sans-serif;
  }

  .container {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    padding: 2rem;
  }

  h1 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
    text-align: center;
  }

  p {
    font-size: 1rem;
    color: #d1d5db;
    margin: 0;
    text-align: center;
    max-width: 600px;
  }

  .controls {
    display: flex;
    gap: 2rem;
    justify-content: center;
    align-items: flex-end;
  }
</style>
