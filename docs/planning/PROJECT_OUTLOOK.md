# Project Outlook: Future Plugins & Improvements (AudioPlug Suite)

**Generated**: 2025-10-30  🕒 15:15 CET  
**Maintainer**: Cascade AI Assistant  

---

## 🎹 Future Plugin Ideas (2025-2026)

| Plugin | Description | Key Features | Complexity | ETA |
|--------|-------------|--------------|------------|-----|
| **LoFi Rhodes** | Warm electric piano emulation | Detuned sine/FM synthesis, mechanical noise layer, variable tape wow, stereo tremolo | Medium | Q1 2026 |
| **LoFi Drums** | Vintage drum machine (SP-12) | 12-bit sample engine, swing quantize, vinyl crackle bus, saturation | High | Q2 2026 |
| **LoFi Strings** | Mellotron-style string pad | Tape sample playback, flutter, gentle saturation, ADSR | Medium | Q2 2026 |
| **Ambient Pad** | Evolving pad generator | Granular engine, shimmer reverb, motion LFOs, chord memory | High | Q3 2026 |
| **Tape Echo** | Dub-style tape delay | Wow & flutter, saturation, self-oscillation, dual head, ducking | Medium | Q1 2026 |
| **Vinyl Crackle** | Surface noise & artifacts | RPM change, dust pops, side-chain gating, EQ tilt | Low | Q1 2026 |
| **LoFi Sampler** | Drag-&-drop sample mangler | Time-stretch, pitch drift, slice mode, loop points, saturation | High | Q3 2026 |
| **Chill Beat Maker** | Pattern sequencer + humanize | Drum patterns, basslines, chord progression helpers, groove pool | Very High | Q4 2026 |

---

## 🚀 Improvements for Current LoFi Piano Plugin

### Audio Engine
- **AGE (Analog Gear Emulation) effect** – implement tube/tape saturation chain with perceptual controls *(Phase 6)*
- **Resonant Low-Pass Filter** – interactive cutoff knob, visible in SpectrumAnalyzer
- **Dynamic Velocity Curves** – multiple response curves (linear, exponential, logarithmic)
- **Preset System** – JSON-based, import/export, load at runtime
- **MIDI CC Mapping** – learn mode, save mappings per preset
- **Polyphony Management** – voice stealing algorithm for >64 notes

### UX & Visualization
- **Preset Browser Panel** – searchable list with tags (warm, bright, mellow)
- **Performance Overlay** – CPU & polyphony meter
- **Dark Mode** – toggle, tokens already support
- **Accessibility Audit** – aria-live regions for visualizers, screen-reader hints
- **Keyboard Shortcuts** – customisable hotkeys for tab switching

### Educational Content
- **Inline Tooltips** – mini-explanations for visualizers (FFT, ADSR, dB)
- **Guided Tutorial Mode** – overlays guiding first-time users
- **Documentation Examples** – interactive code snippets using StackBlitz embed

### Testing & DevOps
- **Playwright Visual Regression** – screenshot diff for visualizers
- **Vitest Coverage Threshold** – enforce ≥95% critical paths
- **Performance Benchmarks** – CI profiles worst-case polyphony <16 ms frame
- **Netlify Preview Deploy** – automatic preview URLs for PRs

### Architecture & Code Quality
- **Design Tokens v2** – token categories: motion, elevation, z-index
- **Type-Safe Audio Graph** – `.d.ts` for node types & param names
- **Storybook Integration** – visual regression & component docs
- **Monorepo Split** – `packages/web-plugin`, `packages/shared-audio`, `packages/docs`
- **ESLint Plugin** – custom rule for numbers-free UI

---

## 🗂️ Documentation Refactor Plan

| Action | Files Affected | Target Location |
|--------|---------------|-----------------|
| **General Guides** | `CLAUDE*.md`, `*QUICK_REFERENCE.md`, `Svelte*`, `FRAMEWORK*` | `docs/general/` |
| **Project-Specific** | All `LOFI_PIANO_*`, phase summaries, roadmaps | `docs/projects/lofi-piano/` |
| **Architecture** | `ARCHITECTURE.md`, `AUDIO_UI_LEARNING_PATH.md` | `docs/architecture/` |
| **Learning Paths** | `LEARNING_PATH.md`, `AUDIO_UI_LEARNING_PATH.md` | `docs/learning/` |
| **Testing** | `TESTING*`, `SPRINT-COMPLETION-REPORT.md` | `docs/testing/` |
| **Guides** | `MUSIC-THEORY-GUIDE.md`, `WEB_AUDIO_API_GUIDE.md` | `docs/guides/` |

**Steps**:
1. Create new directories (`general`, `architecture`, `learning`, `testing`, `guides`).
2. Move files via `git mv` (preserve history).
3. Update links in all Markdown docs (`grep -rl 'docs/' | xargs sed -i '' ...`).
4. Update `DOCUMENTATION_INDEX.md` with new paths.
5. Add GitHub Wiki link to master index.

---

## 🌐 Roadmap Snapshot (2025-2026)

```
Q4 2025  AGE effect ➞ Phase 6
Q1 2026  LoFi Rhodes · Tape Echo · Vinyl Crackle
Q2 2026  LoFi Drums · LoFi Strings
Q3 2026  Ambient Pad · LoFi Sampler
Q4 2026  Chill Beat Maker · Cross-plugin preset sharing
```

---

## 📣 Call for Contributors
- **DSP Enthusiasts** – Help design new analog-modelled effects
- **UI/UX Designers** – Improve vintage aesthetic and responsive layouts
- **Technical Writers** – Assist in documentation refactor
- **QA Engineers** – Build automated visual regression tests

Join the discussion in `DISCUSSIONS.md` or open a GitHub issue!  
Happy hacking! 🎶
