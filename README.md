# Din-ZAudioToolLibrary - 🎛️ Audio Plugin Playground

Open Source Audio Plugins and other cool ideas

## 🎯 Project Goals

- Create web-based audio plugins using Svelte and Web Audio API
- Progress from web prototypes to native VST/AU plugins
- Build a reusable library of audio components and effects
- Document the learning journey and best practices

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Create a new plugin
pnpm create-plugin

# Start development (all plugins)
pnpm dev

# Build all plugins
pnpm build
```

## 📚 Documentation

- [Getting Started](docs/GETTING_STARTED.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Plugin Development Guide](docs/PLUGIN_DEVELOPMENT.md)
- [Learning Path](docs/LEARNING_PATH.md)

## 🔧 Tech Stack

- **UI Framework**: Svelte 5
- **Audio**: Web Audio API, Tone.js
- **Desktop**: Tauri 2.0
- **Native Plugins**: iPlug2 / JUCE (future)
- **Build Tools**: Vite, Turborepo, PNPM

## 📁 Project Structure

```
audio-plugin-playground/
├── plugins/                      # Individual plugin projects
│   ├── vintage-synth/           # Example: Analog-style synthesizer
│   ├── tape-delay/              # Example: Vintage tape delay effect
│   └── _template/               # Boilerplate for new plugins
├── shared/                      # Shared resources
│   ├── audio-core/             # Core audio utilities
│   │   ├── synthesis/          # Oscillators, envelopes, filters
│   │   ├── effects/            # Reverb, delay, distortion
│   │   └── utils/              # Audio context management
│   ├── ui-components/          # Reusable Svelte components
│   │   ├── controls/           # Knob, Slider, Button
│   │   ├── visualizers/        # Waveform, Spectrum, VU Meter
│   │   └── layouts/            # RackUnit, PluginContainer
│   └── presets/                # Preset management
├── resources/                  # Learning and reference
│   ├── impulse-responses/      # Reverb IRs
│   ├── samples/                # Audio samples
│   └── examples/               # Code examples
├── docs/                       # Documentation
├── playground/                 # Quick experiments
└── tools/                      # Build scripts and templates
```

## 📖 Resources

- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Svelte Documentation](https://svelte.dev)
- [Tone.js](https://tonejs.github.io)
- [Tauri](https://tauri.app)

## 📝 License

MIT
