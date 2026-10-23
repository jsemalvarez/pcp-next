import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { AuthInfo } from "@modelcontextprotocol/server";
import prisma from "@/data/prisma/db";
import { OAuthError, resolveClient, type OAuthClientInfo } from "./oauth.clients";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  AUTHORIZATION_CODE_TTL_SECONDS,
  oauthUrls,
  REFRESH_TOKEN_TTL_SECONDS,
  redirectUriMatches,
} from "./oauth.config";

/**
 * Flujo authorization code + PKCE (OAuth 2.1) para clientes públicos.
 * Los códigos y tokens son aleatorios y opacos; en la base se guarda solo su hash.
 */

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
const newSecret = () => randomBytes(32).toString("base64url");

function sameResource(a: string, b: string) {
  return a.replace(/\/$/, "") === b.replace(/\/$/, "");
}

// ─────────────────────────────────────────────
// /oauth/authorize
// ─────────────────────────────────────────────

export type AuthorizeRequest = {
  client: OAuthClientInfo;
  redirectUri: string;
  state: string | null;
  codeChallenge: string;
  scope: string | null;
  resource: string | null;
};

/**
 * Valida los parámetros de /oauth/authorize. Si el cliente o la URL de retorno
 * no son válidos se muestra el error en pantalla: nunca se redirige a una URL no verificada.
 */
export async function validateAuthorizeRequest(params: URLSearchParams): Promise<AuthorizeRequest> {
  const clientId = params.get("client_id") ?? "";
  const redirectUri = params.get("redirect_uri") ?? "";

  const client = await resolveClient(clientId);
  if (!redirectUri || !redirectUriMatches(redirectUri, client.redirectUris)) {
    throw new OAuthError("invalid_request", "La URL de retorno no está registrada para este cliente.");
  }

  if (params.get("response_type") !== "code") {
    throw new OAuthError("unsupported_response_type", "Solo se admite response_type=code.");
  }
  const codeChallenge = params.get("code_challenge") ?? "";
  if (!/^[A-Za-z0-9_-]{43,128}$/.test(codeChallenge) || params.get("code_challenge_method") !== "S256") {
    throw new OAuthError("invalid_request", "Falta PKCE (code_challenge con S256).");
  }
  const resource = params.get("resource");
  if (resource && !sameResource(resource, oauthUrls().resource)) {
    throw new OAuthError("invalid_target", "El recurso pedido no corresponde a este servidor.");
  }

  return {
    client,
    redirectUri,
    state: params.get("state"),
    codeChallenge,
    scope: params.get("scope"),
    resource,
  };
}

/** URL de retorno al cliente con el resultado (code o error) */
export function buildRedirect(redirectUri: string, values: Record<string, string | null | undefined>) {
  const url = new URL(redirectUri);
  for (const [key, value] of Object.entries(values)) {
    if (value) url.searchParams.set(key, value);
  }
  url.searchParams.set("iss", oauthUrls().issuer); // RFC 9207
  return url.toString();
}

export async function createAuthorizationCode(request: AuthorizeRequest, userId: string) {
  const code = newSecret();
  await prisma.oAuthAuthorizationCode.create({
    data: {
      codeHash: sha256(code),
      clientId: request.client.clientId,
      userId,
      redirectUri: request.redirectUri,
      codeChallenge: request.codeChallenge,
      scope: request.scope,
      resource: request.resource,
      expiresAt: new Date(Date.now() + AUTHORIZATION_CODE_TTL_SECONDS * 1000),
    },
  });
  return code;
}

// ─────────────────────────────────────────────
// /oauth/token
// ─────────────────────────────────────────────

function verifyPkce(verifier: string, challenge: string) {
  if (!/^[A-Za-z0-9._~-]{43,128}$/.test(verifier)) return false;
  const computed = Buffer.from(createHash("sha256").update(verifier).digest("base64url"));
  const expected = Buffer.from(challenge);
  return computed.length === expected.length && timingSafeEqual(computed, expected);
}

