# Audio Plugin Template

**Starting point for creating new audio plugins in the Din-ZAudioToolLibrary monorepo**

This template provides a minimal but complete example of an audio plugin built with Svelte 5, Web Audio API, and the shared audio-core and ui-components libraries. Use this as a foundation for building your own plugins.

## 🎯 What's Included

This template demonstrates:

- ✅ **Svelte 5 Runes** - Modern reactive patterns (`$state`, `$effect`, `$props`)
- ✅ **Web Audio API integration** - AudioContext, oscillators, parameter control
- ✅ **Shared library imports** - Using `@audio` and `@ui` aliases
- ✅ **Audio unlock for iOS** - Handles browser autoplay restrictions
- ✅ **Basic UI controls** - Knob and Button components
- ✅ **Build configuration** - Vite setup for development and production
- ✅ **Project structure** - Organized `src/` directory

## 📦 What's Built In

The template includes a simple synthesizer with:

- **Single oscillator** - Sine wave generator
- **Frequency control** - Knob for adjusting pitch (20Hz - 2000Hz)
- **Play/Stop button** - Basic playback control
- **Reactive audio** - Frequency updates while playing

## 🚀 Quick Start

### Option 1: Using the Template with `pnpm create-plugin`

The recommended way to create a new plugin from this template:

```bash
# From project root
pnpm create-plugin

# Follow prompts:
# - Plugin name: my-awesome-synth
# - Description: A vintage-style synthesizer
# - Author: Your Name

# Navigate to new plugin
cd plugins/my-awesome-synth/web

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Option 2: Manual Copy

Alternatively, copy the template manually:

```bash
# From project root
cp -r plugins/_template plugins/my-plugin
cd plugins/my-plugin/web

# Update package.json with your plugin details
# Edit: name, description, author

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## 📂 Project Structure

```
plugins/_template/web/
├── src/
│   ├── App.svelte          # Main component (entry point)
│   ├── main.js             # Application bootstrap
│   └── app.css             # Global styles (optional)
│
├── dist/                   # Build output (gitignored)
├── node_modules/           # Dependencies (gitignored)
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite build configuration
└── README.md               # This file
```

## 🔧 Configuration

### Import Aliases

The template is pre-configured with import aliases for easy access to shared libraries:

```javascript
// Audio modules
import { createOscillator } from '@audio/synthesis/oscillators';
import { createADSREnvelope } from '@audio/synthesis/envelopes';
import { createLowPassFilter } from '@audio/synthesis/filters';
import { getAudioContext } from '@audio/utils/audio-context';

// UI components
import Knob from '@ui/controls/Knob.svelte';
import Slider from '@ui/controls/Slider.svelte';
import Button from '@ui/controls/Button.svelte';
import SpectrumAnalyzer from '@ui/visualizers/SpectrumAnalyzer.svelte';
```

These aliases are configured in [vite.config.js](vite.config.js):

```javascript
resolve: {
  alias: {
    '@audio': path.resolve(__dirname, '../../../shared/audio-core'),
    '@ui': path.resolve(__dirname, '../../../shared/ui-components'),
    '@shared': path.resolve(__dirname, '../../../shared')
  }
}
```

### Vite Configuration

The template uses Vite for fast development and optimized builds:

- **Hot Module Replacement (HMR)**: Changes reflect instantly during development
- **Svelte 5 support**: Uses `@sveltejs/vite-plugin-svelte`
- **Import aliases**: Pre-configured for shared libraries
- **Static build**: Outputs to `dist/` for deployment

## 📝 Template Code Walkthrough

### App.svelte - Main Component

The template's [src/App.svelte](src/App.svelte) demonstrates key patterns:

```svelte
<script>
  import { onMount } from 'svelte';
  import Knob from '@ui/controls/Knob.svelte';
  import Button from '@ui/controls/Button.svelte';
  import { getAudioContext, unlockAudioContext } from '@audio/utils/audio-context.js';
  import { createOscillator } from '@audio/synthesis/oscillators.js';

  // State (Svelte 5 Runes)
  let isRunning = $state(false);
  let frequency = $state(440);
  let oscillator = null;

  // Unlock audio on mount (required for iOS/Safari)
  onMount(async () => {
    await unlockAudioContext();
  });

  // Start audio playback
  function startAudio() {
    const ctx = getAudioContext();
    oscillator = createOscillator('sine', frequency);
    oscillator.connect(ctx.destination);
    oscillator.start();
    isRunning = true;
  }

  // Stop audio playback
  function stopAudio() {
    if (oscillator) {
      oscillator.stop();
      isRunning = false;
    }
  }

  // Update frequency reactively
  $effect(() => {
    if (isRunning && oscillator) {
      oscillator.setFrequency(frequency);
    }
  });
</script>

<div class="container">
  <h1>Audio Plugin Template</h1>

  <div class="controls">
    <Knob
      bind:value={frequency}
      min={20}
      max={2000}
      step={1}
      label="Frequency"
    />

    <Button
      label={isRunning ? 'Stop' : 'Play'}
      variant={isRunning ? 'danger' : 'primary'}
      onclick={isRunning ? stopAudio : startAudio}
    />
  </div>
</div>
```

