# CLAUDE.md - Project Context for Claude Code

This file provides essential context for Claude Code instances working on the Audio Plugin Playground project.

## 🎯 Project Overview

**Din-ZAudioToolLibrary** is a professional monorepo for building audio plugins using web technologies (Svelte, Web Audio API) with progression paths to native plugins (VST, AU via JUCE, iPlug2, or Tauri desktop).

**Key Principle**: Shared resources (audio DSP, UI components) are used by independent plugin projects. No circular dependencies.

## 🏗️ Project Architecture

### Directory Structure

```
/
├── plugins/                    # Individual plugin projects
│   ├── _template/web/         # Template for new plugins
│   └── [plugin-name]/web/     # Actual plugin projects
├── shared/                     # Reusable libraries
│   ├── audio-core/            # Web Audio DSP utilities
│   │   ├── synthesis/         # Oscillators, envelopes
│   │   ├── filters/           # Low-pass, high-pass, etc.
│   │   ├── effects/           # Delay, reverb, etc.
│   │   └── utils/             # AudioContext, scheduling
│   └── ui-components/         # Svelte 5 reusable components
│       └── controls/          # Knob, Slider, Button
├── docs/                       # Complete documentation
│   ├── GETTING_STARTED.md
│   ├── ARCHITECTURE.md
│   ├── PLUGIN_DEVELOPMENT.md
│   ├── LEARNING_PATH.md
│   ├── CODE_QUALITY_GUIDE.md
│   ├── FRAMEWORKS_AND_TOOLS.md
│   └── research/
├── tools/
│   ├── mcp-servers/           # MCP server configurations
│   │   ├── .mcp.json
│   │   ├── CLAUDE_CODE_MCP_SETUP.md
│   │   └── web-audio-mcp.js
│   └── prompts/
│       └── CLAUDE_CODE_ROUTINE_PROMPTS.md
├── .mcp.json                  # Project MCP configuration
├── CLAUDE_CODE_QUICK_START.md # 5-minute Claude Code setup
└── pnpm-workspace.yaml        # PNPM workspace definition
```

### Key Monorepo Concepts

1. **PNPM Workspaces**: Efficient dependency management with symlinks
2. **Turborepo**: Parallel task execution with smart caching
3. **Shared Dependencies**: Located in `shared/` (audio-core, ui-components)
4. **Plugin Independence**: Each plugin in `plugins/` is independently deployable
5. **Import Aliases**:
   - `@audio` → `shared/audio-core`
   - `@ui` → `shared/ui-components`
   - `@shared` → `shared`

## ⚡ Essential Commands

### Development

```bash
# Install dependencies (run once)
pnpm install

# Start all plugins in dev mode (hot reload)
pnpm dev

# Build all plugins for production
pnpm build

# Run linting across all packages
npx eslint "**/*.{js,svelte}"

# Format code with Prettier
npx prettier --write "**/*.{js,svelte,css,md}"

# Create a new plugin from template
pnpm create-plugin
# Prompts for: plugin name, description, author
# Creates: plugins/[name]/web with all boilerplate
```

### Individual Plugin Development

```bash
# Navigate to a plugin
cd plugins/[plugin-name]/web

# Start dev server for that plugin only
pnpm dev

# Build that plugin only
pnpm build

# Preview built plugin
pnpm preview
```

### Claude Code & MCP

```bash
# View all configured MCP servers
claude mcp list

# Check which servers are connected
/mcp status

# Start Claude Code in this project
claude

# View MCP setup guide
cat CLAUDE_CODE_QUICK_START.md
```

## 🎵 Audio Architecture

### Audio Graph Pattern

All audio plugins follow this core pattern:

```
Source (Oscillator/Input)
  ↓
Processing (Filters/Effects)
  ↓
Output (Destination)
```

Example from `plugins/_template/web/src/App.svelte`:

