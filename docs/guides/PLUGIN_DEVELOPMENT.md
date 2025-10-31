# Plugin Development Guide

## Creating Your First Plugin

### Step 1: Generate a New Plugin

```bash
pnpm create-plugin
```

Follow the prompts:
- **Name** (kebab-case): `my-awesome-synth`
- **Description**: `A simple synthesizer plugin`
- **Type**: `synth` / `effect` / `utility`

This creates:
```
plugins/my-awesome-synth/
├── web/
│   ├── src/
│   │   ├── App.svelte
│   │   ├── main.js
│   │   └── style.css
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── native/ (empty for now)
└── README.md
```

### Step 2: Start Developing

```bash
cd plugins/my-awesome-synth/web
pnpm install
pnpm dev
```

Open http://localhost:5173

## Plugin Structure

### `App.svelte` - Main Component

This is your plugin's entry point:

```svelte
<script>
  import { onMount } from 'svelte';
  import { getAudioContext, unlockAudioContext } from '@audio/utils/audio-context.js';

  onMount(async () => {
    // Always unlock audio context first!
    await unlockAudioContext();
  });
</script>

<div class="plugin">
  <h1>My Plugin</h1>
</div>

<style>
  .plugin {
    background: linear-gradient(135deg, #1f2937, #111827);
    color: #f3f4f6;
  }
</style>
```

### Typical Plugin Architecture

```
App.svelte
├── Controls (Knob, Slider, Button)
├── Audio Engine
│   ├── Oscillators
│   ├── Effects
│   └── Envelope
└── Visualizers (Waveform, Spectrum)
```

## Building Audio Features

### Simple Synthesizer

```svelte
<script>
  import { onMount } from 'svelte';
  import Knob from '@ui/controls/Knob.svelte';
  import Button from '@ui/controls/Button.svelte';
  import { getAudioContext, unlockAudioContext } from '@audio/utils/audio-context.js';
  import { createOscillator } from '@audio/synthesis/oscillators.js';
  import { createADSREnvelope } from '@audio/synthesis/envelopes.js';

  let frequency = $state(440);
  let waveType = $state('sine');
  let isPlaying = $state(false);
  let oscillator = null;
  let envelope = null;

  onMount(async () => {
    await unlockAudioContext();
  });

  function startSound() {
    const ctx = getAudioContext();

    // Create oscillator
    oscillator = createOscillator(waveType, frequency);

    // Create envelope
    envelope = createADSREnvelope({
      attack: 0.01,
      decay: 0.1,
      sustain: 0.7,
      release: 0.5
    });

    // Connect: OSC → Envelope → Speaker
    oscillator.connect(envelope.gain);
    envelope.connect(ctx.destination);

    // Start
    oscillator.start();
    envelope.trigger(1); // Velocity 1.0 (max)

    isPlaying = true;
  }

  function stopSound() {
    if (oscillator && envelope) {
      envelope.release();
      oscillator.stop();
      isPlaying = false;
    }
  }

  function handleFrequencyChange() {
    if (oscillator && isPlaying) {
      oscillator.setFrequency(frequency);
    }
  }

  $effect(() => {
    handleFrequencyChange();
  });
</script>

<div class="synth">
  <Knob bind:value={frequency} min={20} max={2000} label="Frequency" />

  <select bind:value={waveType}>
    <option value="sine">Sine</option>
    <option value="square">Square</option>
    <option value="sawtooth">Sawtooth</option>
    <option value="triangle">Triangle</option>
  </select>

  <Button
    label={isPlaying ? 'Stop' : 'Play'}
    variant={isPlaying ? 'danger' : 'primary'}
    onclick={isPlaying ? stopSound : startSound}
  />
</div>

<style>
  .synth {
    display: flex;
    gap: 1rem;
    align-items: flex-end;
  }
</style>
```

### Adding Filters

```svelte
<script>
  import { createLowPassFilter } from '@audio/synthesis/filters.js';

  let cutoffFreq = $state(2000);
  let resonance = $state(1);

  function setupFilter() {
    const ctx = getAudioContext();

    // Create filter
    const filter = createLowPassFilter(cutoffFreq, resonance);

    // Connect: OSC → Filter → Envelope → Speaker
    oscillator.connect(filter.filter);
    filter.connect(envelope.gain);
    envelope.connect(ctx.destination);
  }

  function handleFilterChange() {
    if (filter) {
      filter.setFrequency(cutoffFreq);
      filter.setQ(resonance);
    }
  }

  $effect(() => {
    handleFilterChange();
  });
</script>

<Knob bind:value={cutoffFreq} min={20} max={20000} label="Filter Cutoff" />
<Knob bind:value={resonance} min={0.1} max={30} label="Resonance" />
```

### Adding Effects

