# LoFi Piano - Development Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm (pnpm recommended)

### Installation

```bash
# Navigate to project
cd plugins/lofi-piano/web

# Install dependencies
npm install
# or
pnpm install
```

### Development Commands

```bash
# Start development server with hot reload
npm run dev
# Server will start on http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview

# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run linter
npm run lint

# Format code
npm run format

# Type checking
npm run check
```

## 🧪 Testing the Audio System

### Browser Testing

1. **Start Dev Server**
   ```bash
   npm run dev
   ```

2. **Open Browser**
   - Navigate to `http://localhost:5173`
   - Open browser DevTools (F12)
   - Check Console for initialization messages

3. **Test Audio Functionality**

   **Expected Console Output:**
   ```
   🎹 LoFi Piano loaded
   ✓ LoFi Piano initialized
     - Audio context ready
     - Effect chain connected
     - Ready to play
   ```

4. **Interactive Testing**

   **Keyboard Interaction:**
   - Click piano keys → Should hear notes
   - Press QWERTY keys (Z-M) → Should play notes
   - Drag across keys → Should play glissando

   **Parameter Controls:**
   - Adjust Master Volume → Should change output level
   - Adjust Saturation → Should add warmth to tone
   - Adjust Compression → Should control dynamics
   - Adjust Reverb → Should add space/ambience
   - Adjust Envelope → Should change note attack/decay

   **Status Monitoring:**
   - Watch "notes playing" counter update
   - Check status indicator (green "Live" dot)
   - Toggle controls visibility

### Unit Testing

```bash
# Run all tests
npm run test

# Run specific test file
npm run test piano-voice.test.js

# Run tests with coverage
npm run test -- --coverage

# Run tests in UI mode
npm run test -- --ui
```

**Expected Test Results:**
```
✓ src/lib/audio/synthesis/piano-voice.test.js (41 tests)
  ✓ createPianoVoice (41)
    ✓ Initialization (8)
    ✓ State Getters (2)
    ✓ Note On/Off (7)
    ✓ Frequency Control (5)
    ✓ Velocity Control (4)
    ✓ Detuning Control (4)
    ✓ Envelope Control (4)
    ✓ Connection Control (4)
    ✓ Method Chaining (2)
    ✓ Audio Graph Integration (2)

Test Files: 1 passed (1)
Tests:     41 passed (41)
```

## 🔍 Debugging

### Audio Context Issues

**Problem**: "AudioContext was not allowed to start"
**Solution**: User interaction required (click anywhere)

**Problem**: No sound on iOS
**Solution**: `unlockAudioContext()` called in Layout.svelte onMount

**Problem**: Clicks/pops in audio
**Solution**: All parameter changes use `linearRampToValueAtTime()` for smoothing

### Common Issues

1. **Audio Not Playing**
   ```javascript
   // Check AudioContext state
   const ctx = getAudioContext();
   console.log('AudioContext state:', ctx.state); // Should be "running"
   ```

2. **Effect Chain Not Working**
   ```javascript
   // Check effect chain connections
   console.log(audioState.getState());
   // Should show isInitialized: true
   ```

3. **Key Presses Not Working**
   - Ensure browser window has focus
   - Check keyboard event listeners are attached
   - Check console for errors

4. **Parameters Not Updating**
   - Check Svelte $effect hooks in audio-state.svelte.js
   - Verify parameter path in setParameter() calls
   - Check audio node connections

## 🎯 Testing Checklist

### Sprint 1.2 - UI Integration

- [ ] **Audio Initialization**
  - [ ] AudioContext starts without errors
  - [ ] Effect chain connects properly
  - [ ] iOS audio unlock works on tap/click

- [ ] **Piano Keyboard**
  - [ ] Mouse clicks play notes
  - [ ] Mouse drag creates glissando
  - [ ] Touch events work on mobile
  - [ ] QWERTY keys play notes
  - [ ] Visual feedback shows active keys
  - [ ] Notes stop when released