```javascript
import { createOscillator } from '@audio/synthesis/oscillators';
import { createADSREnvelope } from '@audio/synthesis/envelopes';

const oscillator = createOscillator('sine', 440);
const envelope = createADSREnvelope({ attack: 0.1, decay: 0.2, sustain: 0.5, release: 1 });

oscillator.connect(envelope);
envelope.connect(audioContext.destination);
```

### Key Audio Modules

| Module | Location | Purpose |
|--------|----------|---------|
| Oscillators | `shared/audio-core/synthesis/oscillators.js` | Generate waveforms (sine, square, sawtooth, triangle, custom) |
| Envelopes | `shared/audio-core/synthesis/envelopes.js` | ADSR/AR envelope generators for volume shaping |
| Filters | `shared/audio-core/synthesis/filters.js` | Frequency filtering (low-pass, high-pass, band-pass, peaking, shelf) |
| Delay | `shared/audio-core/effects/delay.js` | Delay and ping-pong delay effects |
| Context | `shared/audio-core/utils/audio-context.js` | Singleton AudioContext with iOS unlock support |

### Important Audio Patterns

**Browser AudioContext Unlock** (required for iOS):
```javascript
import { unlockAudioContext } from '@audio/utils/audio-context';

// In onMount hook
onMount(() => {
  unlockAudioContext();
});
```

**Parameter Scheduling** (smooth changes):
```javascript
// For smooth parameter changes over time
gainNode.gain.linearRampToValueAtTime(targetValue, audioContext.currentTime + 1);

// NOT this (it clicks/pops):
gainNode.gain.value = targetValue; // Direct changes cause artifacts
```

**AudioWorklets** (expensive computations):
- Use AudioWorklet for DSP-heavy operations
- Offloads from main thread
- Reference: `docs/PLUGIN_DEVELOPMENT.md` → Advanced section

## 🎨 UI Architecture

### Svelte 5 Runes (Reactive System)

The project uses Svelte 5's new Runes system instead of reactive declarations:

```svelte
<script>
  // State
  let frequency = $state(440);

  // Derived state (auto-updates when frequency changes)
  let noteDisplay = $derived(frequencyToNote(frequency));

  // Effects (run when dependencies change)
  $effect(() => {
    oscillator.setFrequency(frequency);
  });
</script>

<Knob bind:value={frequency} min={20} max={20000} />
<p>{noteDisplay}</p>
```

### Reusable UI Components

| Component | Location | Props |
|-----------|----------|-------|
| Knob | `shared/ui-components/controls/Knob.svelte` | value, min, max, step, label, disabled |
| Slider | `shared/ui-components/controls/Slider.svelte` | value, min, max, step, label, vertical |
| Button | `shared/ui-components/controls/Button.svelte` | label, variant, disabled, onclick |

**Example Usage**:
```svelte
<script>
  import Knob from '@ui/controls/Knob.svelte';
  let frequency = $state(440);
</script>

<Knob bind:value={frequency} min={20} max={20000} label="Frequency" />
```

## 📚 Code Quality Standards

### File Headers
Every file should start with:
```javascript
/**
 * [Module Name]
 * [Brief description of what this module does]
 *
 * @module [module-path]
 */
```

### Function Documentation
Use JSDoc comments:
```javascript
/**
 * Creates a low-pass filter with variable cutoff frequency
 *
 * @param {number} frequency - Cutoff frequency in Hz
 * @param {number} q - Quality factor (resonance), 0.1-20
 * @returns {BiquadFilterNode} Configured filter node
 */
function createLowPassFilter(frequency, q) {
  // implementation
}
```

### Naming Conventions
- **camelCase**: Functions, variables, properties
- **PascalCase**: Classes, Svelte components
- **UPPER_SNAKE_CASE**: Constants
- **prefix$** for Svelte Runes: `$state`, `$effect`, `$derived`

