# LoFi Piano Plugin

Nostalgic warm piano synthesizer for lo-fi hip-hop beats.

## Features

- **3 Detuned Oscillators**: Warm, chorus-like sound
- **ADSR Envelope**: Natural note shaping
- **Tape Saturation**: Vintage warmth
- **Compression**: Dynamic control
- **Reverb**: Spatial effects
- **88-Key Piano**: Full keyboard interface
- **6 Control Knobs**: Full parameter control
- **Real-time Visualization**: Spectrum analyzer

## Project Structure

```
src/
├── lib/
│   ├── audio/              # Audio DSP modules
│   │   ├── synthesis/      # Piano voice, oscillators, envelopes
│   │   ├── effects/        # Saturation, compression, reverb
│   │   └── context.js      # AudioContext singleton
│   ├── components/         # UI components
│   │   ├── controls/       # Knob, Slider, Button
│   │   └── piano/          # Keyboard, Control Panel, Visualizer
│   ├── stores/             # Reactive state
│   ├── types/              # TypeScript types
│   └── utils/              # Helpers
├── routes/                 # SvelteKit pages
├── styles/                 # Global CSS
└── app.html                # HTML template
```

## Development

### Setup

```bash
npm install
```

### Dev Server

```bash
npm run dev
# Visit http://localhost:5173
```

### Build

```bash
npm run build
```

### Testing

```bash
npm run test         # Run tests
npm run test:ui      # Open test UI
```

### Code Quality

```bash
npm run lint         # Check linting
npm run lint:fix     # Fix linting issues
npm run format       # Format code
npm run check        # Type check
```

## Architecture

### Single-Page App (SPA)

This is a SvelteKit SPA - no server-side rendering or routes needed. All audio processing happens client-side using the Web Audio API.

### Audio Graph

```
Keyboard Input
    ↓
Piano Voice (3 oscillators + ADSR)
    ↓
Saturation (tape warmth)
    ↓
Compression (dynamics)
    ↓
Reverb (spatial effects)
    ↓
AudioContext.destination (speakers)
```

### State Management

Uses Svelte 5 Runes for reactive state:
- `$state` for reactive variables
- `$derived` for computed values
- `$effect` for side effects (audio scheduling)

## Next Steps

1. **Phase 1**: Build core piano voice with 3 oscillators and ADSR envelope
2. **Phase 2**: Create effect chain (saturation, compression, reverb)
3. **Phase 3**: Build UI components (keyboard, control panel, visualizer)
4. **Phase 4**: Implement smooth automation without artifacts
5. **Phase 5**: Add advanced features (presets, LFO, etc.)
6. **Phase 6**: Testing, optimization, documentation

See `../../docs/projects/lofi-piano/ROADMAP.md` for detailed implementation plan.

## Resources

- [Svelte 5 Documentation](https://svelte.dev/docs)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [SvelteKit Documentation](https://kit.svelte.dev)

## License

MIT

---

Start with Phase 1, Sprint 1.1: Implement basic piano voice with detuned oscillators.
