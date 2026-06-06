import { Router, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import jwt from "jsonwebtoken";
import { createMcpServer } from "./mcpServer";

const router = Router();

const transports = new Map<string, StreamableHTTPServerTransport>();

function authenticate(req: Request): string {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) throw new Error("Missing Bearer token");
  const secret = process.env.JWT_SECRET!;
  const decoded = jwt.verify(token, secret) as { id: string };
  return decoded.id;
}

router.all("/", async (req: Request, res: Response) => {
  let userId: string;
  try {
    userId = authenticate(req);
  } catch (err: any) {
    res.status(401).json({ error: err.message ?? "Unauthorized" });
    return;
  }

  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  if (sessionId && transports.has(sessionId)) {
    const transport = transports.get(sessionId)!;
    await transport.handleRequest(req, res, req.body);
    return;
  }

  if (!sessionId && req.method === "POST" && isInitializeRequest(req.body)) {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (id) => {
        transports.set(id, transport);
      },
    });

    transport.onclose = () => {
      if (transport.sessionId) transports.delete(transport.sessionId);
    };

    const mcpServer = createMcpServer(userId) as any;
    await mcpServer.connect(transport);
    await transport.handleRequest(req, res, req.body);
    return;
  }

  res.status(400).json({
    error:
      "Bad request: missing or invalid mcp-session-id, or not an initialize request",
  });
});

export default router;