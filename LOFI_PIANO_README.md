# 🎹 LoFi Piano Plugin - Your First Production Audio Plugin

Welcome! This directory contains everything you need to build a professional nostalgic lo-fi piano synthesizer while mastering modern web audio development.

---

## 📍 Start Here

### 1. **First Time? Read This** (5 minutes)
👉 [`LOFI_PIANO_QUICK_START.md`](./docs/LOFI_PIANO_QUICK_START.md)

Quick overview of what you're building, how to get started, and basic concepts.

### 2. **Planning Phase** (30 minutes)
👉 [`LOFI_PIANO_ROADMAP.md`](./docs/LOFI_PIANO_ROADMAP.md)

Complete 12-week development plan with 6 phases and 12 sprints. See what you'll build each week.

### 3. **Deep Dive** (45 minutes)
👉 [`SENIOR_DEVELOPER_NOTES.md`](./docs/SENIOR_DEVELOPER_NOTES.md)

Strategic guidance from a senior audio engineer. Understand *why* architectural decisions matter.

### 4. **Full Project Summary** (10 minutes)
👉 [`LOFI_PIANO_PROJECT_SUMMARY.md`](./LOFI_PIANO_PROJECT_SUMMARY.md)

Overview of everything created for this project and completion checklist.

---

## 🎯 What You'll Build

A **professional-quality lo-fi piano synthesizer** featuring:

**Sound**:
- 3 detuned oscillators (warm, chorus-like effect)
- ADSR envelope (natural note shaping)
- Tape saturation (vintage warmth)
- Dynamic compression (control)
- Reverb (spatial effects)

**Interface**:
- 88-key piano keyboard (mouse, keyboard, MIDI)
- 6 parameter knobs
- Real-time spectrum visualization
- Preset system (10 built-in + user saves)

**Quality**:
- Professional audio design (no clicks/pops)
- Optimized for CPU efficiency
- Cross-browser compatible
- Fully documented code
- Production-ready

---

## 🎓 What You'll Learn

### Audio Engineering
- ✅ Web Audio API architecture
- ✅ Audio graph design and routing
- ✅ Synthesis (oscillators, envelopes)
- ✅ Audio effects (saturation, compression, reverb)
- ✅ Parameter automation (smooth, artifact-free)

### Programming
- ✅ Modular JavaScript architecture
- ✅ Factory patterns and composition
- ✅ Async/promises and scheduling
- ✅ Performance optimization

### Svelte 5
- ✅ Runes system ($state, $derived, $effect)
- ✅ Reactive UI components
- ✅ Complex state management
- ✅ Event handling and interaction

### Professional Practices
- ✅ Clean code and documentation
- ✅ Testing and optimization
- ✅ Version control and Git workflow
- ✅ Audio plugin best practices

---

## 📚 Learning Path

This project is **Phase 1-6 of your learning curriculum**:

```
Phase 1: Web Audio Fundamentals (Weeks 1-2)
├─ Build basic piano voice with 3 oscillators
├─ Implement ADSR envelope
└─ Learn audio scheduling

Phase 2: Audio Graph Design (Weeks 3-4)
├─ Create saturation effect
├─ Create compression effect
├─ Create reverb effect
└─ Wire complete effect chain

Phase 3: Svelte 5 Runes (Weeks 5-6)
├─ Build parameter control panel
├─ Create 88-key keyboard interface
├─ Add real-time visualization
└─ Master $state, $derived, $effect

Phase 4: Parameter Automation (Weeks 7-8)
├─ Smooth parameter changes (no artifacts)
├─ Implement envelope automation
└─ Optimize scheduling

Phase 5: Polish & Effects (Weeks 9-10)
├─ Fine-tune sound design
├─ Optimize CPU usage
└─ Add preset system

Phase 6: Testing & Release (Weeks 11-12)
├─ Write unit and component tests
├─ Create user documentation
├─ Optimize and measure performance
└─ Ship production-ready plugin
```

**Total**: 12 weeks to mastery, learning-by-doing with a shipped project.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Basic JavaScript knowledge
- Audio knowledge (will learn!)

### Setup (5 minutes)

