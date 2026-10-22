import { OAuthError } from "@/server/oauth/oauth.clients";
import { exchangeAuthorizationCode, refreshAccessToken } from "@/server/oauth/oauth.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store", Pragma: "no-cache" };

/** Endpoint de tokens (RFC 6749): canje del código y refresh. Recibe application/x-www-form-urlencoded. */
export async function POST(req: Request) {
  let form: URLSearchParams;
  try {
    form = new URLSearchParams(await req.text());
  } catch {
    return oauthError(new OAuthError("invalid_request", "Cuerpo inválido."));
  }

  try {
    const grantType = form.get("grant_type");
    if (grantType === "authorization_code") {
      return Response.json(await exchangeAuthorizationCode(form), { headers: NO_STORE });
    }
    if (grantType === "refresh_token") {
      return Response.json(await refreshAccessToken(form), { headers: NO_STORE });
    }
    throw new OAuthError("unsupported_grant_type", "grant_type no soportado.");
  } catch (error) {
    if (error instanceof OAuthError) return oauthError(error);
    console.error("[oauth/token] Error", error);
    return oauthError(new OAuthError("server_error", "Error interno.", 500));
  }
}

function oauthError(error: OAuthError) {
  return Response.json(
    { error: error.code, error_description: error.message },
    { status: error.status, headers: NO_STORE }
  );
}
