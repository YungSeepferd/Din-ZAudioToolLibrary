# Audio Plugin Playground Architecture

## Overview

This is a monorepo architecture designed for plugin development with clear separation of concerns:

```
Audio Plugin Playground
├── Plugins (Independent)
├── Shared Resources (Reusable)
└── Tools & Documentation
```

## Key Design Principles

### 1. Plugin Independence
Each plugin is a self-contained unit with:
- Its own dependencies via `package.json`
- Isolated state and components
- Independent build process
- Ability to work standalone

### 2. Shared Resources
Common code lives in `/shared` and is:
- Decoupled from plugins (plugins depend on shared, never vice versa)
- Well-documented with clear APIs
- Versioned and maintained separately

### 3. Monorepo Tooling
PNPM workspaces + Turborepo provides:
- Efficient dependency installation (hoisting)
- Parallel builds and tasks
- Shared dependency caching
- Easy cross-workspace imports

## Directory Structure Deep Dive

### `/plugins` - Plugin Projects

```
plugins/
├── _template/              # Boilerplate for new plugins
│   ├── web/               # Web version
│   │   ├── src/           # Svelte components
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   └── index.html
│   ├── native/            # Native plugin (placeholder)
│   └── README.md
│
├── vintage-synth/         # Example: Analog synthesizer
├── tape-delay/            # Example: Vintage delay
└── [your-plugin]/         # Your plugins
```

Each plugin is independent but can use shared resources.

### `/shared` - Shared Resources

#### `audio-core/`
Core audio DSP utilities:

```
audio-core/
├── synthesis/
│   ├── oscillators.js     # createOscillator(), createWavetableOscillator()
│   ├── envelopes.js       # createADSREnvelope(), createAREnvelope()
│   └── filters.js         # createLowPassFilter(), createBandPassFilter(), etc.
├── effects/
│   ├── delay.js
│   ├── reverb.js
│   └── distortion.js
├── vintage/
│   ├── tape-emulation.js
│   └── analog-modeling.js
└── utils/
    ├── audio-context.js   # Singleton context manager
    └── parameter-automation.js
```

#### `ui-components/`
Reusable Svelte components:

```
ui-components/
├── controls/
│   ├── Knob.svelte        # Rotary control
│   ├── Slider.svelte      # Horizontal/vertical slider
│   ├── Button.svelte      # Styled button
│   └── XYPad.svelte       # 2D control
├── visualizers/
│   ├── Waveform.svelte    # Real-time waveform display
│   ├── Spectrum.svelte    # Frequency spectrum
│   └── VUMeter.svelte     # Volume level meter
└── layouts/
    ├── RackUnit.svelte    # Hardware-style container
    └── PluginContainer.svelte
```

#### `presets/`
Preset management system:

```
presets/
└── preset-manager.js      # Save/load/share presets
```

### `/resources` - Learning Materials

```
resources/
├── impulse-responses/     # Reverb IRs for effects
├── samples/               # Audio files for testing
├── examples/
│   ├── basic-oscillator/
│   ├── filter-sweep/
│   └── audioworklet-setup/
└── references/
    ├── web-audio-cheatsheet.md
    ├── svelte-audio-patterns.md
    └── vintage-techniques.md
```

### `/docs` - Documentation

```
docs/
├── GETTING_STARTED.md     # Setup and first plugin
├── ARCHITECTURE.md        # This file
├── PLUGIN_DEVELOPMENT.md  # How to build plugins
├── LEARNING_PATH.md       # Structured learning
└── guides/
    ├── web-to-native.md
    ├── tauri-setup.md
    └── audioworklet-guide.md
```

## Dependency Flow

```
┌─────────────────────────────────────┐
│         Plugins                     │
│  (vintage-synth, tape-delay, etc.) │
└──────────────┬──────────────────────┘
               │ imports from
               ↓
┌──────────────────────────────────────┐
│         Shared Resources             │
│  (audio-core, ui-components)         │
│  ✓ Can be imported by plugins       │
│  ✗ Cannot import from plugins       │
└──────────────────────────────────────┘
```

### Correct Import Structure

**In a plugin** (`plugins/my-synth/web/src/App.svelte`):