```bash
# Navigate to project
cd /Users/dinz/Coding\ Projects/AudioPlug/Din-ZAudioToolLibrary

# Install dependencies
pnpm install

# Create plugin from template
pnpm create-plugin
# Follow prompts: name=lofi-piano, description=Nostalgic LoFi Piano

# Navigate to plugin
cd plugins/lofi-piano/web

# Start development
pnpm dev
# Opens http://localhost:5173
```

### Week 1 Tasks

See [`LOFI_PIANO_ROADMAP.md`](./docs/LOFI_PIANO_ROADMAP.md), Phase 1, Sprint 1.1 for detailed tasks:

1. Study `plugins/_template/web/` example
2. Create `src/audio/piano-voice.js`
3. Implement 3 detuned oscillators
4. Add ADSR envelope
5. Test in browser

**Expected outcome**: Play notes with natural envelope from simple Svelte button.

---

## 🛠️ Available Tools & Resources

### MCP Servers (Built-in Expert Documentation)

```bash
@svelte                    # Svelte 5 documentation
@quillopy[web-audio]      # Web Audio API docs
@sequential-thinking      # Complex problem-solving
@github                   # Repository management
```

**Example Usage**:
```
Ask: "@svelte explain how to use $effect with audio parameters"
Ask: "@quillopy[web-audio] how do I implement tape saturation?"
Ask: "@svelte @quillopy[web-audio] help me create a frequency knob"
```

### Claude Code Tools

- `Read` - Read files
- `Edit` - Modify code
- `Glob` / `Grep` - Search codebase
- `Task` / `Explore` - Multi-file analysis
- `TodoWrite` - Track tasks
- `Bash` - Execute commands

See [`CLAUDE.md`](./CLAUDE.md) for complete reference.

---

## 📖 Documentation Reference

| Document | Purpose | Time |
|----------|---------|------|
| [`LOFI_PIANO_QUICK_START.md`](./docs/LOFI_PIANO_QUICK_START.md) | 5-minute orientation | 5 min |
| [`LOFI_PIANO_ROADMAP.md`](./docs/LOFI_PIANO_ROADMAP.md) | 12-week plan with sprints | 30 min |
| [`SENIOR_DEVELOPER_NOTES.md`](./docs/SENIOR_DEVELOPER_NOTES.md) | Architecture & strategy | 45 min |
| [`CLAUDE.md`](./CLAUDE.md) | Project context & tools | 20 min |
| [`LEARNING_PATH.md`](./docs/LEARNING_PATH.md) | Full 6-phase curriculum | 40 min |
| [`PLUGIN_DEVELOPMENT.md`](./docs/PLUGIN_DEVELOPMENT.md) | Detailed plugin guide | 60 min |
| [`CODE_QUALITY_GUIDE.md`](./docs/CODE_QUALITY_GUIDE.md) | Code standards | 40 min |

---

## 🎵 Audio Concepts Quick Guide

### Oscillators
Generate waveforms. Three slightly detuned oscillators create a warm chorus effect.

### ADSR Envelope
Controls how a note evolves:
- **Attack**: Fade in (how quickly you hit the note)
- **Decay**: Fall to sustain (after initial attack)
- **Sustain**: Hold level while key pressed
- **Release**: Fade out after key released

### Effects Chain Order
```
Piano Voice → Saturation → Compression → Reverb → Speakers
```

Each effect processes the previous one's output.

### Parameter Scheduling
**Never** do `gainNode.gain.value = 0.5` (creates clicks).
**Always** use `gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05)` (smooth).

---

## ✅ Success Checklist

**Week 1 Completion**:
- [ ] Scaffold created with `pnpm create-plugin`
- [ ] `piano-voice.js` implemented with 3 oscillators
- [ ] ADSR envelope integrated
- [ ] Audio plays from browser without errors
- [ ] No console errors or warnings

**Week 2 Completion**:
- [ ] Effect modules created (saturation, compression, reverb)
- [ ] Effect chain wired in correct order
- [ ] All effects audible and functional
- [ ] CPU load measured and reasonable

**By Week 12 Completion**:
- [ ] All features implemented
- [ ] No clicks, pops, or artifacts
- [ ] All tests passing
- [ ] Code documented and follows standards
- [ ] Production build created
- [ ] User documentation complete

---

## 🤔 FAQ