### Code Style
- **Linter**: ESLint (configured in `.eslintrc.json`)
- **Formatter**: Prettier (configured in `.prettierrc.json`)
- **Indentation**: 2 spaces
- **Quotes**: Single quotes
- **Line Length**: 100 characters
- **Variables**: Use `const` by default, `let` only when reassignment needed, never `var`

Run before committing:
```bash
npx prettier --write "**/*.{js,svelte,css,md}"
npx eslint "**/*.{js,svelte}" --fix
```

## 🔗 Framework Integration

The project integrates learnings from multiple audio frameworks:

| Framework | Purpose | Documentation |
|-----------|---------|---|
| **Pure Data** | Visual programming for audio | http://msp.ucsd.edu/software.html, https://puredata.info |
| **SuperCollider** | High-level audio synthesis language | https://docs.supercollider.online, https://sccode.org |
| **Web Audio** | Browser native audio API | https://www.w3.org/TR/webaudio/, MDN |
| **Tone.js** | High-level Web Audio library | https://tonejs.github.io/ |
| **JUCE** | Cross-platform plugin framework | https://juce.com/learn/tutorials |
| **iPlug2** | Embedded plugin framework | https://iplug2.github.io/ |
| **Svelte** | UI framework (Svelte 5) | https://svelte.dev/docs |

**Cross-Framework Learning**: See `docs/FRAMEWORKS_AND_TOOLS.md` for comparison matrices and translation patterns between Pure Data, SuperCollider, and Web Audio.

## 🛠️ Claude Code MCP Servers & Tools

This project is pre-configured with multiple MCP servers and Claude Code tools for enhanced capabilities.

### Complete Toolkit Reference

#### Built-in Claude Code Tools

| Tool | Purpose | When to Use |
|------|---------|------------|
| **Read** | Read file contents efficiently | Reading any file (code, docs, config); handles large files with offset/limit |
| **Write** | Create files from scratch | Creating new files only when necessary; ALWAYS prefer Edit over Write |
| **Edit** | Precise string replacements in files | Modifying existing files; preserves formatting and indentation |
| **Glob** | Fast file pattern matching | Finding files by name/extension patterns (e.g., `src/**/*.svelte`) |
| **Grep** | Search file contents by regex | Searching for keywords, functions, patterns across multiple files |
| **Bash** | Execute shell commands | Git operations, npm/pnpm commands, terminal tasks; not for file operations |
| **Task** | Launch specialized agents | Complex multi-file exploration, research tasks, code analysis |
| **TodoWrite** | Track and manage tasks | Plan work, mark progress, organize steps; essential for multi-step tasks |
| **WebFetch** | Fetch and analyze web content | Retrieving documentation, analyzing web pages (auto-converts HTML to markdown) |
| **WebSearch** | Search the web | Finding up-to-date information beyond knowledge cutoff |
| **ExitPlanMode** | Exit planning mode | Mark end of planning phase when ready to implement code |
| **AskUserQuestion** | Ask clarification questions | Gather user preferences, resolve ambiguities during execution |

#### MCP Servers (Active Configuration in .mcp.json)

| Server | Type | Status | When to Use |
|--------|------|--------|------------|
| **svelte** | HTTP Remote | ✅ Enabled | Creating UI components, Svelte 5 Runes, reactivity, component patterns |
| **github** | Node Command | ✅ Enabled | Repository management, PR creation, issue queries, code search |
| **sequential-thinking** | Node Command | ✅ Enabled | Complex problem-solving, multi-step reasoning, planning algorithms |
| **quillopy** | Node Command | ✅ Enabled | Fetch documentation for libraries (Tone.js, Web Audio, etc.); @quillopy [library] syntax |
| **playwright** | Node Command | ✅ Enabled | Browser automation, testing UI components, visual regression testing |
| **mcp-compass** | Node Command | ✅ Enabled | Discover and recommend MCP servers for new tasks |
| **nodejs-docs** | Node Command | ❌ Disabled | Node.js API reference; not available on npm (swap for alternate if needed) |

