# LoFi Piano - Changelog

All notable changes to the LoFi Piano plugin project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased] - 2025-10-31

### 🔧 Fixed

#### **Critical Audio Engine Bugs** (`d3aa3ff`)

**Problem**: Piano keyboard had severe audio playback issues:
- Notes wouldn't stop playing when keys were released (stuck notes)
- Feedback loops occurred when rapidly pressing the same key
- Voice accumulation causing audio runaway

**Root Causes Identified**:
1. **Oscillator Restart Bug** (`piano-voice.js:150-160`)
   - Web Audio oscillators cannot be restarted after `stop()`
   - `noteOn()` method attempted to call `noteOff()` and restart oscillators
   - This is fundamentally impossible in Web Audio API

2. **Voice Map Collision** (`audio-state.svelte.js:224`)
   - When same note replayed rapidly, old voice was overwritten in Map
   - Lost reference to old voice = cannot stop it = feedback loop
   - Old voice continues playing indefinitely

3. **Delayed Cleanup Race Condition** (`audio-state.svelte.js:249-252`)
   - Cleanup scheduled after release time using `setTimeout()`
   - If note replayed before cleanup, duplicate voices accumulate
   - No mechanism to clean up orphaned voices

**Solutions Implemented**:
- **piano-voice.js**: Prevent `noteOn()` from being called twice on same voice instance
  - Added guard clause with console warning
  - Document that new voice instances must be created for retriggering
  - Oscillators are now properly one-time-use

- **audio-state.svelte.js `playNote()`**: Check for existing voice and clean up first
  - Added check: `if (pianoVoices.has(validNote))`
  - Stop and disconnect old voice before creating new one
  - Prevents voice accumulation and feedback loops

- **audio-state.svelte.js `stopNote()`**: Immediate cleanup instead of delayed
  - Disconnect voice immediately after `noteOff()`
  - Remove from Map right away
  - Web Audio engine handles release envelope naturally
  - Eliminates race conditions

**Impact**:
- ✅ Notes stop properly when keys released
- ✅ No feedback loops when rapidly retriggering notes
- ✅ No voice accumulation or memory leaks
- ✅ Polyphonic playback works correctly

---

### ✨ Added

#### **Unified Single-Screen UI** (`2dd7ad2`)

**Previous Design**: Tab-based navigation with separate Piano and Chord Generator views

**New Design**: Unified vertical layout on a single scrollable page

**Changes**:
- **Removed**: Tab navigation system completely
- **Piano Section**: Always visible at top
  - Control panel with all effect parameters
  - 88-key interactive piano keyboard
  - Visualizers (spectrum analyzer, VU meter)

- **Chord Generator Section**: Collapsible panel at bottom
  - Toggle button with animated arrow icon
  - Smooth slide-down animation when expanded
  - Space-efficient when collapsed
  - Preserves all chord generation features

**UI Improvements**:
- Cleaner, more streamlined interface
- Better visual hierarchy (primary piano, secondary chords)
- No context switching required
- Professional studio-style layout
- Improved responsive design for mobile devices
- Accessibility improvements (ARIA attributes, reduced motion support)

**CSS Updates**:
- Removed 40+ lines of tab navigation styles
- Added collapsible section styles with animations
- New `slideDown` keyframe animation
- Toggle button with hover states and icon rotation
- Responsive adjustments for mobile (hide hints on small screens)

**Impact**:
- ✅ Everything accessible on one screen
- ✅ Reduced cognitive load (no tab hunting)
- ✅ Better UX for workflow-focused use
- ✅ Mobile-friendly collapsible design

---

#### **VST/AU Translation Strategy Guide** (`06a83f0`)

**Document**: `docs/projects/lofi-piano/VST_AU_TRANSLATION_GUIDE.md`

**Purpose**: Comprehensive 843-line guide for translating the web-based LoFi Piano plugin into native VST/AU format

