<!--
  Main Layout Component

  Renders the complete LoFi Piano UI including:
  - Piano keyboard
  - Control panel with knobs
  - Spectrum visualizer
-->

<script>
  import { onMount } from 'svelte';
  import { unlockAudioContext, getAudioContext } from '$audio/context.js';

  let isReady = false;

  onMount(async () => {
    // Unlock AudioContext for iOS
    await unlockAudioContext();
    isReady = true;
    console.log('✓ Audio context ready');
  });
</script>

<main>
  <div class="container">
    <div class="header">
      <h1>🎹 LoFi Piano</h1>
      <p>Nostalgic warm piano for hip-hop beats</p>
    </div>

    {#if isReady}
      <div class="content">
        <p>Audio system initialized</p>
        <!-- Piano keyboard will go here -->
        <!-- Control panel will go here -->
        <!-- Visualizer will go here -->
      </div>
    {:else}
      <div class="loading">
        <p>Initializing audio...</p>
      </div>
    {/if}
  </div>
</main>

<style>
  main {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
  }

  .container {
    max-width: 1000px;
    width: 100%;
    background: rgba(30, 41, 59, 0.8);
    border-radius: 16px;
    padding: 3rem;
    border: 1px solid rgba(100, 116, 139, 0.2);
    backdrop-filter: blur(10px);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }

  .header {
    text-align: center;
    margin-bottom: 3rem;
    border-bottom: 2px solid rgba(100, 116, 139, 0.3);
    padding-bottom: 2rem;
  }

  h1 {
    font-size: 3rem;
    margin: 0;
    color: #f1f5f9;
    font-weight: 700;
  }

  p {
    margin: 0.5rem 0 0;
    color: #cbd5e1;
    font-size: 1.1rem;
  }

  .content {
    text-align: center;
    color: #cbd5e1;
  }

  .loading {
    text-align: center;
    color: #cbd5e1;
    padding: 4rem 2rem;
  }
</style>