**Q: How long will this take?**
A: 12 weeks full-time learning path, or 12-24 weeks part-time (2-5 hours/week).

**Q: Do I need music theory?**
A: No, just basic concepts (frequency = pitch, ADSR = envelope shape).

**Q: What if audio doesn't work?**
A: Check `LOFI_PIANO_QUICK_START.md` FAQ section or ask Claude with `@quillopy[web-audio] why is my oscillator not producing sound?`

**Q: Can I use this in my DAW?**
A: Not immediately (it's web-based). But the audio logic is portable to VST/AU later via JUCE or Tauri.

**Q: Is this production-ready?**
A: Yes! By week 12, it's a fully functional, documented, tested plugin.

---

## 🔗 Related Projects

Once you complete this:

- **Polyphonic Synth**: Extend to 16+ voices
- **Arpeggiator**: Add sequencer capability
- **Multi-Effect Unit**: Build 5+ effect plugins
- **VST Wrapper**: Port to JUCE for VST/AU
- **Web MIDI Controller**: Full MIDI control surface

All use the same patterns and architecture.

---

## 📊 Project Stats

| Metric | Value |
|--------|-------|
| Estimated Time | 12 weeks (full-time) |
| Learning Phases | 6 phases |
| Development Sprints | 12 sprints |
| Audio Modules | 5 modules |
| UI Components | 3 components |
| Effect Types | 5 (saturation, compression, reverb, +2 optional) |
| Lines of Documentation | 2,000+ lines |
| Code Files to Create | 15+ files |
| Tests to Write | 10+ test suites |

---

## 🚀 Ready to Build?

1. **Start here**: Read [`LOFI_PIANO_QUICK_START.md`](./docs/LOFI_PIANO_QUICK_START.md) (5 min)
2. **Then read**: [`LOFI_PIANO_ROADMAP.md`](./docs/LOFI_PIANO_ROADMAP.md) (30 min)
3. **Then start Phase 1, Sprint 1.1**: Create `piano-voice.js`

```bash
# Get started now
pnpm dev
# or navigate to plugins/lofi-piano/web and start there
```

---

## 💬 Get Help

**During Development**:
```
Ask Claude Code with MCP servers:
@svelte - for UI questions
@quillopy[web-audio] - for audio questions
@sequential-thinking - for architecture planning
```

**Common Issues**:
- Audio not working? → Check AudioContext unlock (iOS requirement)
- Clicks/pops? → Use parameter ramping, not direct assignment
- UI not updating? → Check $state, $derived, $effect usage
- CPU high? → Profile in DevTools and optimize

---

## 📝 Progress Tracking

Use this checklist to track your journey:

### Phase 1: Web Audio Fundamentals
- [ ] Week 1: Piano voice with oscillators
- [ ] Week 2: Testing and validation

### Phase 2: Audio Graph Design
- [ ] Week 3: Build effect modules
- [ ] Week 4: Wire complete effect chain

### Phase 3: Svelte 5 UI
- [ ] Week 5: Control panel and parameter binding
- [ ] Week 6: Keyboard interface and visualization

### Phase 4: Parameter Automation
- [ ] Week 7-8: Smooth automation without artifacts

### Phase 5: Polish & Effects
- [ ] Week 9-10: Sound design and optimization

### Phase 6: Testing & Release
- [ ] Week 11-12: Tests, documentation, ship!

---

## 🎓 Learning Resources

| Topic | Resource |
|-------|----------|
| Web Audio API | https://www.w3.org/TR/webaudio/ (MDN Web Docs) |
| Svelte 5 | https://svelte.dev/docs (use @svelte MCP) |
| Audio Design | https://sccode.org (SuperCollider patterns) |
| Lo-fi Sound | Search "lo-fi hip-hop" on YouTube/Spotify for reference |
| Testing | Vitest + @testing-library/svelte |

---

## 🎵 Let's Build Something Amazing

You have the roadmap, the architecture, the tools, and the guidance.

**Time to create.** 🎹✨

---

**Version**: 1.0
**Created**: 2025-10-28
**Status**: Ready for Implementation
**Next Step**: Read [`LOFI_PIANO_QUICK_START.md`](./docs/LOFI_PIANO_QUICK_START.md)
