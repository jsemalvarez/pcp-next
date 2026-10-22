import { OAuthError, registerClient } from "@/server/oauth/oauth.clients";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Registro dinámico de clientes (RFC 7591). Solo acepta URLs de retorno de Claude. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return oauthError(new OAuthError("invalid_client_metadata", "El cuerpo tiene que ser JSON."));
  }
  try {
    return Response.json(await registerClient(body), { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof OAuthError) return oauthError(error);
    console.error("[oauth/register] Error", error);
    return oauthError(new OAuthError("server_error", "Error interno.", 500));
  }
}

function oauthError(error: OAuthError) {
  return Response.json(
    { error: error.code, error_description: error.message },
    { status: error.status, headers: { "Cache-Control": "no-store" } }
  );
}
