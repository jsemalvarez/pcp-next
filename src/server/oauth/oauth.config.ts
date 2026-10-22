/**
 * Configuración del servidor de autorización OAuth 2.1 que protege /api/mcp.
 * Uso personal: solo se aceptan clientes de Claude (web, móvil, Desktop y Claude Code).
 * Requisitos de Claude: https://claude.com/docs/connectors/building/authentication
 */

/** Origen público y estable de la app; es el issuer y la base del resource */
export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://www.paseosconpeques.com.ar").replace(/\/$/, "");
}

export const oauthUrls = () => {
  const base = siteUrl();
  return {
    issuer: base,
    resource: `${base}/api/mcp`,
    authorize: `${base}/oauth/authorize`,
    token: `${base}/oauth/token`,
    register: `${base}/oauth/register`,
  };
};

export const ACCESS_TOKEN_TTL_SECONDS = 60 * 60; // 1 hora
export const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 días
export const AUTHORIZATION_CODE_TTL_SECONDS = 60 * 10; // 10 minutos

export const SCOPES_SUPPORTED = ["mcp", "offline_access"];

/** URLs de retorno de las apps de Claude (web, móvil, Desktop). claude.com por si cambia. */
const HOSTED_CALLBACKS = [
  "https://claude.ai/api/mcp/auth_callback",
  "https://claude.com/api/mcp/auth_callback",
];

/** Hosts cuyos documentos CIMD aceptamos (ej. https://claude.ai/oauth/claude-code-client-metadata) */
const CIMD_HOSTS = ["claude.ai", "claude.com"];

function isLoopbackCallback(url: URL) {
  return (
    url.protocol === "http:" &&
    (url.hostname === "localhost" || url.hostname === "127.0.0.1") &&
    url.pathname === "/callback"
  );
}

/** Solo se aceptan las URLs de retorno de Claude: las de las apps y el loopback de Claude Code */
export function isAllowedRedirectUri(uri: string) {
  let url: URL;
  try {
    url = new URL(uri);
  } catch {
    return false;
  }
  if (url.hash || url.username || url.password) return false;
  return HOSTED_CALLBACKS.includes(uri) || isLoopbackCallback(url);
}

/**
 * ¿La URL pedida coincide con alguna registrada por el cliente?
 * Para loopback se ignora el puerto (RFC 8252 §7.3): Claude Code usa uno distinto por sesión.
 */
export function redirectUriMatches(requested: string, registered: string[]) {
  if (registered.includes(requested)) return true;
  let req: URL;
  try {
    req = new URL(requested);
  } catch {
    return false;
  }
  if (!isLoopbackCallback(req)) return false;
  return registered.some((r) => {
    try {
      const reg = new URL(r);
      return isLoopbackCallback(reg) && reg.hostname === req.hostname && reg.pathname === req.pathname;
    } catch {
      return false;
    }
  });
}

export function isAllowedCimdClientId(clientId: string) {
  try {
    const url = new URL(clientId);
    return url.protocol === "https:" && CIMD_HOSTS.includes(url.hostname) && url.pathname !== "/";
  } catch {
    return false;
  }
}
