# Claude Code MCP Server Setup Guide

Complete guide to configuring Model Context Protocol (MCP) servers for Claude Code in your Audio Plugin Playground.

## Table of Contents

1. [What is MCP?](#what-is-mcp)
2. [Installation & Setup](#installation--setup)
3. [Available MCP Servers](#available-mcp-servers)
4. [Configuration](#configuration)
5. [Managing Servers](#managing-servers)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## What is MCP?

**Model Context Protocol (MCP)** is an open standard that allows Claude Code to:
- Access external tools and data sources in real-time
- Interact with APIs and services
- Read documentation and knowledge bases
- Execute commands and analyze code
- Integrate with development workflows

Think of MCP servers as "plugins for Claude Code" that extend its capabilities.

### How It Works

```
Claude Code
    ↓
MCP Router
    ↓
┌────────────────────────────────────┐
│  MCP Servers (Local & Remote)      │
├────────────────────────────────────┤
│ ✓ GitHub (code management)         │
│ ✓ Web Audio (documentation)        │
│ ✓ Node.js (API reference)          │
│ ✓ Git (version control)            │
│ ✓ Filesystem (file operations)     │
│ ✓ Bash (shell commands)            │
│ ✓ NPM Registry (package search)    │
└────────────────────────────────────┘
```

---

## Installation & Setup

### Prerequisites

- Node.js 18+ installed
- Claude Code installed (`npm install -g @anthropic-ai/claude-code`)
- Git configured on your system

### Method 1: Using Configuration File (Recommended)

The `.mcp.json` file in your project root defines all MCP servers.

**To activate:**

```bash
# The .mcp.json file is read automatically by Claude Code
# Restart Claude Code to load the configuration
claude
```

### Method 2: CLI-based Configuration

Add individual servers via command line:

```bash
# Add an HTTP-based MCP server
claude mcp add --transport http svelte https://mcp.svelte.dev

# Add a local stdio MCP server
claude mcp add --transport stdio web-audio -- node ./tools/mcp-servers/web-audio-mcp.js

# Add with environment variables
claude mcp add --transport stdio github \
  --env GITHUB_TOKEN=ghp_your_token_here \
  -- npx -y @github/github-mcp-server

# Add with authentication headers
claude mcp add --transport http api-docs https://docs.example.com/mcp \
  --header "Authorization: Bearer your-api-key"
```

### Method 3: Manual Configuration

Edit `~/.config/claude/config.json` (or `%APPDATA%\claude\config.json` on Windows):

```json
{
  "mcpServers": {
    "svelte": {
      "command": "npx",
      "args": ["-y", "@sveltejs/mcp"]
    },
    "web-audio": {
      "command": "node",
      "args": ["./tools/mcp-servers/web-audio-mcp.js"]
    }
  }
}
```

---

## Available MCP Servers

### Recommended for Audio Plugin Development

#### 1. **Svelte MCP** (UI Framework)
**Purpose**: Svelte 5 documentation, components, reactivity patterns

```bash
claude mcp add --transport http svelte https://mcp.svelte.dev
```

**Usage in Claude Code**:
```
@svelte explain how Runes work
@svelte show component lifecycle
@svelte best practices for event handling
```

**Features**:
- Official Svelte documentation
- API reference for all modules
- Best practices and patterns
- Component examples

---

#### 2. **Web Audio MCP** (Custom - Already Set Up)
**Purpose**: Web Audio API reference, audio nodes, examples, patterns

**Usage in Claude Code**:
```
@web-audio search for "delay node"
@web-audio show oscillator example
@web-audio explain audio scheduling
```

**Features**:
- All Web Audio node documentation
- Code examples for common patterns
- Audio graph best practices
- Signal flow diagrams

---

#### 3. **GitHub MCP** (Code Management)
**Purpose**: Browse repositories, manage issues, review code, analyze commits

```bash
# Set your GitHub token
export GITHUB_TOKEN=ghp_your_personal_access_token

# Add the server
claude mcp add --transport stdio github \
  --env GITHUB_TOKEN=${GITHUB_TOKEN} \
  -- npx -y @github/github-mcp-server
```

**Create GitHub PAT** (Personal Access Token):
1. Go to https://github.com/settings/tokens/new
2. Select scopes: `repo`, `read:user`, `read:org`
3. Copy the token and set as environment variable

**Usage in Claude Code**:
```
@github search for "audio plugin" in this repo
@github list open issues
@github review pull request #123
@github analyze commit history for pattern
```

**Features**:
- Repository browsing and code search
- Issue and PR management
- Commit analysis and history
- Code review capabilities

---

#### 4. **Node.js Docs MCP** (JavaScript Runtime)
**Purpose**: Node.js API documentation, module reference, best practices

```bash
claude mcp add --transport http nodejs-docs https://mcp.nodejs.org
```

**Usage in Claude Code**:
```
@nodejs search "fs module"
@nodejs show path.join usage
@nodejs explain async/await patterns
```

**Features**:
- Complete Node.js API reference
- Module documentation
- Built-in utilities reference
- Version-specific docs

---

#### 5. **Git MCP** (Version Control)
**Purpose**: Git operations, commit analysis, branch management

```bash
claude mcp add --transport stdio git -- npx -y git-mcp
```

**Usage in Claude Code**:
```
@git show recent commits
@git analyze branch differences
@git get commit message template
@git show repository status
```

**Features**:
- Git command execution
- Commit log analysis
- Branch management
- Diff viewing

---

#### 6. **Filesystem MCP** (File Operations)
**Purpose**: Safe file reading, directory browsing, file operations

```bash
claude mcp add --transport stdio filesystem -- npx -y fs-mcp
```

**Usage in Claude Code**:
```
@filesystem find all JavaScript files
@filesystem show directory structure
@filesystem read package.json
@filesystem list all documentation files
```

**Features**:
- Safe file reading/writing
- Directory traversal
- File search and filtering
- Project structure analysis

---

#### 7. **Bash MCP** (Shell Commands)
**Purpose**: Execute bash commands within project context

```bash
claude mcp add --transport stdio bash -- npx -y bash-mcp
```

**Usage in Claude Code**:
```
@bash run npm test
@bash list recently modified files
@bash show project size
@bash check git status
```

**Features**:
- Safe command execution
- Project directory scoping
- Output capture
- Error handling

---

#### 8. **NPM Registry MCP** (Package Management)
**Purpose**: Search packages, check versions, find vulnerabilities

```bash
claude mcp add --transport http npm-registry https://mcp.npmjs.org
```

**Usage in Claude Code**:
```
@npm-registry search "audio plugin"
@npm-registry check latest version of svelte
@npm-registry check vulnerabilities in dependencies
@npm-registry show package documentation
```

**Features**:
- NPM package search
- Version information
- Vulnerability scanning
- Documentation links

---

### Advanced Servers (Optional)

#### Code Analysis MCP
**Purpose**: Static analysis, refactoring suggestions, code review

```bash
claude mcp add --transport http code-analysis https://mcp.codeanalysis.ai
```

**When to use**: Large refactoring tasks, comprehensive code reviews

---

#### ESLint MCP
**Purpose**: Linting rules, configuration, style guide reference

```bash
claude mcp add --transport stdio eslint -- npx -y eslint-mcp
```

**When to use**: Understanding linting rules, fixing style violations

---

#### Prettier MCP
**Purpose**: Code formatting rules and configuration

```bash
claude mcp add --transport stdio prettier -- npx -y prettier-mcp
```

**When to use**: Code formatting questions, style consistency

---

## Configuration

### Using `.mcp.json` (Project-Level)

The `.mcp.json` file in your project root configures MCP servers for this project only.

```json
{
  "mcpServers": {
    "svelte": {
      "command": "npx",
      "args": ["-y", "@sveltejs/mcp"],
      "description": "Svelte documentation",
      "enabled": true
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@github/github-mcp-server"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      },
      "enabled": true
    }
  },
  "environment": {
    "PROJECT_ROOT": "${PWD}",
    "NODE_ENV": "development"
  },
  "settings": {
    "maxOutputTokens": 15000,
    "timeout": 30000,
    "retryAttempts": 3
  }
}
```

### Configuration Scopes

**Local** (default, project-specific):
```bash
# ~/.config/claude/mcp.json (user's project)
# Settings: Private, per-project
```

**Project** (shared via .mcp.json):
```bash
# Your project's .mcp.json
# Settings: Shared with team via git
```

**User** (all projects):
```bash
# ~/.config/claude/config.json
# Settings: Available across all projects
```

**Precedence**: Local → Project → User

---

## Managing Servers

### List Active Servers

```bash
claude mcp list
```

Output:
```
✓ svelte         (npx @sveltejs/mcp)
✓ web-audio      (node ./tools/mcp-servers/web-audio-mcp.js)
✓ github         (npx @github/github-mcp-server)
✓ nodejs-docs    (http endpoint)
✓ git            (npx git-mcp)
```

### Check Server Details

```bash
claude mcp get github
```

### Disable a Server

```bash
# Set "enabled": false in .mcp.json, or:
claude mcp remove github
```

### Re-enable a Server

Edit `.mcp.json` and set `"enabled": true`, or add via CLI:

```bash
claude mcp add --transport stdio github -- npx -y @github/github-mcp-server
```

### Test MCP Server

```bash
# Start Claude Code
claude

# In the session, use:
/mcp status

# Shows which servers are connected and healthy
```

---

## Using MCP Servers in Claude Code

### Basic Syntax

```
@server-name [query or command]
```

**Examples**:
```
@svelte explain the $state rune
@web-audio show how to create a low-pass filter
@github find all open issues in this repository
@nodejs search "fs.readFile" API
@npm-registry check for vulnerabilities
```

### Multi-Server Queries

You can reference multiple servers in one prompt:

```
@svelte @web-audio help me create an audio control component

This should:
1. Use Svelte 5 reactivity (@svelte)
2. Control Web Audio parameters (@web-audio)
3. Show code examples from both frameworks
```

### Server Context in Prompts

Servers automatically provide context. For example:

```
@github analyze the recent commits and suggest improvements to code quality
```

This uses:
- GitHub server to fetch recent commits
- Code analysis to evaluate quality
- Claude's reasoning to suggest improvements

---

## Environment Variables

### Common Environment Variables

**GitHub**:
```bash
export GITHUB_TOKEN=ghp_your_personal_access_token
```

**Node.js**:
```bash
export NODE_ENV=development
```

**Project Root**:
```bash
export PROJECT_ROOT=/path/to/audio-plugin-playground
```

### In .mcp.json

Use environment variable expansion:

```json
{
  "mcpServers": {
    "github": {
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  },
  "environment": {
    "PROJECT_ROOT": "${PWD}",
    "NODE_ENV": "${NODE_ENV:-development}"
  }
}
```

**Syntax**:
- `${VAR}` - Use variable or fail if not set
- `${VAR:-default}` - Use variable or use default

---

## Output Limits

Claude Code shows a warning if MCP output exceeds 10,000 tokens.

### Adjust Limit

```bash
export MAX_MCP_OUTPUT_TOKENS=20000
claude
```

Or in `.mcp.json`:

```json
{
  "settings": {
    "maxOutputTokens": 20000
  }
}
```

---

## Troubleshooting

### Server Not Connecting

**Check server status**:
```bash
claude mcp list
```

**Enable debug logging**:
```bash
export MCP_DEBUG=true
claude
```

**Verify command exists**:
```bash
# Test if the server command can be found
npx -y @sveltejs/mcp --help
```

### "Command not found" Error

The server executable doesn't exist or isn't in PATH.

**Solutions**:
```bash
# Use absolute path
"command": "/usr/local/bin/npx"

# Use npx with -y to always use latest
"args": ["-y", "@sveltejs/mcp"]

# Check if installed globally
npm list -g @sveltejs/mcp
```

### Authentication Errors

**GitHub token invalid**:
```bash
# Generate new PAT at https://github.com/settings/tokens/new
# Ensure scope includes: repo, read:user

# Test token
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
```

**Token not found in environment**:
```bash
# Set token in shell profile
echo 'export GITHUB_TOKEN=ghp_xxx' >> ~/.bashrc
source ~/.bashrc

# Or set when starting Claude Code
GITHUB_TOKEN=ghp_xxx claude
```

### Timeout Issues

**Increase timeout**:
```json
{
  "settings": {
    "timeout": 60000
  }
}
```

**Check network connectivity**:
```bash
# For remote servers
curl https://mcp.svelte.dev/health

# For local servers
curl localhost:3000/health
```

### Server Crashes

**View error logs**:
```bash
export MCP_DEBUG=true
claude 2>&1 | grep -i error
```

**Try restarting**:
```bash
# Kill any hanging processes
pkill -f mcp

# Restart Claude Code
claude
```

---

## Best Practices

### 1. Start with Essentials

**Recommended order of setup**:
1. Svelte MCP (UI development)
2. Web Audio MCP (audio processing)
3. GitHub MCP (code management)
4. Node.js Docs (JavaScript reference)
5. Git MCP (version control)

### 2. Use Server Descriptions

Always include descriptions in `.mcp.json`:

```json
{
  "svelte": {
    "command": "npx",
    "args": ["-y", "@sveltejs/mcp"],
    "description": "Svelte 5 UI framework with reactive Runes",
    "enabled": true
  }
}
```

This helps you remember what each server does.

### 3. Environment Variables

Keep sensitive data in environment:

```bash
# Don't hardcode in .mcp.json:
"GITHUB_TOKEN": "ghp_xxx"

# Instead:
"GITHUB_TOKEN": "${GITHUB_TOKEN}"

# And set in shell:
export GITHUB_TOKEN=ghp_xxx
```

### 4. Scope Limitations

Understand server scopes:

| Server | Scope | Limitation |
|--------|-------|-----------|
| Svelte | Global docs | Works anywhere |
| Web Audio | Global API | Works anywhere |
| GitHub | Repository | Needs git context |
| Git | Repository | Needs git context |
| Filesystem | Project dir | Can't access outside |
| Bash | Project dir | Sandboxed to project |

### 5. Combine Servers Effectively

**Example: Full-stack analysis**:
```
@github @svelte @web-audio
Help me refactor the component that controls audio parameters.
Show me recent commits related to it and suggest improvements.
```

This combines:
- GitHub server (find relevant code/history)
- Svelte server (show best practices)
- Web Audio server (ensure audio patterns are correct)

### 6. Use for Routine Tasks

MCP servers excel at:
- ✓ Real-time API documentation
- ✓ Code search and analysis
- ✓ Version checking
- ✓ Documentation lookup
- ✓ Git history analysis
- ✓ Vulnerability scanning

Not ideal for:
- ✗ Subjective design decisions
- ✗ Creative problem solving
- ✗ Architecture design (use reasoning instead)

### 7. Cache Documentation Locally

For frequently-used frameworks:

```bash
# Download Svelte docs locally
git clone https://github.com/sveltejs/svelte ~/docs/svelte

# Point MCP to local copy
"command": "http-server",
"args": ["~/docs/svelte", "-p", "8000"]
```

This provides faster access with no network latency.

---

## Quick Reference

### Common MCP Commands

```bash
# List all servers
claude mcp list

# Get specific server info
claude mcp get svelte

# Remove a server
claude mcp remove github

# Check server status
claude /mcp status

# Start Claude Code
claude

# Enable debug logging
MCP_DEBUG=true claude

# Set GitHub token temporarily
GITHUB_TOKEN=ghp_xxx claude
```

### Common MCP Queries

```
# Framework docs
@svelte show reactive component example
@nodejs search "path" module

# Code management
@github show recent commits
@git list all branches

# Development tools
@npm-registry check version of "@sveltejs/vite-plugin-svelte"
@bash run npm test

# Analysis
@code-analysis suggest improvements for this component
@github review pull request
```

---

## Resources

### Official Documentation
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Claude Code Docs](https://docs.claude.com/en/docs/claude-code/mcp)
- [MCP Servers Repository](https://github.com/modelcontextprotocol/servers)

### Popular MCP Servers
- [GitHub MCP](https://github.com/github/github-mcp-server)
- [Microsoft MCP Servers](https://github.com/microsoft/mcp)
- [Awesome MCP Servers](https://github.com/wong2/awesome-mcp-servers)

### Tutorials
- [Building MCP Servers in Node.js](https://modelcontextprotocol.io/tutorials)
- [How to Build an MCP Server Fast](https://medium.com/@eugenesh4work/how-to-build-an-mcp-server-fast)

---

## Next Steps

1. **Set up core servers** (Svelte, Web Audio, GitHub)
2. **Configure authentication** (GitHub token)
3. **Test in Claude Code** (use @server-name queries)
4. **Explore advanced servers** (code analysis, linting)
5. **Create routine prompts** (see CLAUDE_CODE_ROUTINE_PROMPTS.md)

---

**Happy coding with MCP servers!** 🚀

