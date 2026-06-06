import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerFolderTools } from "./tools/folderTools";
import { registerImageTools } from "./tools/imageTools";

export function createMcpServer(userId: string): McpServer {
  const server = new McpServer({
    name: "dobby-ads",
    version: "1.0.0",
  });

  registerFolderTools(server, userId);
  registerImageTools(server, userId);

  return server;
}