#### MCP Server Usage Patterns

**Single Server Query**:
```bash
@svelte explain how to use $state in Svelte 5
@quillopy[tone.js] how do I create a synth?
```

**Multi-Server Query** (combines expertise):
```bash
@svelte @quillopy[web-audio] help me create an audio frequency knob
```

**GitHub Operations**:
```bash
# Search repositories
@github search repositories for "audio plugin"

# Create/manage issues and PRs
@github create a pull request
```

**Problem-Solving**:
```bash
@sequential-thinking explain the audio graph for a ping-pong delay
```

**Discovery**:
```bash
@mcp-compass recommend MCP server for Web MIDI integration
```

#### Recommended Tool Workflows

**Finding Code**:
1. Use `Glob` for fast file pattern matching (e.g., find all `.svelte` files)
2. Use `Grep` for content search with regex
3. Use `Task` with `subagent_type=Explore` for complex multi-file investigation

**Reading Files**:
- Use `Read` tool (handles large files, can specify offset/limit)
- Never use `cat`, `head`, `tail` via Bash for file reading

**Modifying Code**:
- Use `Edit` tool for precise replacements (preserves indentation)
- Use `Write` only for creating new files (avoid unless necessary)
- Never use `sed`, `awk`, or shell redirection for file edits

**Executing Commands**:
- Use `Bash` for git, npm/pnpm, docker, terminal operations
- Quote paths with spaces: `cd "/path with spaces/file.txt"`
- Chain dependent commands with `&&` in a single Bash call
- Run independent commands in parallel with separate Bash calls

**External Information**:
- Use `@svelte` for Svelte 5 documentation
- Use `@quillopy[package-name]` for up-to-date library docs
- Use `WebFetch` to analyze specific web pages
- Use `WebSearch` for current information beyond knowledge cutoff

### Choosing the Right Tool for Your Task

#### Scenario: Understanding Codebase Structure
```
✓ Use: Task tool with subagent_type="Explore" (medium/very thorough)
Why: Explores multiple files, patterns, and relationships efficiently
❌ Don't use: Grep/Glob directly (misses context)
```

#### Scenario: Finding a Specific Function/Class
```
✓ Use: Glob tool to find file by name pattern
✓ Use: Grep tool with specific pattern
Why: Fast, targeted search for known items
```

#### Scenario: Reading a File's Full Contents
```
✓ Use: Read tool (handles large files with offset/limit)
Why: Efficient file reading with proper formatting
❌ Don't use: Bash cat command
```

#### Scenario: Modifying Existing Code
```
✓ Use: Edit tool (precise string replacements)
Why: Preserves formatting, indentation, context
❌ Don't use: Bash sed/awk
```

#### Scenario: Creating New File
```
✓ Use: Write tool (only if absolutely necessary)
⚠️ Prefer: Edit existing file instead
Why: Avoid creating unnecessary files
```

#### Scenario: Svelte Component Question
```
✓ Use: @svelte MCP server
Example: "@svelte explain how to use bind: in Svelte 5"
Why: Always up-to-date official docs, Runes syntax
```

#### Scenario: Audio Algorithm Implementation
```
✓ Use: @web-audio MCP server + code
Example: "@web-audio show how to implement a resonant low-pass filter"
Why: Official Web Audio API patterns, scheduling best practices
```

#### Scenario: UI + Audio Combined
```
✓ Use: @svelte @web-audio (multi-server)
Example: "@svelte @web-audio help me create a frequency knob component"
Why: Combines UI knowledge with audio integration patterns
```

#### Scenario: Complex Multi-File Exploration
```
✓ Use: Task tool with subagent_type="Explore"
Example: Where are errors from the client handled?
Why: Explores relationships across multiple files
```

