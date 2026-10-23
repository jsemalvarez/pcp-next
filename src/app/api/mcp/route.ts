import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { verifyMcpToken } from "@/server/auth/mcp-auth";
import { registerAuditTools } from "@/server/mcp/audit-tools";
import { registerEventTools } from "@/server/mcp/event-tools";
import { registerOrganizerTools } from "@/server/mcp/organizer-tools";
import { registerPlaceTools } from "@/server/mcp/place-tools";
import { oauthUrls } from "@/server/oauth/oauth.config";

// Prisma necesita el runtime de Node (no Edge)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INSTRUCTIONS = `
Servidor MCP de Paseos con Peques: agenda de actividades para chicos en Mar del Plata (Argentina).
Lo usa una sola persona, la administradora, para cargar y editar eventos, lugares y organizadores rápido.

Reglas:
- Fechas en formato YYYY-MM-DD y horas HH:mm (24 hs), siempre en hora de Argentina. Llamá a get_catalogs para saber qué día es hoy.
- Antes de crear un evento, buscá el lugar (search_places) y los organizadores (search_organizers). Si el lugar no existe, usá placeText con el nombre tal como aparece, y ofrecé darlo de alta con create_place.
- Antes de crear un lugar u organizador, buscalo para no duplicarlo. Al crear un lugar, mostrá la ubicación calculada (geocodedAs y mapsUrl) para que la confirmen, y ofrecé asignarle las fechas pendientes (pendingOccurrences).
- No inventes datos: si la fuente no dice el precio, dejá priceType en null; el evento queda como borrador incompleto.
- Guardá el texto original del post en sourceText y el link en sourceUrl. Anotá en internalNotes qué falta confirmar.
- create_event_draft siempre crea borradores. Publicá (publish_event) solo cuando te lo pidan explícitamente.
- Nada se borra desde acá: los eventos se archivan (archive_event) y los lugares se desactivan (isActive: false).
- Todos los cambios quedan registrados; get_change_history muestra qué se cambió y cómo estaba antes, por si hay que deshacer algo.
- Después de cada cambio, contale al usuario qué quedó cargado, qué falta y pasale el adminUrl.
`.trim();

const handler = createMcpHandler(
  (server) => {
    registerEventTools(server);
    registerPlaceTools(server);
    registerOrganizerTools(server);
    registerAuditTools(server);
  },
  {
    serverInfo: { name: "paseos-con-peques", version: "1.1.0" },
    instructions: INSTRUCTIONS,
  }
);

// Sin token válido responde 401 con el puntero a los metadatos OAuth (así Claude inicia el login).
// Nada del MCP es público.
const authHandler = withMcpAuth(handler, verifyMcpToken, {
  required: true,
  // Origen (no la URL del recurso): mcp-handler le agrega /.well-known/oauth-protected-resource
  resourceUrl: oauthUrls().issuer,
});

export { authHandler as GET, authHandler as POST, authHandler as DELETE };
