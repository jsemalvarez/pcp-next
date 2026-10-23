import { createHash, timingSafeEqual } from "node:crypto";
import type { AuthInfo } from "@modelcontextprotocol/server";
import { verifyOAuthAccessToken } from "@/server/oauth/oauth.service";

/**
 * Autenticación del endpoint MCP. Acepta dos tipos de `Authorization: Bearer <token>`:
 * - Token fijo en MCP_API_TOKEN (Claude Code, Desktop vía mcp-remote, scripts).
 * - Access token OAuth emitido por /oauth/token (claude.ai, app móvil, Claude Code con OAuth).
 */

const MIN_TOKEN_LENGTH = 32;

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

function matchesStaticToken(bearerToken: string) {
  const expected = process.env.MCP_API_TOKEN;
  if (!expected || expected.length < MIN_TOKEN_LENGTH) return false;
  // Se comparan los hashes para que el tiempo no dependa del largo ni del contenido
  return timingSafeEqual(digest(bearerToken), digest(expected));
}

export async function verifyMcpToken(_req: Request, bearerToken?: string): Promise<AuthInfo | undefined> {
  if (!bearerToken) return undefined;
  if (matchesStaticToken(bearerToken)) {
    return { token: bearerToken, clientId: "pcp-admin", scopes: [], extra: { clientName: "Token fijo (MCP_API_TOKEN)" } };
  }
  return verifyOAuthAccessToken(bearerToken);
}