#### Scenario: Git Analysis / Commit History
```
✓ Use: git MCP server OR Bash git commands
Why: Both available; use whichever feels natural
```

#### Scenario: Package Dependency Question
```
✓ Use: npm-registry MCP server
Example: "What are the latest versions of Tone.js?"
Why: Real-time registry data
```

#### Scenario: Planning Complex Tasks
```
✓ Use: TodoWrite tool
Example: Add todos for: Setup, Design, Implement, Test, Deploy
Why: Tracks progress, prevents task loss
```

### MCP Server Usage Examples

```bash
# Single server query
@web-audio show how to create a low-pass filter
@svelte explain Runes reactivity
@nodejs-docs what is process.env?

# Multi-server query (combines expertise)
@svelte @web-audio help me create an audio control component

# With specific questions
@web-audio how do I avoid clicks/pops when changing gain?
@svelte what's the difference between $state and $derived?

# Enable GitHub server (optional - requires GITHUB_TOKEN)
export GITHUB_TOKEN=your_personal_access_token
claude
# Then: @github create a pull request
```

### Decision Tree: Choosing Your Tool

```
Do you need to find/search something?
├─ Yes: Use Grep (search content) or Glob (find files)
│   └─ Complex multi-file exploration? → Use Task(Explore agent)
└─ No: Continue below

Do you need to read a file?
├─ Yes: Use Read tool
└─ No: Continue below

Do you need to modify code?
├─ Yes: Use Edit tool
├─ Need external documentation? → Use @mcp-server
└─ No: Continue below

Do you need to execute commands?
├─ Yes: Use Bash tool (git, npm, pnpm, etc.)
└─ No: Continue below

Do you need reference/documentation?
├─ Yes: Use appropriate @mcp-server
│   ├─ Svelte code? → @svelte
│   ├─ Web Audio? → @web-audio
│   ├─ Node.js? → @nodejs-docs
│   └─ NPM package? → @npm-registry
└─ No: Continue below

Do you have multiple independent tasks?
└─ Yes: Use TodoWrite to track progress
```

**Quick Setup**: See `CLAUDE_CODE_QUICK_START.md` for full MCP and GitHub token setup.

## 📖 Where to Find Information

### For Different Tasks

| Task | Documentation |
|------|---|
| **First time setup** | `docs/GETTING_STARTED.md` |
| **Understand project structure** | `docs/ARCHITECTURE.md` |
| **Build your first plugin** | `docs/PLUGIN_DEVELOPMENT.md` |
| **Learn audio concepts** | `docs/LEARNING_PATH.md` (6-phase curriculum) |
| **Follow best practices** | `docs/CODE_QUALITY_GUIDE.md` |
| **Find framework info** | `docs/FRAMEWORKS_AND_TOOLS.md` |
| **Use Claude Code with MCP** | `CLAUDE_CODE_QUICK_START.md` |
| **Quick command cheat sheet** | `QUICK_REFERENCE.md` |
| **Reusable Claude prompts** | `tools/prompts/CLAUDE_CODE_ROUTINE_PROMPTS.md` |

### For Specific Modules

- **Audio Core**: See `shared/audio-core/` README or respective module headers
- **UI Components**: See `shared/ui-components/` README
- **Plugin Template**: Check `plugins/_template/web/` for example implementation
- **MCP Servers**: See `tools/mcp-servers/CLAUDE_CODE_MCP_SETUP.md`

## 🚀 Common Development Workflows

### Starting New Work

```bash
# 1. Check status
git status

# 2. Create branch for your work
git checkout -b feature/your-feature-name

# 3. Start development
pnpm dev

# 4. Make changes, test locally

# 5. Format and lint before committing
npx prettier --write "**/*.{js,svelte,css,md}"
npx eslint "**/*.{js,svelte}" --fix

# 6. Commit with clear message
git add .
git commit -m "feat: description of your change"

# 7. Build to verify production build works
pnpm build
```

