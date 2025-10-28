# Getting Started with Audio Plugin Playground

## Prerequisites

Make sure you have the following installed:

- **Node.js 20+**: [Download](https://nodejs.org/)
- **PNPM 8+**: `npm install -g pnpm`
- **Rust** (for Tauri, optional): https://www.rust-lang.org/tools/install
- **Git**: https://git-scm.com/

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd Din-ZAudioToolLibrary

# Install dependencies
pnpm install
```

## Your First Plugin

### Option 1: Use the Template (Recommended)

```bash
# Create a new plugin from template
pnpm create-plugin

# Follow the prompts:
# - Plugin name (kebab-case): my-first-plugin
# - Description: My first audio plugin
# - Type: synth/effect/utility
```

### Option 2: Manually Create a Plugin

1. Copy the template folder:
   ```bash
   cp -r plugins/_template plugins/my-synth
   ```

2. Update the package name in `plugins/my-synth/web/package.json`

3. Navigate to the plugin:
   ```bash
   cd plugins/my-synth/web
   ```

## Running Your Plugin

```bash
# Navigate to your plugin
cd plugins/my-synth/web

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open http://localhost:5173 in your browser. You should see the template plugin with a working synthesizer!

## Understanding the Architecture

### Shared Audio Core (`/shared/audio-core`)

This contains all the audio DSP utilities:

- **`synthesis/`** - Oscillators, envelopes, and basic filters
- **`effects/`** - Reverb, delay, distortion, and other effects
- **`utils/`** - Audio context management and helper functions

### Example: Using Oscillators

```javascript
import { getAudioContext } from '@audio/utils/audio-context.js';
import { createOscillator } from '@audio/synthesis/oscillators.js';

// Get the singleton audio context
const ctx = getAudioContext();

// Create a sine wave oscillator at 440 Hz
const osc = createOscillator('sine', 440);

// Connect to speakers
osc.connect(ctx.destination);

// Start playing
osc.start();

// Change frequency
osc.setFrequency(880);

// Stop
osc.stop();
```

### UI Components (`/shared/ui-components`)

Pre-built Svelte components for building plugin interfaces:

```svelte
<script>
  import Knob from '@ui/controls/Knob.svelte';
  import Slider from '@ui/controls/Slider.svelte';
  import Button from '@ui/controls/Button.svelte';

  let frequency = $state(440);
</script>

<Knob bind:value={frequency} min={20} max={2000} label="Frequency" />
<Button label="Play" onclick={() => playSound()} />
```

## Project Commands

```bash
# Start all plugins in development mode
pnpm dev

# Build all plugins for production
pnpm build

# Create a new plugin
pnpm create-plugin

# Preview production build
pnpm preview
```

## Directory Navigation

- **Plugin code**: `plugins/my-synth/web/src/`
- **Shared utilities**: `shared/audio-core/`
- **UI components**: `shared/ui-components/`
- **Documentation**: `docs/`

## Next Steps

1. **Explore the template**: Open `plugins/_template/web/src/App.svelte` to understand the structure
2. **Read the audio core docs**: Check out `shared/audio-core/synthesis/` for available audio utilities
3. **Follow the learning path**: See `docs/LEARNING_PATH.md` for a structured learning guide
4. **Build your first plugin**: Use the template as a starting point and add your own features

## Common Issues

### Audio doesn't play
- Make sure you called `unlockAudioContext()` first (required on browsers)
- Check that the audio context is running: `getAudioContext().state === 'running'`

### Component not found
- Check that you're using the correct import paths with `@ui` and `@audio` aliases
- Make sure you're in the plugin's `web/` directory when running `pnpm dev`

### PNPM install fails
- Delete `pnpm-lock.yaml` and run `pnpm install` again
- Make sure your Node version is 20+: `node --version`

## Learning Resources

- [MDN Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) - Start here
- [Svelte 5 Documentation](https://svelte.dev/docs/svelte/overview) - Latest Svelte with Runes
- [Tone.js](https://tonejs.github.io/) - High-level audio library
- [Ableton Learning Music](https://learningmusic.ableton.com) - Music theory basics
