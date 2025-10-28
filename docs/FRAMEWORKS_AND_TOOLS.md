# Audio Plugin Playground - Frameworks & Tools Integration Guide

This document outlines the frameworks and tools integrated into the Audio Plugin Playground ecosystem, with links to official documentation and integration strategies.

## Table of Contents

1. [Web Audio Frameworks](#web-audio-frameworks)
2. [UI Frameworks](#ui-frameworks)
3. [Audio Synthesis Tools](#audio-synthesis-tools)
4. [MCP Server Strategy](#mcp-server-strategy)
5. [Framework Comparison](#framework-comparison)
6. [Integration Patterns](#integration-patterns)

---

## Web Audio Frameworks

### 1. Web Audio API (Native)

**Purpose**: Browser-native audio processing and synthesis

**Documentation**:
- Official Spec: https://www.w3.org/TR/webaudio/
- MDN Reference: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- MDN Examples: https://github.com/mdn/webaudio-examples

**Key Features**:
- Real-time audio processing
- Audio synthesis and generation
- Audio analysis and visualization
- Low-latency audio I/O
- Sample-accurate scheduling

**Use in Playground**: Foundation for all plugin DSP

**Official Docs Location**: `resources/docs/web-audio-api/`

---

### 2. Tone.js

**Purpose**: Simplify Web Audio API for music applications

**Documentation**:
- Official Docs: https://tonejs.github.io/
- GitHub: https://github.com/Tonejs/Tone.js
- API Reference: https://tonejs.github.io/api/

**Key Features**:
- High-level music API
- Built-in synthesizers and effects
- Scheduling and transport
- MIDI input support
- Synth and sampler presets

**Use in Playground**: Optional high-level abstraction layer

**Official Docs Location**: `resources/docs/tonejs/`

---

### 3. Elementary Audio

**Purpose**: JavaScript-based plugin development with Web Audio

**Documentation**:
- Official Docs: https://www.elementary.audio/docs
- GitHub: https://github.com/elementary-audio/elementary
- RNBO Integration: https://rnbo.cycling74.com/

**Key Features**:
- Functional programming model
- Real-time DSP compilation
- Web Audio Module (WAM) support
- Plugin export capabilities
- Visual patching tools

**Use in Playground**: Future native plugin export target

**Official Docs Location**: `resources/docs/elementary-audio/`

---

## UI Frameworks

### 1. Svelte 5

**Purpose**: Lightweight, compiler-based UI framework

**Documentation**:
- Official Docs: https://svelte.dev/docs/svelte/overview
- Tutorial: https://svelte.dev/tutorial/svelte/welcome-to-svelte
- SvelteKit: https://kit.svelte.dev/
- API Reference: https://svelte.dev/docs/svelte
- Blog: https://svelte.dev/blog

**Key Features**:
- Compiler-based (no virtual DOM)
- Reactive Runes ($state, $effect, $props)
- Built-in animations and transitions
- Scoped styling (CSS)
- SvelteKit for full-stack applications

**Why Svelte in Playground**:
- Minimal bundle size
- Excellent performance
- Intuitive reactivity model
- Perfect for audio plugin UIs
- Great developer experience

**Official Docs Location**: `resources/docs/svelte/`

**Current Integration**:
- UI components in `/shared/ui-components/`
- All plugins use Svelte 5
- Template includes example components

---

### 2. HTML/CSS/JavaScript (Native)

**Purpose**: Pure web standards for maximum compatibility

**Documentation**:
- MDN Web Docs: https://developer.mozilla.org/en-US/
- HTML Spec: https://html.spec.whatwg.org/
- CSS Spec: https://www.w3.org/Style/CSS/
- JavaScript: https://tc39.es/

**Key Features**:
- No framework dependencies
- Universal compatibility
- Direct DOM access
- Custom elements (Web Components)
- Canvas/WebGL for graphics

**Use in Playground**: Fallback for minimal builds

**Official Docs Location**: `resources/docs/mdn-web-docs/`

---

## Audio Synthesis Tools

### 1. Pure Data (Pd)

**Purpose**: Visual programming for audio and multimedia

**Documentation**:
- Official Site: http://msp.ucsd.edu/software.html
- Community Hub: https://puredata.info
- Manual: http://msp.ucsd.edu/Pd_documentation/index.htm
- Mailing List: https://lists.puredata.info/listinfo
- GitHub: https://github.com/pure-data/pure-data

**Key Features**:
- Visual patch-based programming
- Real-time audio processing
- MIDI control
- Extensible via externals
- Cross-platform support (Linux, macOS, Windows)

**Why Include in Playground**:
- Learn audio DSP concepts visually
- Reference implementations for algorithms
- Integration with Web Audio via libpd
- Educational value for understanding signal flow

**Use Cases**:
- Prototype audio algorithms before Web Audio implementation
- Reference patches for complex DSP
- Teaching audio concepts
- Integration via libpd-js (browser version)

**Official Docs Location**: `resources/docs/pure-data/`

**Integration Strategy**:
- Link to Pure Data patches as educational reference
- Document equivalent Web Audio implementations
- Use libpd-js for browser-based Pd synthesis
- Create learning path: Pd → Web Audio

---

### 2. SuperCollider

**Purpose**: Programming language and server for real-time audio synthesis

**Documentation**:
- Official Docs: https://docs.supercollider.online
- GitHub: https://github.com/supercollider/supercollider
- SuperCollider Book: https://mitpress.mit.edu/9780262232697/
- Code Examples: https://sccode.org/
- Forum: https://scsynth.org

**Architecture**:
- **scsynth** - Real-time audio synthesis server
- **sclang** - Interpreted programming language (client)
- **scide** - Integrated editor with help system

**Key Features**:
- Powerful DSP capabilities
- Object-oriented programming model
- Real-time scheduling
- Node-based synthesis graph
- Extensive built-in UGens (Unit Generators)

**Why Include in Playground**:
- Learn advanced DSP concepts
- Reference implementations for complex algorithms
- Inspire plugin designs
- Educational value for synthesis techniques

**Use Cases**:
- Study SuperCollider code patterns
- Reference advanced DSP implementations
- Learn synthesis theory
- Cross-language learning (SC code → JavaScript)

**Official Docs Location**: `resources/docs/supercollider/`

**Integration Strategy**:
- Link to SuperCollider documentation and examples
- Document how to translate SC algorithms to Web Audio
- Create learning path: SuperCollider → Web Audio
- Store example SC patches in `resources/examples/supercollider/`

**Language Support**:
- Primary: sclang (Lisp-like syntax)
- Client support: Python, JavaScript, Haskell, Scala
- Potential JavaScript client integration

---

### 3. JUCE Framework

**Purpose**: Cross-platform audio plugin development

**Documentation**:
- Official Docs: https://juce.com/learn/tutorials
- GitHub: https://github.com/juce-framework/JUCE
- API Reference: https://docs.juce.com/
- Forum: https://forum.juce.com

**Key Features**:
- Plugin formats: VST3, AU, AAX, CLAP
- Cross-platform C++ framework
- Built-in GUI toolkit
- MIDI support
- Audio I/O abstraction

**Why Include in Playground**:
- Native plugin development target
- Professional plugin distribution
- Learn C++ audio programming
- Advanced DSP patterns

**Use Cases**:
- Convert Web Audio plugins to native VST/AU
- Learn professional plugin architecture
- Reference C++ implementations

**Official Docs Location**: `resources/docs/juce/`

**Future Integration Plan**:
- Phase 2: JUCE plugin export
- Web Audio → JUCE code generation
- Professional distribution path

---

### 4. iPlug2 Framework

**Purpose**: Simple cross-platform audio plugin framework

**Documentation**:
- Official Docs: https://iplug2.github.io/docs/
- GitHub: https://github.com/iPlug2/iPlug2
- Examples: https://github.com/iPlug2/iPlug2/tree/master/Examples

**Key Features**:
- Simplified plugin development
- Cross-platform support
- Web Assembly (WASM) export
- Built-in graphics
- Template-based code generation

**Why Include in Playground**:
- Accessible plugin development
- WASM support for Web Audio integration
- Educational framework
- Faster native plugin creation

**Use Cases**:
- Learn plugin architecture
- Bridge Web Audio to native
- Template generation for new plugins

**Official Docs Location**: `resources/docs/iPlug2/`

---

## MCP Server Strategy

### Overview

Model Context Protocol (MCP) servers provide Claude Code with real-time access to framework documentation and tools. This section outlines our MCP strategy.

### What are MCP Servers?

MCP (Model Context Protocol) servers are specialized services that:
- Provide documentation access in real-time
- Execute code in specific language environments
- Interact with tools and frameworks
- Pass context to AI assistants through Claude Code

### Our MCP Architecture

```
Claude Code
    ↓
MCP Router
    ↓
┌───────────────────────────────────────┐
│  Framework MCP Servers                │
├───────────────────────────────────────┤
│ ✓ svelte-mcp         (Svelte docs)   │
│ ✓ web-audio-mcp      (Web Audio API) │
│ ✓ puredata-mcp       (Pure Data)     │
│ ✓ supercollider-mcp  (SuperCollider) │
│ ✓ tonejs-mcp         (Tone.js)       │
│ ✓ juce-mcp           (JUCE)          │
│ ✓ iplug2-mcp         (iPlug2)        │
│ ✓ nodejs-mcp         (Node.js)       │
│ ✓ javascript-mcp     (JavaScript)    │
└───────────────────────────────────────┘
```

### MCP Server Setup Plan

#### Phase 1: Core Documentation Servers (Week 1)

**1. Svelte Documentation MCP**
```json
{
  "mcpServers": {
    "svelte": {
      "command": "npx",
      "args": ["-y", "@sveltejs/mcp"]
    }
  }
}
```

**2. Web Audio API Documentation MCP**
```json
{
  "mcpServers": {
    "web-audio": {
      "command": "node",
      "args": ["tools/mcp-servers/web-audio-mcp.js"]
    }
  }
}
```

**3. Tone.js Documentation MCP**
```json
{
  "mcpServers": {
    "tonejs": {
      "command": "node",
      "args": ["tools/mcp-servers/tonejs-mcp.js"]
    }
  }
}
```

#### Phase 2: Audio Synthesis Servers (Week 2)

**4. Pure Data Documentation MCP**
```json
{
  "mcpServers": {
    "puredata": {
      "command": "node",
      "args": ["tools/mcp-servers/puredata-mcp.js"]
    }
  }
}
```

**5. SuperCollider Documentation MCP**
```json
{
  "mcpServers": {
    "supercollider": {
      "command": "node",
      "args": ["tools/mcp-servers/supercollider-mcp.js"]
    }
  }
}
```

#### Phase 3: Plugin Framework Servers (Week 3)

**6. JUCE Documentation MCP**
**7. iPlug2 Documentation MCP**
**8. Node.js/JavaScript MCP**

### MCP Server Implementation

Each MCP server follows this pattern:

```javascript
// tools/mcp-servers/framework-mcp.js
import {
  StdioClientTransport,
  StdioServerTransport,
  Server,
  Tool,
  TextContent,
  ErrorContent
} from "@modelcontextprotocol/sdk/server/index.js";

// Create server instance
const server = new Server({
  name: "framework-name-mcp",
  version: "1.0.0",
  capabilities: {
    tools: {}
  }
});

// Tool 1: Search documentation
server.setRequestHandler(Tool, async (request) => {
  // Implementation
});

// Tool 2: Get API reference
server.setRequestHandler(Tool, async (request) => {
  // Implementation
});

// Tool 3: Code examples
server.setRequestHandler(Tool, async (request) => {
  // Implementation
});
```

### Configuration File

**Location**: `tools/mcp-servers/mcp-config.json`

```json
{
  "version": "1.0.0",
  "mcpServers": {
    "svelte": {
      "enabled": true,
      "command": "npx",
      "args": ["-y", "@sveltejs/mcp"]
    },
    "web-audio": {
      "enabled": true,
      "command": "node",
      "args": ["./web-audio-mcp.js"]
    },
    "tonejs": {
      "enabled": true,
      "command": "node",
      "args": ["./tonejs-mcp.js"]
    },
    "puredata": {
      "enabled": true,
      "command": "node",
      "args": ["./puredata-mcp.js"]
    },
    "supercollider": {
      "enabled": true,
      "command": "node",
      "args": ["./supercollider-mcp.js"]
    }
  },
  "documentationServers": {
    "puredata": {
      "baseUrl": "https://puredata.info/docs",
      "localPath": "../resources/docs/pure-data"
    },
    "supercollider": {
      "baseUrl": "https://docs.supercollider.online",
      "localPath": "../resources/docs/supercollider"
    },
    "svelte": {
      "baseUrl": "https://svelte.dev/docs",
      "localPath": "../resources/docs/svelte"
    }
  }
}
```

### Setup Instructions

**For Claude Desktop Configuration**:

1. Locate config: `~/.config/Claude/claude_desktop_config.json`
2. Add MCP servers
3. Restart Claude
4. Access with: "Use [framework-name] MCP server"

**In Claude Code**:

```
@svelte-docs search for reactive components
@web-audio-docs get delay node API reference
@supercollider-docs fetch synth design patterns
```

---

## Framework Comparison

### Web Audio API vs Tone.js vs Elementary

| Feature | Web Audio API | Tone.js | Elementary |
|---------|---------------|---------|-----------|
| **Learning Curve** | Steep | Medium | Medium |
| **Abstraction Level** | Low | High | Very High |
| **Plugin Export** | No | No | Yes (WAM) |
| **Performance** | Excellent | Good | Excellent |
| **Scheduling** | Manual | Built-in | Built-in |
| **MIDI Support** | No | Yes | Yes |
| **Best For** | Learning, Control | Music Apps | Production Plugins |

### Pure Data vs SuperCollider vs Web Audio

| Aspect | Pure Data | SuperCollider | Web Audio |
|--------|-----------|---------------|-----------|
| **Interface** | Visual Patches | Text-based | Programmatic |
| **Learning** | Visual/Intuitive | Steep Curve | Moderate |
| **DSP Power** | Strong | Very Strong | Strong |
| **Deployment** | Desktop/Browser | Desktop/Server | Browser |
| **Community** | Large | Dedicated | Massive |
| **Best For** | Teaching, Live | Research, Advanced | Web Apps |

---

## Integration Patterns

### Pattern 1: Learn in Pd, Implement in Web Audio

```
Pure Data Patch
        ↓
Analyze Signal Flow
        ↓
Document Parameters
        ↓
Implement Web Audio Version
        ↓
Create Plugin
```

**Example**:
```
// 1. Study Pd patch: resonant-filter.pd
// 2. Identify: Delay, feedback, filter cutoff
// 3. Implement in Web Audio:

import { createDelayEffect } from '@audio/effects/delay.js';
import { createLowPassFilter } from '@audio/synthesis/filters.js';

const delay = createDelayEffect(0.5, 0.7);
const filter = createLowPassFilter(2000, 10);
// Connect: OSC → Filter → Delay → Speaker
```

### Pattern 2: Learn in SuperCollider, Port to Web Audio

```
SuperCollider Code
        ↓
Analyze UGen Graph
        ↓
Document Audio Flow
        ↓
Find Web Audio Equivalents
        ↓
Implement & Test
```

**Example**:
```supercollider
// SuperCollider:
(
  SynthDef(\resonant, {
    var sig = Saw.ar(440);
    sig = RLPF.ar(sig, 2000, 0.5);
    Out.ar(0, sig * 0.1)
  }).add;
)
```

Becomes:
```javascript
// Web Audio:
import { createOscillator } from '@audio/synthesis/oscillators.js';
import { createLowPassFilter } from '@audio/synthesis/filters.js';
import { getAudioContext } from '@audio/utils/audio-context.js';

const ctx = getAudioContext();
const osc = createOscillator('sawtooth', 440);
const filter = createLowPassFilter(2000, 0.5);

osc.connect(filter.filter);
filter.connect(ctx.destination);
osc.start();
```

### Pattern 3: Reference Both Implementations

**File Structure**:
```
resources/examples/
├── web-audio/
│   └── resonant-filter.js
├── supercollider/
│   └── resonant-filter.scd
└── puredata/
    └── resonant-filter.pd
```

**Documentation**:
```markdown
# Resonant Filter Pattern

## Pure Data Implementation
See: `resources/examples/puredata/resonant-filter.pd`

## SuperCollider Implementation
See: `resources/examples/supercollider/resonant-filter.scd`

## Web Audio Implementation
See: `resources/examples/web-audio/resonant-filter.js`

## Comparison
All three implementations use:
- Delay feedback for resonance
- Filter to shape tone
- Parameter automation
```

---

## Documentation Directory Structure

```
resources/docs/
├── web-audio-api/
│   ├── README.md               (Index & navigation)
│   ├── 01-basics.md
│   ├── 02-nodes.md
│   ├── 03-scheduling.md
│   ├── api-reference.md
│   └── examples/
├── svelte/
│   ├── README.md
│   ├── 01-runes.md
│   ├── 02-reactivity.md
│   ├── 03-components.md
│   └── api-reference.md
├── pure-data/
│   ├── README.md
│   ├── 01-basics.md
│   ├── 02-audio-objects.md
│   ├── 03-patching.md
│   └── external-objects.md
├── supercollider/
│   ├── README.md
│   ├── 01-language.md
│   ├── 02-server.md
│   ├── 03-ugens.md
│   └── synth-design.md
├── tonejs/
│   ├── README.md
│   ├── api-reference.md
│   └── examples/
├── juce/
│   ├── README.md
│   ├── architecture.md
│   └── plugin-formats.md
├── iplug2/
│   ├── README.md
│   └── plugin-development.md
└── mdn-web-docs/
    ├── html.md
    ├── css.md
    ├── javascript.md
    └── web-apis.md
```

---

## Best Practices for Multi-Framework Learning

### 1. Cross-Framework Notation

When studying multiple frameworks, use consistent notation:

```markdown
## Signal Flow Diagram

```
FRAMEWORK: Web Audio
┌─────────┐   ┌──────┐   ┌────────┐
│ OSC     │──▶│ Env  │──▶│ Filter │──▶ Speaker
└─────────┘   └──────┘   └────────┘
   440Hz      ADSR         2kHz
```

### 2. Algorithm Documentation

Document the algorithm once, show multiple implementations:

```markdown
## Resonant Feedback Algorithm

### Theory
1. Generate audio signal
2. Delay signal by X ms
3. Mix delayed signal back with original (feedback)
4. Apply low-pass filter to dampen high frequencies
5. Loop: Steps 3-4 create resonance

### Pure Data
[See example.pd]

### SuperCollider
[See example.scd]

### Web Audio
[See example.js]
```

### 3. Code Comments Template

Every implementation should follow this structure:

```javascript
/**
 * Resonant Feedback Filter
 *
 * Theory:
 * - Delay feedback creates resonant peaks at specific frequencies
 * - Low-pass filter dampens the feedback to prevent instability
 * - Adjusting delay time and feedback level controls resonance
 *
 * Cross-reference:
 * - Pure Data: resources/examples/puredata/resonant-filter.pd
 * - SuperCollider: resources/examples/supercollider/resonant-filter.scd
 * - Web Audio: THIS FILE
 *
 * Parameters:
 * @param {number} delayTime - Delay in seconds (0.001-5)
 * @param {number} feedback - Feedback amount (0-0.8)
 * @param {number} filterFreq - Filter cutoff (20-20000 Hz)
 *
 * @returns {Object} Effect instance with control methods
 */

export function createResonantFilter(delayTime = 0.5, feedback = 0.3, filterFreq = 2000) {
  // Implementation...
}
```

---

## Next Steps

1. **Week 1**: Set up documentation directory structure
2. **Week 2**: Implement Phase 1 MCP servers
3. **Week 3**: Create cross-framework learning examples
4. **Week 4**: Implement Phase 2 MCP servers
5. **Ongoing**: Build comparative documentation

---

## References

### Official Documentation
- Web Audio API: https://www.w3.org/TR/webaudio/
- Svelte: https://svelte.dev/docs
- Pure Data: http://msp.ucsd.edu/Pd_documentation/
- SuperCollider: https://docs.supercollider.online
- Tone.js: https://tonejs.github.io/
- JUCE: https://juce.com/learn
- iPlug2: https://iplug2.github.io/

### Community Resources
- Puredata.info: https://puredata.info
- SuperCollider Forum: https://scsynth.org
- SuperCollider Code: https://sccode.org/
- Svelte Society: https://sveltesociety.dev
- Web Audio Community: Web Audio API Slack

### Learning Resources
- The SuperCollider Book (MIT Press)
- Web Audio API V2 (Boris Smus)
- Pure Data tutorials on puredata.info
- Svelte tutorial on svelte.dev

