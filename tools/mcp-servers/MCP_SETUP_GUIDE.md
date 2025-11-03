# MCP (Model Context Protocol) Servers Setup Guide

This guide explains how to set up and configure MCP servers for accessing framework documentation in Claude Code.

## What is an MCP Server?

An MCP (Model Context Protocol) server is a specialized service that extends Claude's capabilities by providing:

- Real-time access to documentation
- Framework-specific tools and utilities
- Code execution in specific languages
- Context-aware assistance

## Quick Setup

### 1. Find Claude Desktop Config

**macOS/Linux**:

```bash
~/.config/Claude/claude_desktop_config.json
```

**Windows**:

```
%APPDATA%\Claude\claude_desktop_config.json
```

### 2. Add Our MCP Servers

Add this configuration to your Claude Desktop config:

```json
{
  "mcpServers": {
    "svelte": {
      "command": "npx",
      "args": ["-y", "@sveltejs/mcp"]
    },
    "web-audio": {
      "command": "node",
      "args": ["/path/to/audio-plugin-playground/tools/mcp-servers/web-audio-mcp.js"]
    },
    "tonejs": {
      "command": "node",
      "args": ["/path/to/audio-plugin-playground/tools/mcp-servers/tonejs-mcp.js"]
    },
    "puredata": {
      "command": "node",
      "args": ["/path/to/audio-plugin-playground/tools/mcp-servers/puredata-mcp.js"]
    },
    "supercollider": {
      "command": "node",
      "args": ["/path/to/audio-plugin-playground/tools/mcp-servers/supercollider-mcp.js"]
    }
  }
}
```

### 3. Restart Claude Desktop

Close and reopen Claude Desktop to load the new configuration.

### 4. Use in Claude Code

In conversations with Claude, reference the MCP servers:

```
@svelte ask about reactive components
@web-audio explain AudioContext
@supercollider show synth design patterns
@puredata how to create feedback effects
```

## Available MCP Servers

### Phase 1: Core Frameworks (Ready)

#### Svelte MCP

- **Purpose**: Svelte UI framework documentation
- **Status**: Using official @sveltejs/mcp
- **Docs**: https://svelte.dev/docs
- **Usage**: `@svelte explain runes`

#### Web Audio MCP

- **Purpose**: Web Audio API reference and examples
- **Status**: Custom implementation in progress
- **Docs**: https://www.w3.org/TR/webaudio/
- **Usage**: `@web-audio show delay node API`

#### Tone.js MCP

- **Purpose**: High-level audio framework
- **Status**: Custom implementation in progress
- **Docs**: https://tonejs.github.io/
- **Usage**: `@tonejs explain synth object`

### Phase 2: Audio Synthesis Tools (In Development)

#### Pure Data MCP

- **Purpose**: Visual audio programming reference
- **Status**: Custom implementation in progress
- **Docs**: https://puredata.info/docs
- **Official**: http://msp.ucsd.edu/Pd_documentation/
- **Usage**: `@puredata show audio object reference`

#### SuperCollider MCP

- **Purpose**: Advanced DSP and synthesis
- **Status**: Custom implementation in progress
- **Docs**: https://docs.supercollider.online
- **Official**: https://supercollider.github.io/
- **Usage**: `@supercollider explain UGen architecture`

### Phase 3: Plugin Frameworks (Planned)

#### JUCE MCP

- **Purpose**: Cross-platform plugin development
- **Docs**: https://juce.com/learn
- **Planned**: Week 3

#### iPlug2 MCP

- **Purpose**: Simplified plugin framework
- **Docs**: https://iplug2.github.io/
- **Planned**: Week 3

## Creating Custom MCP Servers

### Basic Template

```javascript
// tools/mcp-servers/custom-framework-mcp.js

/**
 * Custom Framework MCP Server
 *
 * This MCP server provides:
 * - Documentation search
 * - API reference lookup
 * - Code examples
 * - Framework-specific helpers
 *
 * Usage in Claude Code:
 * @framework-name [query or command]
 */

import { Server, Tool, TextContent, ErrorContent } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({
  name: 'framework-name-mcp',
  version: '1.0.0',
  capabilities: {
    tools: {}
  }
});

// Tool 1: Search documentation
server.addTool({
  name: 'search_docs',
  description: 'Search framework documentation',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query'
      }
    },
    required: ['query']
  },
  handler: async (args) => {
    try {
      // Implementation: search local docs or fetch from API
      const results = await searchDocumentation(args.query);
      return new TextContent({
        type: 'text',
        text: JSON.stringify(results, null, 2)
      });
    } catch (error) {
      return new ErrorContent({
        type: 'text',
        text: `Error searching docs: ${error.message}`
      });
    }
  }
});

// Tool 2: Get API reference
server.addTool({
  name: 'api_reference',
  description: 'Get API reference for a specific function/class',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Function or class name'
      }
    },
    required: ['name']
  },
  handler: async (args) => {
    try {
      const reference = await getAPIReference(args.name);
      return new TextContent({
        type: 'text',
        text: reference
      });
    } catch (error) {
      return new ErrorContent({
        type: 'text',
        text: `Error fetching API reference: ${error.message}`
      });
    }
  }
});

// Tool 3: Code examples
server.addTool({
  name: 'code_examples',
  description: 'Get code examples for a feature',
  inputSchema: {
    type: 'object',
    properties: {
      feature: {
        type: 'string',
        description: 'Feature name or pattern'
      },
      language: {
        type: 'string',
        description: 'Programming language (optional)'
      }
    },
    required: ['feature']
  },
  handler: async (args) => {
    try {
      const examples = await getCodeExamples(args.feature, args.language);
      return new TextContent({
        type: 'text',
        text: examples
      });
    } catch (error) {
      return new ErrorContent({
        type: 'text',
        text: `Error fetching examples: ${error.message}`
      });
    }
  }
});

// Start server
server.start(process.stdin, process.stdout);
```

