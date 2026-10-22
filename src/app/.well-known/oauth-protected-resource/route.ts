import { generateProtectedResourceMetadata, metadataCorsOptionsRequestHandler } from "mcp-handler";
import { oauthUrls } from "@/server/oauth/oauth.config";

export const dynamic = "force-dynamic";

/** Metadatos del recurso protegido /api/mcp (RFC 9728): indica dónde autorizarse */
export function GET() {
  const urls = oauthUrls();
  const metadata = generateProtectedResourceMetadata({
    authServerUrls: [urls.issuer],
    resourceUrl: urls.resource,
    additionalMetadata: {
      scopes_supported: ["mcp"],
      bearer_methods_supported: ["header"],
      resource_name: "Paseos con Peques",
    },
  });
  return Response.json(metadata, {
    headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=300" },
  });
}

export const OPTIONS = metadataCorsOptionsRequestHandler();
