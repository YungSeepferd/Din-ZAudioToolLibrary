#!/usr/bin/env node

/**
 * Web Audio API MCP Server
 */

// Import MCP SDK
const MCP = require('@modelcontextprotocol/sdk/server/stdio');

// Import documentation data
const docUtils = require('./web-audio-docs');

const server = new MCP.Server({
  name: 'web-audio-mcp',
  version: '1.0.0',
  capabilities: {
    tools: {}
  }
});

// Search documentation
server.addTool({
  name: 'search',
  description: 'Search Web Audio API documentation',
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
      const results = docUtils.search(args.query);
      return new MCP.TextContent({
        type: 'text',
        text: JSON.stringify(results, null, 2)
      });
    } catch (error) {
      return new MCP.ErrorContent({
        type: 'text',
        text: `Error searching docs: ${error.message}`
      });
    }
  }
});

// Get API reference
server.addTool({
  name: 'getReference',
  description: 'Get API reference for a Web Audio API node or interface',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Node or interface name (e.g., AudioContext, OscillatorNode)'
      }
    },
    required: ['name']
  },
  handler: async (args) => {
    try {
      const node = docUtils.DOCUMENTATION[args.name.toLowerCase()];
      if (!node) {
        return new MCP.ErrorContent({
          type: 'text',
          text: `No documentation found for ${args.name}`
        });
      }
      return new MCP.TextContent({
        type: 'text',
        text: JSON.stringify(node, null, 2)
      });
    } catch (error) {
      return new MCP.ErrorContent({
        type: 'text',
        text: `Error fetching reference: ${error.message}`
      });
    }
  }
});

// Get code example
server.addTool({
  name: 'getExample',
  description: 'Get a Web Audio API code example',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Example name (e.g., simpleOscillator, filterExample)'
      }
    },
    required: ['name']
  },
  handler: async (args) => {
    try {
      const example = docUtils.EXAMPLES[args.name];
      if (!example) {
        return new MCP.ErrorContent({
          type: 'text',
          text: `No example found for ${args.name}`
        });
      }
      return new MCP.TextContent({
        type: 'text',
        text: JSON.stringify(example, null, 2)
      });
    } catch (error) {
      return new MCP.ErrorContent({
        type: 'text',
        text: `Error fetching example: ${error.message}`
      });
    }
  }
});

// Get pattern
server.addTool({
  name: 'getPattern',
  description: 'Get a Web Audio API pattern or best practice',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Pattern name (e.g., audioGraph, scheduling)'
      }
    },
    required: ['name']
  },
  handler: async (args) => {
    try {
      const pattern = docUtils.PATTERNS[args.name];
      if (!pattern) {
        return new MCP.ErrorContent({
          type: 'text',
          text: `No pattern found for ${args.name}`
        });
      }
      return new MCP.TextContent({
        type: 'text',
        text: JSON.stringify(pattern, null, 2)
      });
    } catch (error) {
      return new MCP.ErrorContent({
        type: 'text',
        text: `Error fetching pattern: ${error.message}`
      });
    }
  }
});

// Start server
server.start(process.stdin, process.stdout);
