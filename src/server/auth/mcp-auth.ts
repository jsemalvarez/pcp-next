import { createHash, timingSafeEqual } from "node:crypto";
import type { AuthInfo } from "@modelcontextprotocol/server";

/**
 * Autenticación del endpoint MCP: un token largo en MCP_API_TOKEN, enviado
 * como `Authorization: Bearer <token>`. Uso personal (un solo admin).
 * Sin token configurado, el MCP queda cerrado: nunca se abre sin autenticación.
 */

const MIN_TOKEN_LENGTH = 32;

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

export function verifyMcpToken(_req: Request, bearerToken?: string): AuthInfo | undefined {
  const expected = process.env.MCP_API_TOKEN;
  if (!expected || expected.length < MIN_TOKEN_LENGTH) {
    console.error(`[mcp] MCP_API_TOKEN no está definido o tiene menos de ${MIN_TOKEN_LENGTH} caracteres.`);
    return undefined;
  }
  if (!bearerToken) return undefined;

  // Se comparan los hashes para que el tiempo no dependa del largo ni del contenido
  if (!timingSafeEqual(digest(bearerToken), digest(expected))) return undefined;

  return { token: bearerToken, clientId: "pcp-admin", scopes: [] };
}