**Content**:
- **Three Translation Approaches Evaluated**:
  1. **Pure JUCE** (100+ hours): Complete C++ rewrite, industry standard
  2. **iPlug2 Hybrid** (60-80 hours): Embedded Svelte UI + C++ audio engine (RECOMMENDED)
  3. **Tauri Desktop** (20-30 hours): Standalone desktop app (not true VST/AU)

- **Technical Mapping Tables**:
  - Web Audio API → JUCE DSP complete mapping
  - Svelte 5 Components → JUCE GUI translation patterns
  - Parameter mapping with scaling (linear, exponential)
  - Effect chain architecture diagrams

- **Complete Code Examples**:
  - JUCE piano voice implementation (C++)
  - iPlug2 web view integration
  - Svelte UI adaptation for IPC communication
  - Build configurations for VST3/AU/AAX

- **Implementation Timeline**: 8-10 week part-time plan with weekly milestones

**Recommended Approach**: **iPlug2 Hybrid**
- Keeps 80% of existing Svelte UI code
- Native C++ audio performance
- 60-80 hour development time
- Full VST3/AU compatibility
- Modern web development workflow

**Impact**:
- ✅ Clear path to native plugin format
- ✅ Resource estimates for planning
- ✅ Technical reference for developers
- ✅ Code reuse maximized

---

### 📊 Testing

#### E2E Test Coverage
- **Total Tests**: 260 tests across 5 browsers
- **Coverage**: Accessibility, Audio Functionality, Plugin Initialization, UI Controls
- **Critical Tests for Bug Fixes**:
  - ✅ "Should handle rapid note on/off without crashing"
  - ✅ "Should verify note release stops audio playback"
  - ✅ "Should play multiple notes in polyphonic mode"
  - ✅ "Should verify responsive audio UI on different viewports"

#### Build Status
- ✅ Production build passes successfully
- ✅ No TypeScript errors
- ✅ Bundle size within acceptable limits
- ✅ All imports resolved correctly

---

### 🔍 Technical Details

#### Files Modified
- `plugins/lofi-piano/web/src/lib/audio/synthesis/piano-voice.js`
- `plugins/lofi-piano/web/src/lib/stores/audio-state.svelte.js`
- `plugins/lofi-piano/web/src/lib/components/Layout.svelte`

#### Files Added
- `docs/projects/lofi-piano/VST_AU_TRANSLATION_GUIDE.md`
- `docs/projects/lofi-piano/CHANGELOG.md` (this file)

#### Lines Changed
- **Audio Bug Fixes**: +31 lines, -8 lines
- **UI Redesign**: +132 lines, -94 lines
- **Documentation**: +843 lines

---

### 🚀 Deployment Notes

#### Before Deploying
1. Build succeeds: `pnpm build` ✅
2. Audio functionality verified manually
3. Responsive design tested on Desktop/Tablet/Mobile viewports

#### Known Issues
- E2E tests show warnings due to debug `console.warn()` statements in audio fixes
- These warnings are intentional for development debugging
- Can be removed or changed to debug-only logs for production

#### Recommendations for Next Steps
1. **Production**: Remove or conditionally disable `console.warn()` in `piano-voice.js`
2. **VST/AU Translation**: Begin prototype with iPlug2 hybrid approach
3. **Performance**: Profile audio DSP for CPU optimization opportunities
4. **Features**: Add MIDI CC mapping for DAW automation

---

### 📝 Commit History

```bash
2dd7ad2 feat: redesign UI to unified single-screen layout with collapsible chord generator
d3aa3ff fix: resolve critical piano keyboard audio bugs (feedback loops, stuck notes)
06a83f0 docs: add comprehensive VST/AU translation strategy guide for LoFi Piano
```

---

**Contributors**: Claude Code
**Date**: October 31, 2025
**Project**: Din-ZAudioToolLibrary / LoFi Piano Plugin
