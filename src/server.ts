#!/usr/bin/env node
/**
 * escape MCP server. One tool: `escape`.
 *
 * Escape strings for safe embedding inside several common contexts:
 *   - regex: backslash-escape regex metachars
 *   - shell: single-quote with embedded-quote handling (POSIX)
 *   - sql:   single-quote with embedded-quote doubling
 *   - json:  JSON.stringify
 *   - html:  basic entity-encode (& < > " ')
 *   - url:   percent-encode component
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const VERSION = '0.1.0';

export type Context = 'regex' | 'shell' | 'sql' | 'json' | 'html' | 'url';

export function escape(text: string, context: Context): string {
  switch (context) {
    case 'regex':
      return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    case 'shell':
      // POSIX-safe single-quote wrap. Each embedded ' becomes '\''.
      return "'" + text.replace(/'/g, "'\\''") + "'";
    case 'sql':
      return "'" + text.replace(/'/g, "''") + "'";
    case 'json':
      return JSON.stringify(text);
    case 'html':
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    case 'url':
      return encodeURIComponent(text);
  }
}

const server = new Server({ name: 'escape', version: VERSION }, { capabilities: { tools: {} } });

const TOOLS = [
  {
    name: 'escape',
    description:
      'Escape a string for safe embedding in regex, shell, sql, json, html, or url contexts.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        context: { type: 'string', enum: ['regex', 'shell', 'sql', 'json', 'html', 'url'] },
      },
      required: ['text', 'context'],
    },
  },
] as const;

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  try {
    if (name !== 'escape') return errorResult('unknown tool: ' + name);
    const a = args as unknown as { text: string; context: Context };
    return jsonResult({ result: escape(a.text, a.context) });
  } catch (err) {
    return errorResult('escape failed: ' + (err as Error).message);
  }
});

function jsonResult(value: unknown) {
  return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] };
}
function errorResult(message: string) {
  return { isError: true, content: [{ type: 'text', text: message }] };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(`escape MCP server v${VERSION} ready on stdio\n`);
}