### Key Patterns

1. **Svelte 5 Runes**
   - `$state()` for reactive state
   - `$effect()` for side effects (audio parameter updates)
   - `bind:value` for two-way binding with controls

2. **Audio Context Management**
   - `unlockAudioContext()` called on mount (iOS requirement)
   - `getAudioContext()` provides singleton instance

3. **Reactive Parameter Updates**
   - `$effect()` watches frequency changes
   - Scheduled updates prevent audio clicks/pops

## 🎨 Customizing the Template

### 1. Adding More Controls

```svelte
<script>
  import VintageKnob from '@ui/controls/VintageKnob.svelte';
  import Slider from '@ui/controls/Slider.svelte';

  let volume = $state(0.7);
  let waveform = $state('sine');

  $effect(() => {
    if (oscillator) {
      oscillator.setGain(volume);
      oscillator.setType(waveform);
    }
  });
</script>

<VintageKnob bind:value={volume} min={0} max={1} step={0.01} label="Volume" />
<Slider bind:value={volume} min={0} max={1} step={0.01} label="Volume" />
```

### 2. Adding Effects

```svelte
<script>
  import { createLowPassFilter } from '@audio/synthesis/filters';
  import { createDelay } from '@audio/effects/delay';

  let filter = null;
  let delay = null;

  function startAudio() {
    const ctx = getAudioContext();
    oscillator = createOscillator('sine', frequency);
    filter = createLowPassFilter(1000, 1);
    delay = createDelay(0.3, 0.5, 0.3);

    // Connect: oscillator → filter → delay → output
    oscillator.connect(filter.filter);
    filter.connect(delay.input);
    delay.output.connect(ctx.destination);

    oscillator.start();
    isRunning = true;
  }
</script>
```

### 3. Adding Visualizers

```svelte
<script>
  import SpectrumAnalyzer from '@ui/visualizers/SpectrumAnalyzer.svelte';
  import VUMeter from '@ui/visualizers/VUMeter.svelte';

  let audioContext = $state(null);
  let masterGain = $state(null);

  onMount(async () => {
    await unlockAudioContext();
    audioContext = getAudioContext();
    masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
  });
</script>

{#if audioContext && masterGain}
  <SpectrumAnalyzer
    audioContext={audioContext}
    sourceNode={masterGain}
    width={600}
    height={150}
  />

  <VUMeter
    audioContext={audioContext}
    sourceNode={masterGain}
    width={40}
    height={150}
  />
{/if}
```

### 4. Organizing Code (Recommended for Larger Plugins)

For more complex plugins, organize your code:

```
src/
├── lib/
│   ├── audio/
│   │   ├── synth.js          # Synthesizer logic
│   │   ├── effects.js        # Effects chain
│   │   └── voice-manager.js  # Polyphony handling
│   ├── components/
│   │   ├── Oscillator.svelte # Oscillator section
│   │   ├── Filter.svelte     # Filter section
│   │   └── Effects.svelte    # Effects section
│   └── stores/
│       └── preset.svelte.js  # Preset management (Svelte 5 runes store)
├── App.svelte                # Main layout
└── main.js                   # Entry point
```

## 🧪 Testing

### Running Tests

```bash
# Unit tests (when added)
pnpm test

# E2E tests (when added)
pnpm test:e2e
```

### Recommended Testing Strategy

1. **Unit tests** for audio logic:
   - Test oscillator creation
   - Test parameter ranges
   - Test effect processing

2. **Component tests** for UI:
   - Test knob interaction
   - Test button clicks
   - Test parameter binding

3. **E2E tests** for user flows:
   - Test playback start/stop
   - Test parameter changes during playback
   - Test audio unlock on iOS

See [docs/testing/TESTING-STRATEGY.md](../../../docs/testing/TESTING-STRATEGY.md) for details.

## 📦 Building for Production

```bash
# Build optimized production bundle
pnpm build

# Preview production build locally
pnpm preview

# Build output is in dist/ directory
# Deploy dist/ to any static host (Netlify, Vercel, GitHub Pages)
```

## 🔗 Shared Libraries Reference

### Audio Core Library

Complete API documentation: [shared/audio-core/README.md](../../../shared/audio-core/README.md)

**Key modules:**
- `synthesis/oscillators` - Waveform generation
- `synthesis/envelopes` - ADSR envelopes
- `synthesis/filters` - Frequency filters
- `effects/delay` - Delay effects
- `music-theory/` - Scales, chords, progressions
- `utils/audio-context` - AudioContext management

### UI Components Library

Complete API documentation: [shared/ui-components/README.md](../../../shared/ui-components/README.md)

**Controls:**
- `Knob` - Basic rotary control
- `VintageKnob` - Styled rotary control
- `Slider` - Linear slider
- `Button` - Styled button

**Visualizers:**
- `SpectrumAnalyzer` - FFT frequency visualization
- `VUMeter` - Volume level meter
- `EnvelopeGraph` - ADSR envelope display