```svelte
<script>
  import { createDelayEffect } from '@audio/effects/delay.js';

  let delayTime = $state(0.5);
  let delayFeedback = $state(0.3);

  function setupDelay() {
    // Create delay
    const delay = createDelayEffect(delayTime, delayFeedback);

    // Connect: OSC → Envelope → Delay → Speaker
    oscillator.connect(envelope.gain);
    envelope.connect(delay.input);
    delay.connect(ctx.destination);
  }
</script>
```

## Working with Presets

```svelte
<script>
  import { loadPreset, savePreset } from '@shared/presets/preset-manager.js';

  async function saveCurrentPreset() {
    const preset = {
      frequency,
      waveType,
      cutoffFreq,
      resonance,
      delayTime
    };
    await savePreset('my-synth', 'my-preset', preset);
  }

  async function loadMyPreset() {
    const preset = await loadPreset('my-synth', 'my-preset');
    frequency = preset.frequency;
    waveType = preset.waveType;
    // ... etc
  }
</script>

<Button label="Save Preset" onclick={saveCurrentPreset} />
<Button label="Load Preset" onclick={loadMyPreset} />
```

## UI Best Practices

### Use Semantic HTML

```svelte
<div class="synth" role="application" aria-label="My Awesome Synth">
  <fieldset>
    <legend>Oscillator</legend>
    <Knob {...} aria-label="Frequency (Hz)" />
  </fieldset>
</div>
```

### Responsive Layout

```svelte
<style>
  .synth {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 1rem;
  }

  @media (max-width: 600px) {
    .synth {
      grid-template-columns: 1fr;
    }
  }
</style>
```

### Dark Theme Pattern

```svelte
<style>
  .synth {
    background: linear-gradient(135deg, #1f2937, #111827);
    color: #f3f4f6;
  }

  input, select, textarea {
    background: #374151;
    color: #f3f4f6;
    border: 1px solid #4b5563;
  }
</style>
```

## Testing Your Plugin

### Manual Testing Checklist

- [ ] Audio initializes without errors
- [ ] All controls work and update audio
- [ ] Parameters sweep smoothly
- [ ] No audio clicks or pops
- [ ] Preset save/load works
- [ ] Responsive on mobile
- [ ] Accessible with keyboard

### Using Browser DevTools

```javascript
// In browser console
const ctx = getAudioContext();
console.log('Audio context state:', ctx.state);
console.log('Sample rate:', ctx.sampleRate);
console.log('Current time:', ctx.currentTime);
```

## Publishing Your Plugin

### 1. Build for Production

```bash
pnpm build
```

This creates optimized output in `dist/`

### 2. Deploy to Web

```bash
# GitHub Pages
npm run deploy

# Vercel
vercel

# Netlify
netlify deploy
```

### 3. Create Desktop App with Tauri

```bash
# Initialize Tauri
cargo install tauri-cli
pnpm tauri init

# Build desktop app
pnpm tauri:build
```

Creates native apps for macOS, Windows, Linux

## Performance Tips

### 1. Use Audio Worklets for Heavy DSP

```javascript
// Register processor
await audioContext.audioWorklet.addModule('processor.js');

// Use it
const node = new AudioWorkletNode(audioContext, 'my-processor');
```

### 2. Avoid Creating New Objects in Audio Loop

```javascript
// ✅ Good - Create once
let oscillator = createOscillator(...);

$effect(() => {
  oscillator.setFrequency(frequency); // Just update
});

// ❌ Bad - Don't do this in $effect
$effect(() => {
  let osc = createOscillator(frequency); // Creates new every time!
});
```

### 3. Debounce Parameter Updates

```javascript
import { debounce } from '@shared/utils/debounce.js';

const updateFrequency = debounce((freq) => {
  oscillator?.setFrequency(freq);
}, 10);

$effect(() => {
  updateFrequency(frequency);
});
```

## Common Issues & Solutions

### Audio Not Playing
```javascript
// 1. Check context state
const ctx = getAudioContext();
if (ctx.state === 'suspended') {
  await ctx.resume();
}

// 2. Check node is connected
oscillator.connect(ctx.destination);
```

### Parameters Not Updating
```javascript
// Use $effect to react to state changes
$effect(() => {
  if (oscillator) {
    oscillator.setFrequency(frequency);
  }
});
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

## Next Steps

1. **Explore examples**: Check `/resources/examples/`
2. **Study shared code**: Look at `/shared/audio-core/`
3. **Join community**: Check out audio forums and communities
4. **Share your plugin**: Submit to the plugin marketplace (coming soon!)

## Resources

- [Web Audio API Docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Svelte Docs](https://svelte.dev)
- [Tone.js Docs](https://tonejs.github.io)
- [Audio Worklet Guide](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet)
