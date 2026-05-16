# escape-mcp

[![npm](https://img.shields.io/npm/v/@mukundakatta/escape-mcp.svg)](https://www.npmjs.com/package/@mukundakatta/escape-mcp)
[![mcp](https://img.shields.io/badge/protocol-MCP-blue.svg)](https://modelcontextprotocol.io)

MCP server: escape strings for safe embedding inside six common contexts.
No deps.

## Tool

### `escape`

```json
{ "text": "O'Brien", "context": "sql" }
```

→ `{ "result": "'O''Brien'" }`

| context | what happens                              |
|---------|-------------------------------------------|
| regex   | backslash-escape regex metachars          |
| shell   | POSIX single-quote wrap with `'\''` runs |
| sql     | single-quote wrap with doubled quotes     |
| json    | `JSON.stringify`                          |
| html    | basic entity-encode (& < > " ')           |
| url     | `encodeURIComponent`                      |

## Configure

```json
{ "mcpServers": { "escape": { "command": "npx", "args": ["-y", "@mukundakatta/escape-mcp"] } } }
```

## License

MIT.
