# Plugin Template

This is a template for creating new audio plugins in the Audio Plugin Playground.

## Structure

```
.
├── web/                    # Web version (Vite + Svelte)
│   ├── src/
│   │   ├── main.js
│   │   ├── App.svelte
│   │   └── style.css
│   ├── vite.config.js
│   ├── package.json
│   └── index.html
├── native/                 # Native plugin placeholder
└── README.md
```

## Development

```bash
# Install dependencies
cd web
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Using Shared Resources

The template is pre-configured with aliases to the shared resources:

```javascript
// Audio core
import { getAudioContext } from '@audio/utils/audio-context.js';
import { createOscillator } from '@audio/synthesis/oscillators.js';
import { createADSREnvelope } from '@audio/synthesis/envelopes.js';
import { createLowPassFilter } from '@audio/synthesis/filters.js';

// UI Components
import Knob from '@ui/controls/Knob.svelte';
import Slider from '@ui/controls/Slider.svelte';
import Button from '@ui/controls/Button.svelte';
```

## Next Steps

1. Rename this directory to your plugin name
2. Update `web/package.json` with your plugin's name and description
3. Modify `src/App.svelte` to build your plugin
4. Add documentation specific to your plugin