### Implementing Documentation Search

```javascript
/**
 * Search local documentation cache
 *
 * Features:
 * - Full-text search across all docs
 * - Semantic search with keywords
 * - Return relevant excerpts
 * - Include links to source documents
 */

import fs from 'fs-extra';
import path from 'path';

async function searchDocumentation(query) {
  // Get documentation directory
  const docsDir = path.join(process.cwd(), 'resources', 'docs', 'framework-name');

  // Read all markdown files
  const files = fs.readdirSync(docsDir).filter((f) => f.endsWith('.md'));

  const results = [];

  for (const file of files) {
    const filePath = path.join(docsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Search content
    if (content.toLowerCase().includes(query.toLowerCase())) {
      // Extract relevant section
      const lines = content.split('\n');
      const relevantLines = lines.filter((line) =>
        line.toLowerCase().includes(query.toLowerCase())
      );

      results.push({
        file,
        matches: relevantLines,
        excerpt: relevantLines.slice(0, 5).join('\n')
      });
    }
  }

  return results;
}
```

## Documentation Directory Structure

Each framework should have organized documentation:

```
resources/docs/framework-name/
├── README.md                    # Index and quick start
├── 01-introduction.md          # Overview and concepts
├── 02-getting-started.md       # Installation and setup
├── 03-core-concepts.md         # Main ideas and patterns
├── 04-api-reference.md         # Complete API documentation
├── 05-examples.md              # Code examples
├── 06-advanced.md              # Advanced usage
├── 07-troubleshooting.md       # Common issues and solutions
└── links.md                     # Links to official documentation
```

### Example: Web Audio Documentation

````markdown
# Web Audio API Reference

## Quick Links

- Official Spec: https://www.w3.org/TR/webaudio/
- MDN Guide: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- MDN Examples: https://github.com/mdn/webaudio-examples

## Core Concepts

- AudioContext: Manages all audio processing
- AudioNode: Building blocks of audio processing
- Audio Graph: How nodes connect together
- Scheduling: Timing audio events

## Common Nodes

### OscillatorNode

- Generates periodic waveforms
- Types: sine, square, sawtooth, triangle
- Main properties: frequency, type, detune

### GainNode

- Controls volume
- Main property: gain
- Use: Volume control, amplitude modulation

### BiquadFilterNode

- Digital filter
- Types: lowpass, highpass, bandpass, etc.
- Main properties: frequency, Q, gain

## Example: Simple Sine Wave

```javascript
const audioContext = new AudioContext();
const oscillator = audioContext.createOscillator();
const gainNode = audioContext.createGain();

oscillator.frequency.value = 440;
oscillator.type = 'sine';
gainNode.gain.value = 0.3;

oscillator.connect(gainNode);
gainNode.connect(audioContext.destination);

oscillator.start();
// ... later
oscillator.stop();
```
````

````

## Maintenance

### Updating Documentation

When documentation changes:

```bash
# 1. Update local docs
resources/docs/framework-name/

# 2. Clear MCP cache (if applicable)
rm -rf tools/mcp-servers/.cache

# 3. Restart Claude if needed
# (Usually automatic)
````

### Testing MCP Servers

```bash
# Test MCP server directly
node tools/mcp-servers/framework-mcp.js

# Test in Claude Code
# Use: @framework-name test search "keyword"
```

## Troubleshooting

### MCP Server Not Appearing

1. **Check Configuration**:

   ```bash
   cat ~/.config/Claude/claude_desktop_config.json
   ```

2. **Verify Paths**: Ensure full paths to JavaScript files

3. **Restart Claude**: Kill and reopen Claude Desktop

4. **Check Node.js**: Ensure Node 18+ is installed

### Documentation Not Updating

1. **Clear Cache**: `rm -rf tools/mcp-servers/.cache`
2. **Verify Files Exist**: Check `resources/docs/framework/`
3. **Check Permissions**: Ensure read access to documentation files

### MCP Server Errors

Check Claude's logs:

```bash
# macOS
tail -f ~/Library/Logs/Claude/claude.log

# Linux
~/.local/share/Claude/logs/claude.log
```

## Security Considerations

### Safe MCP Server Design

1. **Sandboxing**: MCP servers run in subprocess
2. **No Shell Access**: Use `-y` flag to prevent prompts
3. **Read-Only Docs**: Documentation servers only read files
4. **Error Handling**: Catch and report errors safely

### Best Practices

- Never execute user code directly
- Validate all inputs
- Use try-catch blocks
- Log errors for debugging
- Keep node_modules up to date

## Resources

- MCP Protocol Spec: https://spec.modelcontextprotocol.io/
- Claude Documentation: https://claude.ai/
- Node.js: https://nodejs.org/

---

For framework-specific MCP server documentation, see:

- Svelte: `docs/FRAMEWORKS_AND_TOOLS.md#svelte-mcp`
- Web Audio: `docs/FRAMEWORKS_AND_TOOLS.md#web-audio-mcp`
- SuperCollider: `docs/FRAMEWORKS_AND_TOOLS.md#supercollider-mcp`
- Pure Data: `docs/FRAMEWORKS_AND_TOOLS.md#pure-data-mcp`
