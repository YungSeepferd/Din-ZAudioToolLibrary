# Learning Path: From Beginner to Plugin Developer

This guide provides a structured path to mastering audio plugin development.

## Phase 1: Web Audio Fundamentals (1-2 weeks)

### Week 1: Basics
**Goal**: Understand how Web Audio API works

**Resources**:
- [MDN Web Audio API Overview](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Ableton Learning Music](https://learningmusic.ableton.com) (Music theory basics)
- [Web Audio Book - Basics](https://webaudioapi.com/book/Web_Audio_API_V2_Ch01.pdf)

**Hands-on**:
```javascript
// Code along with this simple example
const audioContext = new AudioContext();
const oscillator = audioContext.createOscillator();
const gain = audioContext.createGain();

oscillator.type = 'sine';
oscillator.frequency.value = 440; // A4 note
gain.gain.value = 0.3;

oscillator.connect(gain);
gain.connect(audioContext.destination);

oscillator.start();
// ... wait a bit ...
oscillator.stop();
```

**Topics**:
- Audio context and nodes
- Oscillators and their waveforms
- Gain nodes (volume control)
- Connecting nodes together
- Starting/stopping audio

**Check Your Understanding**:
- [ ] Create an oscillator at different frequencies
- [ ] Change volume with gain node
- [ ] Understand the audio graph

### Week 2: Essential Nodes
**Goal**: Master common Web Audio nodes

**Explore these in order**:

1. **Envelope** - Control how sound evolves over time
   ```javascript
   // ADSR envelope
   gain.gain.setValueAtTime(0, audioContext.currentTime);
   gain.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01); // Attack
   gain.gain.linearRampToValueAtTime(0.7, audioContext.currentTime + 0.11); // Decay/Sustain
   // Release happens on note off
   ```

2. **Filter** - Shape the tone (remove frequencies)
   ```javascript
   const filter = audioContext.createBiquadFilter();
   filter.type = 'lowpass';
   filter.frequency.value = 2000;
   filter.Q.value = 10; // Resonance
   ```

3. **Delay** - Create repeating echoes
   ```javascript
   const delay = audioContext.createDelay(5);
   delay.delayTime.value = 0.5; // 500ms delay
   ```

4. **Convolver** - Apply reverb from impulse responses
   ```javascript
   const convolver = audioContext.createConvolver();
   convolver.buffer = irBuffer; // Impulse response
   ```

**Build a Simple Synthesizer**:
- Oscillator (tone generator)
- Envelope (ADSR)
- Filter (tone shaping)
- Delay (depth)
- Master gain

## Phase 2: Svelte & Component Development (1-2 weeks)

### Learning Svelte Basics
**Goal**: Build interactive UIs with Svelte 5

**Resources**:
- [Svelte 5 Interactive Tutorial](https://svelte.dev/tutorial/svelte/welcome-to-svelte)
- [Svelte Runes Documentation](https://svelte.dev/docs/svelte/overview)

**Key Concepts**:
1. **Reactivity with Runes**
   ```svelte
   <script>
     let count = $state(0);  // Reactive state

     $effect(() => {
       console.log(`Count changed to: ${count}`);
     }); // Side effects
   </script>

   <button onclick={() => count++}>
     Count: {count}
   </button>
   ```

2. **Props & Binding**
   ```svelte
   <script>
     let { value = 0, min = 0, max = 100 } = $props();
   </script>

   <input type="range" bind:value {min} {max} />
   ```

3. **Lifecycle**
   ```svelte
   <script>
     import { onMount, onDestroy } from 'svelte';

     onMount(() => {
       // Runs when component mounts
     });

     onDestroy(() => {
       // Cleanup
     });
   </script>
   ```

### Build UI Components
1. **Knob Control**
   - Rotary visual feedback
   - Mouse/touch interaction
   - Real-time parameter updates

2. **Slider Control**
   - Range input
   - Visual progress bar
   - Value display

3. **Meter Display**
   - Real-time level visualization
   - Peak detection
   - Canvas rendering

## Phase 3: Using This Project (1 week)

### Setup & Exploration
1. Follow [Getting Started](GETTING_STARTED.md)
2. Review project structure
3. Understand the shared utilities
4. Explore existing components

### Using Shared Audio Core

**Explore each module**:

```javascript
// Oscillators
import { createOscillator, waveforms } from '@audio/synthesis/oscillators.js';

// Envelopes
import { createADSREnvelope, createAREnvelope } from '@audio/synthesis/envelopes.js';

// Filters
import { createLowPassFilter, createHighPassFilter } from '@audio/synthesis/filters.js';

// Context Management
import { getAudioContext, unlockAudioContext } from '@audio/utils/audio-context.js';
```

**Mini Project**: Build a Simple Tone Generator
1. Use shared `createOscillator`
2. Add shared `Knob` component
3. Use shared `unlockAudioContext`
4. Deploy to web

## Phase 4: Build Your First Plugin (2 weeks)

### Week 1: Simple Synth

**Requirements**:
- Oscillator selection (sine/square/sawtooth/triangle)
- Frequency control (20 Hz - 2 kHz)
- Gain control
- Play/Stop buttons
- Real-time frequency adjustment

**Bonus**:
- Waveform selector
- Better styling
- Save preset button

### Week 2: Add Effects

**Requirements**:
- Add a low-pass filter
- Add delay effect
- Cutoff frequency control
- Delay time/feedback control

**Bonus**:
- Filter envelope
- Delay feedback control
- Reverb (using convolver)
- Visual feedback

## Phase 5: Advanced Topics (2-4 weeks)

### Audio Worklets
For CPU-intensive DSP:

```javascript
// Register custom processor
await audioContext.audioWorklet.addModule('processor.js');
const node = new AudioWorkletNode(audioContext, 'my-processor');
```

**Use when**:
- Heavy processing required
- Real-time convolution
- Custom algorithms
- Sample-accurate processing

### MIDI Support
```javascript
navigator.requestMIDIAccess().then(onMIDISuccess);

function onMIDISuccess(midiAccess) {
  const inputs = midiAccess.inputs.values();
  for (let input of inputs) {
    input.onmidimessage = (event) => {
      const [status, data1, data2] = event.data;
      // Handle note on/off, CC, etc.
    };
  }
}
```

### Recording & Export
```javascript
const mediaRecorder = new MediaRecorder(audioContext.createMediaStreamDestination().stream);

mediaRecorder.ondataavailable = (event) => {
  const blob = event.data;
  const url = URL.createObjectURL(blob);
  // Download or process
};

mediaRecorder.start();
// ... record audio ...
mediaRecorder.stop();
```

## Phase 6: Deployment & Distribution (1-2 weeks)

### Web Hosting
1. Build with `pnpm build`
2. Deploy to:
   - Vercel
   - Netlify
   - GitHub Pages
   - Your own server

### Desktop App with Tauri
1. Set up Rust environment
2. Initialize Tauri: `tauri init`
3. Build: `pnpm tauri:build`
4. Distribution for macOS/Windows/Linux

### Plugin Formats (Future)
- VST (Windows/Mac)
- AU (Mac)
- CLAP (Modern standard)

## Learning Resources by Topic

### Music Theory
- [Ableton Learning Music](https://learningmusic.ableton.com)
- [Music Theory Fundamentals](https://www.theorytab.com)
- [Note/Frequency Reference](https://en.wikipedia.org/wiki/Scientific_pitch_notation)

### Audio DSP
- [The Audio Programmer Channel](https://www.youtube.com/c/TheAudioProgrammer) (YouTube)
- [Designing Audio Objects in Web Audio API](https://jsbin.com/faceguh/edit?html,js,output)
- [Synthesis Techniques](https://www.sweetwater.com/store/manuals/synthesizers/)

### Web Audio
- [MDN Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Web Audio API Spec](https://www.w3.org/TR/webaudio/)
- [Web Audio Examples](https://github.com/mdn/webaudio-examples)

### Svelte
- [Svelte Tutorial](https://svelte.dev/tutorial/svelte/welcome-to-svelte)
- [Svelte Kit](https://kit.svelte.dev/)
- [SvelteHUD](https://github.com/stevendao/sveltehud) (UI library for audio)

### Tools & Communities
- [KVR Audio Forums](https://www.kvraudio.com/forum/) - DSP/plugin development
- [Gearslutz](https://gearspace.com/) - Audio gear & production
- [Audio Processing JavaScript](https://discourse.wicg.io/t/audio-processing-javascript/) - Standards discussions

## Milestones & Assessment

### Beginner (Phases 1-2)
**You can**:
- Create audio context and nodes
- Understand audio graphs
- Build basic Svelte components
- Implement simple interactions

**Project**: Oscillator + Volume Control

### Intermediate (Phases 3-4)
**You can**:
- Use shared audio utilities
- Build multi-component plugins
- Implement filters and effects
- Save/load presets
- Deploy to web

**Project**: Full Synthesizer Plugin

### Advanced (Phase 5+)
**You can**:
- Use Audio Worklets
- Handle MIDI input
- Record and process audio
- Optimize performance
- Distribute desktop apps

**Project**: Professional Plugin

## Tips for Success

1. **Code along**: Don't just read - type out examples
2. **Experiment**: Change values and see what happens
3. **Break things**: Understanding failures helps learning
4. **Share**: Show your work, get feedback
5. **Iterate**: Build something, then improve it
6. **Study existing**: Look at how others solve problems

## Staying Updated

- Follow [The Audio Programmer](https://www.youtube.com/c/TheAudioProgrammer)
- Read [Web Audio specification](https://www.w3.org/TR/webaudio/)
- Contribute to open source audio projects
- Experiment with new Web APIs (Web Codecs, etc.)

## Getting Stuck?

1. **Check documentation**: Always start with official docs
2. **Use browser DevTools**: Inspect audio graph, check console errors
3. **Search community forums**: KVR, Stack Overflow, GitHub discussions
4. **Ask for help**: Open an issue, reach out on Discord/Twitter
5. **Simplify**: Reduce problem to minimal reproducible example

---

**Happy Learning!** 🎵

The journey from beginner to advanced audio programmer takes time and practice. Enjoy the process and celebrate small victories along the way!
