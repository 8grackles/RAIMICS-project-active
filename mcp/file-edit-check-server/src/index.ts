#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
  type CallToolRequest
} from "@modelcontextprotocol/sdk/types.js";

// Track which files have been read
const readFiles = new Set<string>();

// Commit message guidance
const COMMIT_MESSAGE_GUIDANCE = `Create a detailed, specific, measured, descriptive commit message that leaves meticulous forensic evidence for future users and agents to know and understand every action and intention. Make sure not to be unjustifiably definitive in your claims. Future agents and users must be able to understand the true state and the complete thinking and actions in code from commit messages.`;

const server = new Server(
  {
    name: "code-mode-rules",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Helper function to make MCP tool calls
async function callMcpTool<T = any>(serverName: string, name: string, args: Record<string, unknown>) {
  const request: CallToolRequest = {
    method: "tools/call",
    params: { server: serverName, name, arguments: args }
  };
  return server.request(CallToolRequestSchema, request) as Promise<T>;
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "checked_read_file",
        description: "Read a file and mark it as read for future editing",
        inputSchema: {
          type: "object",
          properties: {
            path: { type: "string", description: "Path to the file to read" }
          },
          required: ["path"]
        }
      },
      {
        name: "checked_write_to_file",
        description: "Write to a file, requiring it to have been read first if it exists",
        inputSchema: {
          type: "object",
          properties: {
            path: { type: "string", description: "Path to write the file to" },
            content: { type: "string", description: "Content to write to the file" },
            line_count: { type: "number", description: "Number of lines in the content" }
          },
          required: ["path", "content", "line_count"]
        }
      },
      {
        name: "checked_apply_diff",
        description: "Apply a diff to a file, requiring it to have been read first",
        inputSchema: {
          type: "object",
          properties: {
            path: { type: "string", description: "Path to the file to modify" },
            diff: { type: "string", description: "Unified diff content to apply" }
          },
          required: ["path", "diff"]
        }
      },
      {
        name: "list_my_tools",
        description: "List the tools registered in this server",
        inputSchema: { type: "object", properties: {}, required: [] }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "checked_read_file": {
      const path = String(request.params.arguments?.path);
      const result = await callMcpTool("filesystem", "read_file", { path });
      readFiles.add(path);
      return result;
    }
    case "checked_write_to_file": {
      const path = String(request.params.arguments?.path);
      const content = String(request.params.arguments?.content);
      const line_count = Number(request.params.arguments?.line_count);
      try {
        const exists = await callMcpTool("filesystem", "get_file_info", { path })
          .then(() => true)
          .catch(() => false);
        if (exists && !readFiles.has(path)) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Blind write prevented: File "${path}" exists. Please use checked_read_file to verify the file before modifying it.`
          );
        }
        const result = await callMcpTool("filesystem", "write_to_file", { path, content, line_count });
        readFiles.delete(path);
        return { ...result, commitMessageGuidance: COMMIT_MESSAGE_GUIDANCE };
      } catch (error) {
        if (error instanceof McpError) throw error;
        throw new McpError(ErrorCode.InternalError, String(error));
      }
    }
    case "checked_apply_diff": {
      const path = String(request.params.arguments?.path);
      const diff = String(request.params.arguments?.diff);
      if (!readFiles.has(path)) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          `Blind diff prevented: File "${path}" must be read using checked_read_file before applying a diff.`
        );
      }
      try {
        const result = await callMcpTool("filesystem", "apply_diff", { path, diff });
        readFiles.delete(path);
        return { ...result, commitMessageGuidance: COMMIT_MESSAGE_GUIDANCE };
      } catch (error) {
        if (error instanceof McpError) throw error;
        throw new McpError(ErrorCode.InternalError, String(error));
      }
    }
    default:
      throw new McpError(ErrorCode.MethodNotFound, "Unknown tool");
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Code mode rules MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
