#!/usr/bin/env node

/**
 * ⚡ anymd-mcp.js: Sovereign Model Context Protocol (MCP) Server
 * Built with @modelcontextprotocol/sdk to expose local markdown vaults
 * securely to external AI interfaces (like Google Gemini) over JSON-RPC.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema 
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs/promises";
import * as path from "path";

// 1. Retrieve the Local Google Drive/Sidecars sync directory from config/env
const MAPPED_VAULT_DIR = process.env.ANYMD_VAULT_PATH || "G:\\My Drive\\anymd\\Sidecars";

const server = new Server(
  {
    name: "anymd-sovereign-vault-mcp",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Define tools available to external AI engines
const TOOLS = [
  {
    name: "list_sidecars",
    description: "Lists all available Markdown sidecar files and Zettel notes in the mapped sync directory.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "read_sidecar",
    description: "Reads the raw Markdown content and YAML frontmatter of a specific file.",
    inputSchema: {
      type: "object",
      properties: {
        filename: { type: "string", description: "The target file name, e.g., '20260822-1240_spark_prompt.md'" }
      },
      required: ["filename"]
    }
  },
  {
    name: "write_sidecar",
    description: "Saves or overwrites a companion Markdown sidecar file inside the mapped vault.",
    inputSchema: {
      type: "object",
      properties: {
        filename: { type: "string", description: "The filename to write to." },
        content: { type: "string", description: "The full Markdown/YAML content body." }
      },
      required: ["filename", "content"]
    }
  }
];

// Register the tool list hook
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Register tool execution handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "list_sidecars": {
        const files = await fs.readdir(MAPPED_VAULT_DIR);
        const filtered = files.filter(f => f.endsWith(".md") || f.endsWith(".json"));
        return {
          content: [{ type: "text", text: JSON.stringify(filtered, null, 2) }]
        };
      }

      case "read_sidecar": {
        const filePath = path.join(MAPPED_VAULT_DIR, args.filename);
        // Security check: Prevent directory traversal outside our mapped vault
        if (!filePath.startsWith(MAPPED_VAULT_DIR)) {
          throw new Error("Access Denied: Path traversal detected.");
        }
        const text = await fs.readFile(filePath, "utf-8");
        return {
          content: [{ type: "text", text }]
        };
      }

      case "write_sidecar": {
        const filePath = path.join(MAPPED_VAULT_DIR, args.filename);
        if (!filePath.startsWith(MAPPED_VAULT_DIR)) {
          throw new Error("Access Denied: Path traversal detected.");
        }
        await fs.writeFile(filePath, args.content, "utf-8");
        return {
          content: [{ type: "text", text: `Successfully wrote ${args.filename} to mapped vault.` }]
        };
      }

      default:
        throw new Error(`Tool not found: ${name}`);
    }
  } catch (err) {
    return {
      isError: true,
      content: [{ type: "text", text: `Error: ${err.message}` }]
    };
  }
});

// Spin up the stdio listener
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("⚡ Sovereign anymd MCP Server active and listening over standard I/O!");
}

main().catch(console.error);