## 📚 Learning Resources

### Essential Documentation

1. **[Getting Started Guide](../../../docs/general/GETTING_STARTED.md)** - Initial setup
2. **[Plugin Development Guide](../../../docs/guides/PLUGIN_DEVELOPMENT.md)** - Complete plugin guide
3. **[Svelte 5 Audio Guide](../../../docs/guides/SVELTE5_AUDIO_GUIDE.md)** - Integrating Svelte + audio
4. **[Web Audio API Guide](../../../docs/guides/WEB_AUDIO_API_GUIDE.md)** - Web Audio patterns
5. **[Learning Path](../../../docs/learning/LEARNING_PATH.md)** - 12-week curriculum

### Example: LoFi Piano Plugin

See a complete, production-ready example:

- **Live Demo**: https://yungseepferd.github.io/Din-ZAudioToolLibrary/
- **Source Code**: `plugins/lofi-piano/web/`
- **Documentation**: [docs/projects/lofi-piano/](../../../docs/projects/lofi-piano/)

The LoFi Piano demonstrates:
- Polyphonic synthesis (8-voice)
- Complete effects chain (saturation, compression, reverb)
- Real-time visualizers (spectrum, VU meter, envelope graph)
- Chord generator with music theory
- Vintage aesthetic design system
- GitHub Pages deployment

## 💡 Tips & Best Practices

### Svelte 5 Patterns

Always use Svelte 5 Runes (not Svelte 4 patterns):

```javascript
// ✅ GOOD - Svelte 5
let frequency = $state(440);
let volume = $derived(frequency / 440);

$effect(() => {
  oscillator.setFrequency(frequency);
});

// ❌ BAD - Svelte 4 (will not work)
let frequency = 440;
$: volume = frequency / 440;
$: oscillator.setFrequency(frequency);
```

### Audio Best Practices

1. **Always unlock AudioContext on iOS/Safari**:
   ```javascript
   onMount(async () => {
     await unlockAudioContext();
   });
   ```

2. **Schedule parameter changes** (avoid clicks):
   ```javascript
   // ✅ GOOD
   oscillator.setFrequency(880); // Uses scheduled changes internally

   // ❌ BAD
   oscillator.frequency.value = 880; // Causes clicks/pops
   ```

3. **Clean up audio nodes**:
   ```javascript
   function stopAudio() {
     oscillator.stop();
     oscillator.disconnect();
     oscillator = null;
   }
   ```

4. **Limit polyphony** (8-16 voices recommended):
   ```javascript
   const MAX_VOICES = 8;
   let activeVoices = [];

   function playNote() {
     if (activeVoices.length >= MAX_VOICES) {
       // Stop oldest voice
       activeVoices[0].stop();
       activeVoices.shift();
     }
     // Create new voice
     activeVoices.push(createVoice());
   }
   ```

### Performance Tips

- Use `AudioWorklet` for heavy DSP (convolution reverb, FFT)
- Reuse AudioContext (singleton via `getAudioContext()`)
- Limit active audio nodes (disconnect when unused)
- Profile with Chrome DevTools → Performance → Audio

## 🆘 Troubleshooting

### Common Issues

**Audio doesn't play on iOS/Safari**
- Ensure `unlockAudioContext()` is called
- AudioContext must be unlocked via user gesture (tap, click)

**Clicking/popping sounds when changing parameters**
- Use scheduled parameter changes (not direct `.value` assignment)
- Use methods like `setFrequency()` which internally schedule changes

**Build fails with module not found**
- Check import aliases in `vite.config.js`
- Ensure `shared/` libraries are installed (run `pnpm install` from root)

**Hot reload doesn't work**
- Restart dev server: `pnpm dev`
- Clear cache: `rm -rf node_modules/.vite`

## 🚀 Next Steps

After familiarizing yourself with the template:

1. **Build a simple synth** - Add envelope, filter, effects
2. **Add visualizers** - Spectrum analyzer, VU meter
3. **Implement presets** - Save/load parameter states
4. **Add polyphony** - Voice manager with note stealing
5. **Study LoFi Piano** - Production example with advanced features
6. **Plan native translation** - See VST/AU translation guide

## 📝 Further Reading

- **Project Architecture**: [docs/architecture/ARCHITECTURE.md](../../../docs/architecture/ARCHITECTURE.md)
- **Code Quality Guide**: [docs/guides/CODE_QUALITY_GUIDE.md](../../../docs/guides/CODE_QUALITY_GUIDE.md)
- **Svelte 5 Quick Reference**: [docs/SVELTE5_QUICK_REFERENCE.md](../../../docs/SVELTE5_QUICK_REFERENCE.md)
- **MCP Setup**: [CLAUDE_CODE_QUICK_START.md](../../../CLAUDE_CODE_QUICK_START.md)

---

**Last Updated**: 2025-11-03
**Template Version**: 1.0.0
**License**: MIT
**Maintainer**: Din-ZAudioToolLibrary Project

🎹 **Start building your audio plugin!** ✨
