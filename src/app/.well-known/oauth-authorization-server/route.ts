import { metadataCorsOptionsRequestHandler } from "mcp-handler";
import { oauthUrls, SCOPES_SUPPORTED } from "@/server/oauth/oauth.config";

export const dynamic = "force-dynamic";

/** Metadatos del servidor de autorización (RFC 8414) */
export function GET() {
  const urls = oauthUrls();
  return Response.json(
    {
      issuer: urls.issuer,
      authorization_endpoint: urls.authorize,
      token_endpoint: urls.token,
      registration_endpoint: urls.register,
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      code_challenge_methods_supported: ["S256"],
      // Clientes públicos: Claude no usa secreto. Con esto + CIMD, Claude prefiere CIMD a DCR
      token_endpoint_auth_methods_supported: ["none"],
      client_id_metadata_document_supported: true,
      scopes_supported: SCOPES_SUPPORTED,
      authorization_response_iss_parameter_supported: true,
    },
    { headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=300" } }
  );
}

export const OPTIONS = metadataCorsOptionsRequestHandler();