```javascript
// ✅ OK - Importing from shared
import { createOscillator } from '@audio/synthesis/oscillators.js';
import Knob from '@ui/controls/Knob.svelte';

// ❌ NOT OK - Cannot import other plugins
import { something } from '../../../plugins/other-plugin/src/...';
```

**In shared** (`shared/audio-core/synthesis/filters.js`):

```javascript
// ✅ OK - Using other shared utilities
import { getAudioContext } from '../utils/audio-context.js';

// ❌ NOT OK - Cannot import from plugins
import { something } from '../../plugins/my-synth/...';
```

## Build System

### PNPM Workspaces
Defines which directories are packages:

```yaml
# pnpm-workspace.yaml
packages:
  - 'plugins/**/web'   # All plugin web projects
  - 'shared/*'         # All shared modules
  - 'tools/*'          # Build tools
  - 'playground/*'     # Experiments
```

### Turborepo
Orchestrates builds across packages:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],  // Build dependencies first
      "outputs": ["dist/**"]     // Cache build artifacts
    },
    "dev": {
      "cache": false,            // Don't cache dev servers
      "persistent": true         // Keep running
    }
  }
}
```

## Development Workflow

### Running Everything

```bash
# Start all plugins in parallel
pnpm dev
```

This runs `pnpm dev` in every workspace that has it, using Turborepo to handle dependencies.

### Running One Plugin

```bash
cd plugins/vintage-synth/web
pnpm dev
```

### Building for Production

```bash
# Build all packages
pnpm build

# Or specifically
cd plugins/vintage-synth/web
pnpm build
```

## Adding New Packages to Shared

1. Create a new directory in `/shared`:
   ```bash
   mkdir shared/my-module
   ```

2. Add a `package.json`:
   ```json
   {
     "name": "@audio-playground/my-module",
     "version": "0.1.0",
     "exports": {
       ".": "./index.js"
     }
   }
   ```

3. Create `index.js`:
   ```javascript
   export { myFunction } from './my-function.js';
   ```

4. It's now available to all plugins via:
   ```javascript
   import { myFunction } from '@audio-playground/my-module';
   ```

## Asset Management

### Audio Files
Keep them in `/resources/samples` for easy reference:
```javascript
import soundUrl from '@shared/../../resources/samples/kick.wav';
const audio = new Audio(soundUrl);
```

### Impulse Responses
Reverb IRs go in `/resources/impulse-responses`:
```javascript
const irPath = '@shared/../../resources/impulse-responses/large-hall.wav';
```

## Deployment Strategy

### Web Plugins
1. Build with Vite: `pnpm build`
2. Output goes to `dist/`
3. Deploy to static hosting (Vercel, Netlify, GitHub Pages)

### Desktop Applications
1. Use Tauri for native packaging
2. Build with: `pnpm tauri:build`
3. Creates DMG, EXE, or AppImage

### Plugin Export (Future)
1. Use Elementary Audio or iPlug2
2. Compile to VST/AU/CLAP
3. Distribute via plugin managers

## Scaling Considerations

### Adding More Plugins
- Use the template: `pnpm create-plugin`
- Each plugin is independent
- Shared utilities grow with demand

### Adding More Shared Modules
- Create in `/shared` following the same pattern
- Export via `index.js`
- Document the API

### Performance
- PNPM hoists common dependencies (saves space/time)
- Turborepo caches builds (faster rebuilds)
- Each plugin has its own dev server (no conflicts)

## Best Practices

1. **Keep shared generic**: Audio utilities should work for many plugins
2. **Minimize plugin coupling**: Each plugin should be independently deployable
3. **Version carefully**: Update shared code carefully to not break plugins
4. **Document APIs**: Clear exports and JSDoc in shared modules
5. **Test independently**: Test plugins and shared code separately

## Future Enhancements

- [ ] Shared preset database
- [ ] Plugin marketplace
- [ ] Audio worklet support for heavy DSP
- [ ] Native plugin targets (VST, AU, CLAP)
- [ ] Real-time parameter automation recording
- [ ] MIDI support
- [ ] Web Audio Module (WAM) support