### Creating a New Plugin

```bash
# Generate from template
pnpm create-plugin

# Follow prompts:
# - Plugin name (lowercase, no spaces)
# - Description
# - Author name

# Navigate and start developing
cd plugins/my-new-plugin/web
pnpm dev

# Reference the template at plugins/_template/web/src/App.svelte
# Import from shared modules:
# import { createOscillator } from '@audio/synthesis/oscillators';
# import Knob from '@ui/controls/Knob.svelte';
```

### Debugging Audio Issues

```
1. Check browser console (F12 → Console tab)
2. Use web-audio-visualizer if available
3. Check AudioContext state: audioContext.state
4. Verify node connections with browser DevTools
5. See docs/PLUGIN_DEVELOPMENT.md → Common Issues section
```

### Using Claude Code for Development Tasks

```
# Code review
I need a code quality review for src/App.svelte
[Paste Prompt 1 from tools/prompts/CLAUDE_CODE_ROUTINE_PROMPTS.md]

# Audio algorithm help
Help me implement a resonant filter effect
[Use Prompt 5: Audio Algorithm Implementation]

# Cross-framework comparison
Compare delay implementation across Pure Data and Web Audio
[Use Prompt 7: Cross-Framework Comparison]

# Performance optimization
Optimize this audio plugin for CPU efficiency
[Use Prompt 12 or 13: Performance Optimization]
```

## ✅ Checklist for Starting Work

- [ ] Run `pnpm install` (dependencies)
- [ ] Run `pnpm build` (verify everything compiles)
- [ ] Check `.mcp.json` is in root (MCP configuration)
- [ ] Run `pnpm dev` and verify hot reload works
- [ ] Read the section above relevant to your task
- [ ] Check existing code in `plugins/_template/` for patterns
- [ ] Run linter/formatter before committing

## 🎓 Learning Resources

**Structured Path**: Follow `docs/LEARNING_PATH.md` (6 phases, 8+ weeks)

**Key Topics**:
1. Web Audio fundamentals (AudioContext, nodes, connections)
2. Svelte 5 Runes (reactive programming)
3. Audio graph design (source → processing → output)
4. Parameter scheduling (avoiding clicks/pops)
5. UI/UX for audio (Knob, Slider, real-time feedback)
6. AudioWorklets (advanced: off-main-thread processing)
7. Cross-framework learning (Pd ↔ SC ↔ WA patterns)

## 🔑 Key Architectural Decisions

1. **Monorepo over monolith**: Each plugin is independent, shared code is reusable
2. **Web Audio API directly**: Lower-level control, closer to native plugins, easier learning
3. **Svelte 5 for UI**: Smallest bundle size, powerful reactivity, audio-friendly
4. **MCP servers**: Always have up-to-date documentation without network lag
5. **Routine prompts**: Standardized approaches to common tasks via Claude Code
6. **No circular dependencies**: `plugins/` depend on `shared/`, never vice versa

## 📝 Git Commit Convention

```
feat: add new feature
fix: fix a bug
docs: documentation changes
refactor: code restructuring
test: add or update tests
chore: maintenance, dependencies

Example: "feat: add resonant low-pass filter to audio-core"
```

## 🆘 Troubleshooting

**Build fails**: Run `pnpm install` and `pnpm build` individually to isolate the issue

**Dev server doesn't start**: Check that port 5173 is available, or specify different port

**Audio not working in browser**: Check AudioContext is unlocked (iOS requires user interaction), check node connections

**MCP server issues**: Run `claude mcp list` to check status, see `CLAUDE_CODE_MCP_SETUP.md` troubleshooting section

**Linting errors**: Run `npx eslint "**/*.{js,svelte}" --fix` to auto-fix most issues

---

**Last updated**: 2025-10-28
**Project**: Din-ZAudioToolLibrary (Audio Plugin Playground)
**Purpose**: Reference guide for Claude Code instances
