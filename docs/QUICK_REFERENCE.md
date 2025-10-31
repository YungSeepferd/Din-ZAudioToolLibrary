# Audio Plugin Playground - Quick Reference

Fast lookup for common tasks and commands.

## Essential Commands

### Setup & Installation
```bash
# Install all dependencies
pnpm install

# Create a new plugin
pnpm create-plugin
```

### Development
```bash
# Start all plugins in dev mode
pnpm dev

# Start one specific plugin
cd plugins/my-synth/web
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Git
```bash
# Create a new feature branch
git checkout -b feature/my-feature

# Commit changes
git add .
git commit -m "feat: Add new feature"

# Push and create PR
git push -u origin feature/my-feature
```

## Directory Structure Quick Map

```
plugins/           ← Your plugins go here
  _template/       ← Use as boilerplate
  my-synth/        ← Your plugin

shared/            ← Shared across all plugins
  audio-core/      ← Audio DSP utilities
  ui-components/   ← Svelte components
  presets/         ← Preset management (soon)

resources/         ← Audio files, examples
  samples/         ← Audio samples
  impulse-responses/ ← Reverb IRs
  examples/        ← Code examples

docs/              ← Documentation
  GETTING_STARTED.md
  ARCHITECTURE.md
  PLUGIN_DEVELOPMENT.md
  LEARNING_PATH.md
```

## Import Aliases

Use these shortcuts in your plugin code:

```javascript
// Audio utilities
import { getAudioContext } from '@audio/utils/audio-context.js';
import { createOscillator } from '@audio/synthesis/oscillators.js';
import { createADSREnvelope } from '@audio/synthesis/envelopes.js';
import { createLowPassFilter } from '@audio/synthesis/filters.js';
import { createDelayEffect } from '@audio/effects/delay.js';

// UI Components (Svelte)
import Knob from '@ui/controls/Knob.svelte';
import Slider from '@ui/controls/Slider.svelte';
import Button from '@ui/controls/Button.svelte';

// Shared utilities
import something from '@shared/module/file.js';
```

## Common Audio Patterns

### Initialize Audio
```javascript
import { onMount } from 'svelte';
import { unlockAudioContext, getAudioContext } from '@audio/utils/audio-context.js';

onMount(async () => {
  await unlockAudioContext();
  const ctx = getAudioContext();
  // Ready to make sound!
});
```

### Create a Sound
```javascript
import { createOscillator } from '@audio/synthesis/oscillators.js';
import { createADSREnvelope } from '@audio/synthesis/envelopes.js';
import { getAudioContext } from '@audio/utils/audio-context.js';

function playNote(frequency) {
  const ctx = getAudioContext();

  const osc = createOscillator('sine', frequency);
  const env = createADSREnvelope();

  osc.connect(env.gain);
  env.connect(ctx.destination);

  osc.start();
  env.trigger();
}

function stopNote() {
  env.release();
  osc.stop();
}
```

### Reactive Parameter Updates
```svelte
<script>
  let frequency = $state(440);
  let oscillator = null;

  // Update when frequency changes
  $effect(() => {
    if (oscillator) {
      oscillator.setFrequency(frequency);
    }
  });
</script>

<Knob bind:value={frequency} min={20} max={2000} label="Frequency" />
```

### Filter Audio
```javascript
import { createLowPassFilter } from '@audio/synthesis/filters.js';

const filter = createLowPassFilter(2000, 10); // 2kHz cutoff, Q=10

// Connect: Source → Filter → Destination
osc.connect(filter.filter);
filter.connect(ctx.destination);