async function issueTokens(data: {
  clientId: string;
  clientName: string | null;
  userId: string;
  scope: string | null;
  resource: string | null;
}) {
  const accessToken = newSecret();
  const refreshToken = newSecret();
  await prisma.oAuthToken.create({
    data: {
      ...data,
      accessTokenHash: sha256(accessToken),
      refreshTokenHash: sha256(refreshToken),
      accessExpiresAt: new Date(Date.now() + ACCESS_TOKEN_TTL_SECONDS * 1000),
      refreshExpiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
    },
  });
  return {
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: ACCESS_TOKEN_TTL_SECONDS,
    refresh_token: refreshToken,
    ...(data.scope ? { scope: data.scope } : {}),
  };
}

export async function exchangeAuthorizationCode(form: URLSearchParams) {
  const code = form.get("code") ?? "";
  const clientId = form.get("client_id") ?? "";
  const redirectUri = form.get("redirect_uri") ?? "";
  const verifier = form.get("code_verifier") ?? "";
  if (!code || !clientId || !verifier) throw new OAuthError("invalid_request", "Faltan parámetros.");

  const stored = await prisma.oAuthAuthorizationCode.findUnique({ where: { codeHash: sha256(code) } });
  if (!stored || stored.expiresAt < new Date()) throw new OAuthError("invalid_grant", "Código inválido o vencido.");

  if (stored.usedAt) {
    // Reuso de un código: se revoca todo lo emitido para ese cliente (posible robo)
    await prisma.oAuthToken.updateMany({
      where: { clientId: stored.clientId, userId: stored.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw new OAuthError("invalid_grant", "El código ya fue usado.");
  }
  if (stored.clientId !== clientId) throw new OAuthError("invalid_grant", "El código no pertenece a este cliente.");
  if (stored.redirectUri !== redirectUri) throw new OAuthError("invalid_grant", "La URL de retorno no coincide.");
  if (!verifyPkce(verifier, stored.codeChallenge)) throw new OAuthError("invalid_grant", "PKCE inválido.");
  const resource = form.get("resource");
  if (resource && stored.resource && !sameResource(resource, stored.resource)) {
    throw new OAuthError("invalid_target", "El recurso no coincide con el autorizado.");
  }

  // Marcar como usado de forma atómica: si dos pedidos llegan juntos, solo uno gana
  const { count } = await prisma.oAuthAuthorizationCode.updateMany({
    where: { id: stored.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  if (count === 0) throw new OAuthError("invalid_grant", "El código ya fue usado.");

  const client = await resolveClient(clientId).catch(() => null);
  return issueTokens({
    clientId,
    clientName: client?.clientName ?? null,
    userId: stored.userId,
    scope: stored.scope,
    resource: stored.resource,
  });
}

export async function refreshAccessToken(form: URLSearchParams) {
  const refreshToken = form.get("refresh_token") ?? "";
  const clientId = form.get("client_id") ?? "";
  if (!refreshToken || !clientId) throw new OAuthError("invalid_request", "Faltan parámetros.");

  const stored = await prisma.oAuthToken.findUnique({ where: { refreshTokenHash: sha256(refreshToken) } });
  if (
    !stored ||
    stored.revokedAt ||
    !stored.refreshExpiresAt ||
    stored.refreshExpiresAt < new Date() ||
    stored.clientId !== clientId
  ) {
    throw new OAuthError("invalid_grant", "Refresh token inválido o vencido.");
  }

  // Rotación: se revoca el par actual y se emite uno nuevo
  const { count } = await prisma.oAuthToken.updateMany({
    where: { id: stored.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  if (count === 0) throw new OAuthError("invalid_grant", "Refresh token ya usado.");

  return issueTokens({
    clientId: stored.clientId,
    clientName: stored.clientName,
    userId: stored.userId,
    scope: stored.scope,
    resource: stored.resource,
  });
}

// ─────────────────────────────────────────────
// Verificación en /api/mcp
// ─────────────────────────────────────────────

export async function verifyOAuthAccessToken(token: string): Promise<AuthInfo | undefined> {
  const stored = await prisma.oAuthToken.findUnique({ where: { accessTokenHash: sha256(token) } });
  if (!stored || stored.revokedAt || stored.accessExpiresAt < new Date()) return undefined;
  return {
    token,
    clientId: stored.clientId,
    scopes: stored.scope ? stored.scope.split(" ") : [],
    expiresAt: Math.floor(stored.accessExpiresAt.getTime() / 1000),
    extra: { userId: stored.userId, clientName: stored.clientName },
  };
}
