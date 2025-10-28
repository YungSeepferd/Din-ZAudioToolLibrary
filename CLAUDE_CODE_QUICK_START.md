# Claude Code MCP & Prompts Quick Start Guide

Get started with Claude Code, MCP servers, and routine prompts in 5 minutes.

## Installation

```bash
# Install Claude Code globally
npm install -g @anthropic-ai/claude-code

# Verify installation
claude --version

# Start Claude Code in your project
cd /path/to/audio-plugin-playground
claude
```

## MCP Server Setup (2 minutes)

### Step 1: View Available Servers

```bash
claude mcp list
```

### Step 2: Configure Essential Servers

The `.mcp.json` file in this project is pre-configured. To activate:

```bash
# The configuration is already set up!
# Just restart Claude Code:
claude
```

### Step 3: Test MCP Connection

In Claude Code, run:

```
/mcp status
```

You should see:
```
✓ svelte         Connected
✓ web-audio      Connected
✓ github         (requires GITHUB_TOKEN)
✓ nodejs-docs    Connected
✓ git            Connected
✓ filesystem     Connected
✓ bash           Connected
✓ npm-registry   Connected
```

## Using MCP Servers

### Simple Usage

```
@server-name [your query]

Examples:
@svelte explain the $state rune
@web-audio show delay node API
@github list open issues
@npm-registry check svelte version
```

### With GitHub (requires setup)

```bash
# Generate GitHub token at: https://github.com/settings/tokens/new
# Scopes: repo, read:user

# Set environment variable
export GITHUB_TOKEN=ghp_your_token_here

# Start Claude Code with token
claude

# Now use GitHub server
@github show recent commits in this repo
@github find issues related to audio
```

### Multi-Server Queries

```
@svelte @web-audio
Help me create an audio parameter control component using Svelte and Web Audio

This will:
1. Use @svelte for UI best practices
2. Use @web-audio for audio parameter documentation
3. Show code examples from both frameworks
```

## Using Routine Prompts

See: `tools/prompts/CLAUDE_CODE_ROUTINE_PROMPTS.md`

### Quick Examples

**Code Quality Review**:
```
I need a code quality review for src/App.svelte.

[Paste in Prompt 1 from CLAUDE_CODE_ROUTINE_PROMPTS.md]
```

**Implement an Audio Algorithm**:
```
I want to implement a resonant filter effect.

[Paste in Prompt 5 from CLAUDE_CODE_ROUTINE_PROMPTS.md]
```

**Learn a Concept**:
```
Help me learn SuperCollider UGens. I have JavaScript knowledge.

[Paste in Prompt 16 from CLAUDE_CODE_ROUTINE_PROMPTS.md]
```

## Common Workflows

### 1. Building a New Audio Effect

```
# Step 1: Understand it
@supercollider @puredata "Help me learn [EFFECT_NAME]"
[Use Prompt 16: Learn a New Concept]

# Step 2: Compare implementations
"Compare [EFFECT] across Pd, SC, and Web Audio"
[Use Prompt 7: Cross-Framework Comparison]

# Step 3: Implement it
"Help me implement [EFFECT] in Web Audio"
[Use Prompt 5: Audio Algorithm Implementation]

# Step 4: Create tests
"Create tests for the [EFFECT] module"
[Use Prompt 6: Audio Testing Setup]

# Step 5: Document it
"Generate API documentation for [EFFECT]"
[Use Prompt 8: API Documentation]

# Step 6: Code review
"Review my [EFFECT] implementation"
[Use Prompt 4: Code Review]
```

### 2. Code Quality Improvement

```
# Audit code quality
"Review this component for quality"
[Use Prompt 1: Code Quality Audit]

# Fix issues
"Refactor this code to improve..."
[Use Prompt 14: Code Refactoring]

# Extract components
"Extract reusable components from..."
[Use Prompt 15: Component Extraction]

# Review again
"Review the refactored code"
[Use Prompt 4: Code Review]
```

### 3. Learning & Research

```
# Compare options
@npm-registry "Compare A vs B for C"
[Use Prompt 17: Research Comparison]

# Deep dive
"Help me learn [CONCEPT]"
[Use Prompt 16: Learn a New Concept]

# Apply learning
"Implement [CONCEPT] in my code"
[Use Prompt 5: Audio Algorithm Implementation]
```

## Essential Commands

```bash
# List all MCP servers
claude mcp list

# Get details about a server
claude mcp get svelte

# Remove a server
claude mcp remove server-name

# Add a new server
claude mcp add --transport http svelte https://mcp.svelte.dev

# Check MCP status (in Claude Code)
/mcp status

# View Claude Code help
claude --help

# Start Claude Code with debug logging
MCP_DEBUG=true claude

# Set GitHub token for this session
GITHUB_TOKEN=your_token claude
```

## Prompts Directory Structure

```
tools/prompts/
├── CLAUDE_CODE_ROUTINE_PROMPTS.md    (20 reusable prompts)
├── .claude_prompts/                  (optional: your saved prompts)
│   ├── code-quality.md
│   ├── audio-algorithm.md
│   └── learning.md
```

## Tips & Tricks

### 1. Save Favorite Prompts

Create `.claude_prompts` directory with your customized prompts:

```bash
mkdir -p .claude_prompts

# Copy a prompt you like
cat > .claude_prompts/code-review.md << 'EOF'
I need a comprehensive code review for [FILE].

[Your customized version of Prompt 1]
EOF
```

### 2. Create Aliases

Add to your `.bashrc` or `.zshrc`:

```bash
# Claude Code shortcuts
alias claude-audio='@svelte @web-audio @puredata @supercollider'
alias claude-github='@github @git'
alias claude-quality='@code-analysis'
```

### 3. Use Environment Variables

```bash
# Create .env file
echo "GITHUB_TOKEN=ghp_xxx" > .env

# Load before running Claude Code
source .env && claude
```

### 4. Combine MCP + Prompts

Best combination:

```
@svelte @web-audio @supercollider @github
[Your prompt with clear instructions]

This uses all relevant servers for audio UI development!
```

### 5. Save Good Responses

When you get a great response:

```bash
# Copy to documentation
mkdir -p docs/examples/claude-responses

# Save for reference
echo "[Response from Claude Code]" > docs/examples/claude-responses/[topic].md
```

## Configuration

### The `.mcp.json` File

Located in project root, pre-configured with:

```json
{
  "mcpServers": {
    "svelte": {...},          // Enabled
    "web-audio": {...},       // Enabled
    "nodejs-docs": {...},     // Enabled
    "git": {...},             // Enabled
    "github": {...},          // Disabled (needs token)
    "npm-registry": {...},    // Enabled
    // ... more servers
  }
}
```

**To enable a server**:
- Set `"enabled": true` in `.mcp.json`
- Restart Claude Code

**To disable a server**:
- Set `"enabled": false` in `.mcp.json`
- Or delete it from the list

### Environment Variables

Important variables:

```bash
export GITHUB_TOKEN=ghp_xxx              # GitHub authentication
export NODE_ENV=development              # Development mode
export MCP_DEBUG=true                    # Enable debug logging
export MAX_MCP_OUTPUT_TOKENS=20000       # Increase output limit
```

## Troubleshooting

### Server not connecting

```bash
# Check status
claude /mcp status

# List servers
claude mcp list

# Enable debug logging
MCP_DEBUG=true claude
```

### GitHub errors

```bash
# Generate new token
# https://github.com/settings/tokens/new
# Scopes: repo, read:user

# Verify token
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user

# Set and restart
export GITHUB_TOKEN=ghp_xxx && claude
```

### MCP output too large

```bash
# Increase limit
export MAX_MCP_OUTPUT_TOKENS=30000

# Or in .mcp.json:
"settings": {
  "maxOutputTokens": 30000
}
```

## Next Steps

1. **Set up GitHub** (optional but powerful)
   - Generate token: https://github.com/settings/tokens/new
   - Run: `export GITHUB_TOKEN=your_token && claude`

2. **Explore MCP Servers**
   - Try: `@svelte explain Runes`
   - Try: `@web-audio show oscillator example`
   - Try: `@npm-registry search svelte-audio`

3. **Use Routine Prompts**
   - Read: `tools/prompts/CLAUDE_CODE_ROUTINE_PROMPTS.md`
   - Copy a prompt
   - Customize for your code
   - Run in Claude Code

4. **Create Saved Prompts**
   - Make `.claude_prompts/` directory
   - Save your favorite prompts
   - Build your personal prompt library

5. **Advanced Usage**
   - Combine multiple servers in one query
   - Use prompts + MCP together
   - Check `CLAUDE_CODE_MCP_SETUP.md` for advanced config

## Quick Reference Card

### MCP Servers

| Server | Best For | Usage |
|--------|----------|-------|
| svelte | UI components | `@svelte [query]` |
| web-audio | Audio patterns | `@web-audio [query]` |
| github | Code management | `@github [query]` |
| nodejs-docs | JS/Node API | `@nodejs [query]` |
| npm-registry | Packages | `@npm-registry [query]` |
| git | Version control | `@git [query]` |
| filesystem | File operations | `@filesystem [query]` |

### Prompt Categories

| Use Case | Prompt # | Best With |
|----------|----------|-----------|
| Code Quality | 1, 2, 3, 4 | `@code-analysis` |
| Audio Dev | 5, 6, 7, 13 | `@web-audio @supercollider` |
| Testing | 6, 10, 11 | Project tests |
| Performance | 12, 13 | Performance profiler |
| Learning | 16, 17 | `@svelte @web-audio` |
| Refactoring | 14, 15 | `@github` (history) |
| Docs | 8, 9 | Project docs |

## Resource Links

- **Claude Docs**: https://docs.claude.com/en/docs/claude-code/mcp
- **MCP Specification**: https://modelcontextprotocol.io/
- **MCP Servers**: https://github.com/modelcontextprotocol/servers
- **Awesome MCP**: https://github.com/wong2/awesome-mcp-servers

## Support

For issues:

1. Check `CLAUDE_CODE_MCP_SETUP.md` (Troubleshooting section)
2. View MCP spec at https://modelcontextprotocol.io/
3. Check server documentation on GitHub
4. Ask in Claude Code: `@github help me debug this issue`

---

**You're all set!** Start with:

```
cd /path/to/audio-plugin-playground
claude
@svelte explain Runes
```

Happy coding! 🎛️✨