- [ ] **Parameter Controls**
  - [ ] Master volume adjusts output level
  - [ ] Envelope controls (ADSR) shape notes
  - [ ] Saturation adds warmth
  - [ ] Compression controls dynamics
  - [ ] Reverb adds space
  - [ ] Parameter values display correctly
  - [ ] Advanced settings toggle works

- [ ] **State Management**
  - [ ] Active notes counter updates
  - [ ] Status indicator shows "Live"
  - [ ] No memory leaks (check DevTools Memory)
  - [ ] Voice cleanup after release

- [ ] **UI/UX**
  - [ ] Responsive layout (desktop/tablet/mobile)
  - [ ] Loading spinner shows during init
  - [ ] Error state displays on failure
  - [ ] Control panel toggle works
  - [ ] Info cards display tips

- [ ] **Performance**
  - [ ] No audio glitches with 10+ concurrent notes
  - [ ] Parameter changes don't cause clicks/pops
  - [ ] UI remains responsive during playback
  - [ ] Memory usage stable (no leaks)

### Browser Compatibility

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (desktop)
- [ ] Safari (iOS)
- [ ] Edge (latest)

### Mobile Testing

- [ ] Touch interaction works
- [ ] Audio unlocks on first tap
- [ ] Responsive layout adapts
- [ ] Performance acceptable
- [ ] No memory issues

## 📊 Performance Monitoring

### CPU Usage
```javascript
// Monitor audio worklet performance
const ctx = getAudioContext();
console.log('Sample rate:', ctx.sampleRate);
console.log('Current time:', ctx.currentTime);
```

### Memory Usage
1. Open DevTools → Performance
2. Start recording
3. Play notes for 30 seconds
4. Stop recording
5. Check memory graph (should be flat, not climbing)

### Audio Latency
- Expected: < 50ms on desktop
- Expected: < 100ms on mobile
- Test with metronome click timing

## 🐛 Known Issues

### Current Sprint
1. **Saturation Effect**: Uses ScriptProcessorNode (deprecated, migrate to AudioWorklet)
2. **Reverb Algorithm**: Simple multi-tap delay (consider convolution reverb)
3. **Voice Polyphony**: No hard limit (add max voice count)

### Future Enhancements
1. MIDI input device support
2. Preset save/load system
3. Recording functionality
4. Audio visualization
5. Advanced routing options

## 🔧 Development Tools

### Browser DevTools

**Console**:
- Check initialization logs
- Monitor audio state changes
- Debug parameter updates

**Network**:
- Verify asset loading
- Check bundle sizes

**Performance**:
- Profile audio processing
- Monitor memory usage
- Check frame rates

**Memory**:
- Take heap snapshots
- Compare before/after playing
- Detect memory leaks

### Vite DevTools

```bash
# Show bundle analysis
npm run build -- --report

# Check dependencies
npm list
```

## 📝 Code Style

### Formatting
```bash
# Format all files
npm run format

# Check formatting
npm run format -- --check
```

### Linting
```bash
# Run ESLint
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

### Type Checking
```bash
# Check types
npm run check

# Watch mode
npm run check -- --watch
```

## 🚀 Deployment

### Production Build
```bash
# Build for production
npm run build

# Output in build/ directory
# Optimized, minified, tree-shaken
```

### Preview Build
```bash
# Build and preview
npm run build
npm run preview

# Navigate to http://localhost:4173
```

### Static Deployment
```bash
# Build generates static files
# Deploy build/ to:
# - Netlify
# - Vercel
# - GitHub Pages
# - Any static host
```

## 📚 Additional Resources

- [Svelte 5 Runes Documentation](https://svelte.dev/docs/runes)
- [Web Audio API MDN](https://developer.mozilla.org/en-US/Web/API/Web_Audio_API)
- [Vite Documentation](https://vitejs.dev/)
- [Vitest Documentation](https://vitest.dev/)

## 🆘 Getting Help

1. Check console for errors
2. Review test output: `npm run test`
3. Check this guide's debugging section
4. Review ROADMAP.md for feature status
5. Check SENIOR_DEVELOPER_NOTES.md for architecture details

---

**Last Updated**: 2025-10-28
**Sprint**: Phase 1, Sprint 1.2 - UI Integration & Testing
