import { randomBytes } from "node:crypto";
import { z } from "zod";
import prisma from "@/data/prisma/db";
import { isAllowedCimdClientId, isAllowedRedirectUri } from "./oauth.config";

export type OAuthClientInfo = {
  clientId: string;
  clientName: string | null;
  redirectUris: string[];
};

export class OAuthError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400
  ) {
    super(message);
    this.name = "OAuthError";
  }
}

// ─────────────────────────────────────────────
// CIMD: el client_id es la URL de un documento JSON con los datos del cliente
// ─────────────────────────────────────────────

const cimdSchema = z.object({
  client_id: z.string(),
  client_name: z.string().optional(),
  redirect_uris: z.array(z.string()).min(1),
});

const CIMD_TIMEOUT_MS = 5000;
const CIMD_MAX_BYTES = 64 * 1024;

async function fetchCimdClient(clientId: string): Promise<OAuthClientInfo> {
  let res: Response;
  try {
    res = await fetch(clientId, {
      headers: { Accept: "application/json" },
      redirect: "error",
      signal: AbortSignal.timeout(CIMD_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch {
    throw new OAuthError("invalid_client", "No se pudo obtener el documento del cliente.");
  }
  if (!res.ok) throw new OAuthError("invalid_client", "No se pudo obtener el documento del cliente.");

  const body = await res.text();
  if (body.length > CIMD_MAX_BYTES) throw new OAuthError("invalid_client", "Documento de cliente demasiado grande.");

  let parsed: z.infer<typeof cimdSchema>;
  try {
    parsed = cimdSchema.parse(JSON.parse(body));
  } catch {
    throw new OAuthError("invalid_client", "Documento de cliente inválido.");
  }
  // El documento tiene que declarar su propia URL como client_id
  if (parsed.client_id !== clientId) throw new OAuthError("invalid_client", "El client_id del documento no coincide.");

  return {
    clientId,
    clientName: parsed.client_name ?? null,
    redirectUris: parsed.redirect_uris.filter(isAllowedRedirectUri),
  };
}

/** Busca un cliente: CIMD (URL de Claude) o registrado por DCR */
export async function resolveClient(clientId: string): Promise<OAuthClientInfo> {
  if (!clientId) throw new OAuthError("invalid_request", "Falta client_id.");

  if (clientId.startsWith("https://")) {
    if (!isAllowedCimdClientId(clientId)) throw new OAuthError("invalid_client", "Cliente no permitido.");
    return fetchCimdClient(clientId);
  }

  const client = await prisma.oAuthClient.findUnique({ where: { clientId } });
  if (!client) throw new OAuthError("invalid_client", "Cliente desconocido.");
  return { clientId: client.clientId, clientName: client.clientName, redirectUris: client.redirectUris };
}

// ─────────────────────────────────────────────
// DCR (RFC 7591)
// ─────────────────────────────────────────────

const registrationSchema = z.object({
  redirect_uris: z.array(z.string()).min(1),
  client_name: z.string().max(200).optional(),
  token_endpoint_auth_method: z.string().optional(),
  grant_types: z.array(z.string()).optional(),
  response_types: z.array(z.string()).optional(),
});

export async function registerClient(body: unknown) {
  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) throw new OAuthError("invalid_client_metadata", "Metadatos de cliente inválidos.");
  const data = parsed.data;

  if (data.token_endpoint_auth_method && data.token_endpoint_auth_method !== "none") {
    throw new OAuthError("invalid_client_metadata", "Solo se admiten clientes públicos (token_endpoint_auth_method: none).");
  }
  const invalid = data.redirect_uris.filter((u) => !isAllowedRedirectUri(u));
  if (invalid.length > 0) {
    throw new OAuthError("invalid_redirect_uri", `URL de retorno no permitida: ${invalid.join(", ")}`);
  }

  const client = await prisma.oAuthClient.create({
    data: {
      clientId: randomBytes(16).toString("base64url"),
      clientName: data.client_name ?? null,
      redirectUris: data.redirect_uris,
    },
  });

  return {
    client_id: client.clientId,
    client_id_issued_at: Math.floor(client.createdAt.getTime() / 1000),
    client_name: client.clientName ?? undefined,
    redirect_uris: client.redirectUris,
    token_endpoint_auth_method: "none",
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
  };
}
