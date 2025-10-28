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

### Getting Started & Guides
- [Getting Started](docs/GETTING_STARTED.md) - Setup and first plugin
- [Architecture](docs/ARCHITECTURE.md) - Deep dive into project structure
- [Plugin Development Guide](docs/PLUGIN_DEVELOPMENT.md) - Build plugins step-by-step
- [Learning Path](docs/LEARNING_PATH.md) - Structured 6-phase curriculum
- [Code Quality Guide](docs/CODE_QUALITY_GUIDE.md) - Best practices and standards
- [Quick Reference](QUICK_REFERENCE.md) - Cheat sheet for common tasks
- [Setup Summary](SETUP_SUMMARY.md) - Complete project overview

### Framework Integration
- [Frameworks & Tools Integration Guide](docs/FRAMEWORKS_AND_TOOLS.md) - Pure Data, SuperCollider, JUCE, iPlug2, and more
- [MCP Server Setup Guide](tools/mcp-servers/MCP_SETUP_GUIDE.md) - Access documentation through Claude Code

## 🔧 Tech Stack

### Web Audio
- **Audio Engine**: Web Audio API (native browser)
- **High-level Library**: Tone.js (optional)
- **Analysis**: Elementary Audio (future plugin export)

### UI Frameworks
- **Primary**: Svelte 5 (compiler-based, minimal overhead)
- **Desktop**: Tauri 2.0 (cross-platform native apps)
- **Styling**: CSS + CSS custom properties

### Reference Frameworks
- **Visual Patching**: Pure Data (learning & algorithm reference)
- **DSP Programming**: SuperCollider (advanced synthesis patterns)
- **Plugin Development**: JUCE & iPlug2 (native plugin targets)

### Build Tools
- **Package Manager**: PNPM (efficient monorepo)
- **Build Orchestration**: Turborepo (fast parallel builds)
- **Module Bundler**: Vite (fast HMR development)
- **Code Quality**: ESLint + Prettier

## 📁 Project Structure

```
audio-plugin-playground/
├── plugins/                      # Individual plugin projects
│   ├── vintage-synth/           # Example: Analog-style synthesizer
│   ├── tape-delay/              # Example: Vintage tape delay effect
│   └── _template/               # Boilerplate for new plugins
├── shared/                      # Shared resources (no circular deps)
│   ├── audio-core/             # Core audio DSP utilities
│   │   ├── synthesis/          # Oscillators, envelopes, filters
│   │   ├── effects/            # Delay, reverb, distortion
│   │   └── utils/              # AudioContext singleton, helpers
│   └── ui-components/          # Reusable Svelte controls
│       ├── controls/           # Knob, Slider, Button
│       ├── visualizers/        # Spectrum, Waveform, VU Meter
│       └── layouts/            # RackUnit, PluginContainer
├── resources/                  # Learning materials & examples
│   ├── docs/                   # Framework documentation
│   │   ├── web-audio-api/     # Web Audio API reference
│   │   ├── svelte/            # Svelte framework docs
│   │   ├── pure-data/         # Pure Data reference
│   │   ├── supercollider/     # SuperCollider documentation
│   │   ├── tonejs/            # Tone.js API reference
│   │   ├── juce/              # JUCE plugin framework
│   │   └── iplug2/            # iPlug2 documentation
│   ├── impulse-responses/     # Convolver reverb IRs
│   ├── samples/               # Audio files for testing
│   └── examples/              # Code examples
│       ├── web-audio/         # Web Audio implementations
│       ├── supercollider/     # SuperCollider patterns
│       └── puredata/          # Pure Data patches
├── docs/                      # Project documentation
│   ├── GETTING_STARTED.md
│   ├── ARCHITECTURE.md
│   ├── PLUGIN_DEVELOPMENT.md
│   ├── LEARNING_PATH.md
│   ├── CODE_QUALITY_GUIDE.md
│   └── FRAMEWORKS_AND_TOOLS.md
├── tools/                     # Development tools
│   └── mcp-servers/          # MCP servers for framework docs
│       ├── web-audio-mcp.js
│       ├── puredata-mcp.js
│       ├── supercollider-mcp.js
│       └── MCP_SETUP_GUIDE.md
├── playground/               # Quick experiments
├── .github/                  # CI/CD and templates
├── .eslintrc.json           # Code linting rules
├── .prettierrc.json         # Code formatting rules
├── package.json             # Root workspace config
└── README.md                # This file
```

## 📖 Framework Resources

### Web Audio
- **MDN Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **Official Spec**: https://www.w3.org/TR/webaudio/
- **Web Audio Examples**: https://github.com/mdn/webaudio-examples
- **Local Docs**: `resources/docs/web-audio-api/`

### Svelte
- **Official Docs**: https://svelte.dev/docs/svelte/overview
- **Tutorial**: https://svelte.dev/tutorial/svelte/welcome-to-svelte
- **SvelteKit**: https://kit.svelte.dev/
- **Local Docs**: `resources/docs/svelte/`

### Pure Data
- **Official Site**: http://msp.ucsd.edu/software.html
- **Community Hub**: https://puredata.info
- **Manual**: http://msp.ucsd.edu/Pd_documentation/
- **Local Docs**: `resources/docs/pure-data/`
- **Learning**: Study `resources/examples/puredata/` patches

### SuperCollider
- **Official Docs**: https://docs.supercollider.online
- **GitHub**: https://github.com/supercollider/supercollider
- **Code Examples**: https://sccode.org/
- **Book**: SuperCollider Book (MIT Press)
- **Local Docs**: `resources/docs/supercollider/`
- **Learning**: Study `resources/examples/supercollider/` patterns

### Tone.js
- **Official Docs**: https://tonejs.github.io/
- **API Reference**: https://tonejs.github.io/api/
- **Local Docs**: `resources/docs/tonejs/`

### JUCE
- **Official Docs**: https://juce.com/learn/tutorials
- **API Reference**: https://docs.juce.com/
- **Local Docs**: `resources/docs/juce/`

### iPlug2
- **Official Docs**: https://iplug2.github.io/
- **GitHub**: https://github.com/iPlug2/iPlug2
- **Local Docs**: `resources/docs/iplug2/`

## 🤖 MCP Servers

Access framework documentation directly through Claude Code:

```json
// ~/.config/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "svelte": {
      "command": "npx",
      "args": ["-y", "@sveltejs/mcp"]
    },
    "web-audio": {
      "command": "node",
      "args": ["/path/to/tools/mcp-servers/web-audio-mcp.js"]
    }
  }
}
```

Then in Claude Code use:
```
@svelte explain reactive components
@web-audio show delay node API
```

See [MCP_SETUP_GUIDE.md](tools/mcp-servers/MCP_SETUP_GUIDE.md) for detailed instructions.

## 📝 License

MIT
