import { redirect } from "next/navigation";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { getSession } from "@/data/auth/session";
import { approveAuthorization, denyAuthorization } from "@/actions/oauth";
import { OAuthError } from "@/server/oauth/oauth.clients";
import { validateAuthorizeRequest, type AuthorizeRequest } from "@/server/oauth/oauth.service";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function toSearchParams(raw: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") params.set(key, value);
  }
  return params;
}

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-dvh flex items-center justify-center p-6 bg-gradient-to-br from-brand-primary via-[#2a2d5e] to-brand-accent">
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 space-y-6">{children}</div>
  </div>
);

/**
 * Pantalla de consentimiento OAuth: una app (Claude) pide acceso al MCP.
 * Requiere sesión de admin; sin sesión manda al login y vuelve acá.
 */
export default async function AuthorizePage({ searchParams }: Props) {
  const params = toSearchParams(await searchParams);
  const query = params.toString();

  // Primero la sesión: así nadie sin login puede hacer que el servidor busque documentos de clientes
  const session = await getSession();
  if (!session) redirect(`/admin/login?next=${encodeURIComponent(`/oauth/authorize?${query}`)}`);

  let request: AuthorizeRequest;
  try {
    request = await validateAuthorizeRequest(params);
  } catch (error) {
    if (!(error instanceof OAuthError)) throw error;
    return (
      <Card>
        <div className="flex items-center gap-3 text-red-600">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <h1 className="text-xl font-black">No se puede autorizar</h1>
        </div>
        <p className="text-gray-600 text-sm">{error.message}</p>
        <p className="text-gray-400 text-xs">Código: {error.code}</p>
      </Card>
    );
  }

  const redirectUrl = new URL(request.redirectUri);
  const isLoopback = redirectUrl.hostname === "localhost" || redirectUrl.hostname === "127.0.0.1";
  const clientName = request.client.clientName || "Una aplicación";

  return (
    <Card>
      <div className="flex items-center gap-3 text-brand-primary">
        <ShieldCheck className="w-7 h-7 shrink-0" />
        <h1 className="text-2xl font-black">Autorizar acceso</h1>
      </div>

      <p className="text-gray-700">
        <strong>{clientName}</strong> quiere conectarse a <strong>Paseos con Peques</strong> para buscar,
        crear y editar eventos en tu nombre.
      </p>

      <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 text-sm space-y-1">
        <p className="text-gray-500">Vas a volver a:</p>
        <p className="font-bold text-gray-800 break-all">{redirectUrl.host}</p>
      </div>

      {isLoopback && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-3">
          La conexión es con un programa de esta computadora (por ejemplo Claude Code). Autorizá solo si lo
          iniciaste vos.
        </p>
      )}

      <p className="text-xs text-gray-400">
        Podrá crear borradores, editar, publicar y archivar eventos. No puede borrar eventos ni ver usuarios.
      </p>

      <div className="flex gap-3">
        <form action={denyAuthorization} className="flex-1">
          <input type="hidden" name="query" value={query} />
          <button
            type="submit"
            className="w-full py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-black hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
        </form>
        <form action={approveAuthorization} className="flex-1">
          <input type="hidden" name="query" value={query} />
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-brand-primary text-white font-black hover:bg-brand-primary/90 transition-all shadow-md"
          >
            Permitir
          </button>
        </form>
      </div>
    </Card>
  );
}