// Update filter
filter.setFrequency(1000);
filter.setQ(20);
```

## File Organization

### Plugin Structure
```
plugins/my-synth/web/
├── src/
│   ├── App.svelte          # Main component
│   ├── components/         # Reusable components (optional)
│   │   ├── Oscillator.svelte
│   │   └── FilterSection.svelte
│   ├── stores.js           # State management (optional)
│   ├── main.js             # Entry point
│   └── style.css           # Global styles
├── vite.config.js          # Vite configuration
├── package.json            # Dependencies
└── index.html              # HTML template
```

### Best Practices
- Keep components small and focused
- Extract shared logic into separate files
- Use proper naming conventions (PascalCase for components)
- Document complex algorithms
- Organize by feature, not type

## Documentation Map

| Document | Purpose | Length |
|----------|---------|--------|
| `GETTING_STARTED.md` | Setup and first plugin | Quick read |
| `ARCHITECTURE.md` | How everything fits together | Deep dive |
| `PLUGIN_DEVELOPMENT.md` | Build plugins step-by-step | Tutorial |
| `LEARNING_PATH.md` | 6-phase learning curriculum | Long-term |
| `SETUP_SUMMARY.md` | What was set up (this project) | Overview |
| `QUICK_REFERENCE.md` | This document | Cheat sheet |

## Audio Core API Reference

### Audio Context
```javascript
getAudioContext()          // Get singleton context
unlockAudioContext()       // Unlock browser audio
suspendAudioContext()      // Pause audio
```

### Oscillators
```javascript
createOscillator(type, frequency)
createWavetableOscillator(wavetable, frequency)
waveforms.sine(size)
waveforms.square(size)
waveforms.sawtooth(size)
waveforms.triangle(size)
```

### Envelopes
```javascript
createADSREnvelope({ attack, decay, sustain, release })
createAREnvelope(attack, release)
createExponentialEnvelope(startLevel, decayTime)
generateEnvelopeCurve(type, duration, sampleRate)
```

### Filters
```javascript
createLowPassFilter(frequency, q)
createHighPassFilter(frequency, q)
createBandPassFilter(frequency, q)
createPeakingEQFilter(frequency, q, gain)
createShelfFilter(type, frequency, gain)
createMultiPoleFilter(poles, frequency, q)
filterUtils.freqToNote(freq)
filterUtils.noteToFreq(note)
```

### Effects
```javascript
createDelayEffect(time, feedback)
createPingPongDelay(time, feedback)
```

## UI Components API

### Knob
```svelte
<Knob
  bind:value
  min={0}
  max={100}
  step={1}
  label="Parameter Name"
/>
```

### Slider
```svelte
<Slider
  bind:value
  min={0}
  max={100}
  step={1}
  label="Parameter Name"
  vertical={false}
/>
```

### Button
```svelte
<Button
  label="Click Me"
  variant="primary"      <!-- primary, secondary, danger -->
  disabled={false}
  onclick={() => console.log('clicked')}
/>
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Audio won't play | Call `unlockAudioContext()` first |
| Component not found | Check import path and alias config |
| Build fails | `rm -rf node_modules && pnpm install` |
| Changes not reflected | Restart dev server with `pnpm dev` |
| Dependencies not found | Make sure you ran `pnpm install` at project root |

## Useful Links

- [Web Audio API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Svelte Docs](https://svelte.dev/docs/svelte/overview)
- [Vite Docs](https://vitejs.dev/)
- [PNPM Docs](https://pnpm.io/)
- [Turborepo Docs](https://turbo.build/)

## Getting Help

1. Check the [GETTING_STARTED.md](docs/GETTING_STARTED.md)
2. Read relevant section in [PLUGIN_DEVELOPMENT.md](docs/PLUGIN_DEVELOPMENT.md)
3. Look at example in [LEARNING_PATH.md](docs/LEARNING_PATH.md)
4. Check template plugin code: `plugins/_template/web/src/App.svelte`
5. Search MDN Web Audio API docs
6. Open GitHub issue with bug report template

## Next Steps

1. **Install**: `pnpm install`
2. **Create**: `pnpm create-plugin`
3. **Develop**: `cd plugins/my-plugin/web && pnpm dev`
4. **Learn**: Read [LEARNING_PATH.md](docs/LEARNING_PATH.md)
5. **Build**: Create your audio plugin!

---

**Quick Start**: Go to [GETTING_STARTED.md](docs/GETTING_STARTED.md)
