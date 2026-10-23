import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { diffSnapshots, listAuditLog } from "@/server/audit/audit.service";
import { idSchema as id, json, run } from "./mcp.shared";

/** Tool MCP para consultar el historial de cambios hechos desde el MCP */

export function registerAuditTools(server: McpServer) {
  server.registerTool(
    "get_change_history",
    {
      title: "Historial de cambios",
      description:
        "Lista los cambios hechos desde el MCP (más recientes primero): qué tool, sobre qué registro, cuándo, " +
        "desde qué cliente y qué campos cambiaron. Sirve para revisar lo cargado o para deshacer un cambio " +
        "(con includeSnapshots: true trae cómo estaba el registro antes y después).",
      inputSchema: z.object({
        entityType: z.enum(["event", "place", "organizer"]).optional(),
        entityId: id.optional().describe("Id del evento, lugar u organizador"),
        action: z.string().optional().describe("Nombre de la tool, ej. 'update_event'"),
        since: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional()
          .describe("Desde este día (YYYY-MM-DD, inclusive)"),
        limit: z.number().int().min(1).max(100).optional(),
        includeSnapshots: z.boolean().optional(),
      }),
      annotations: { readOnlyHint: true },
    },
    async ({ includeSnapshots, since, ...filters }) =>
      run("get_change_history", { since, ...filters }, async () => {
        // "Desde el día" en hora de Argentina (UTC-3)
        const entries = await listAuditLog({
          ...filters,
          since: since ? new Date(`${since}T03:00:00.000Z`) : undefined,
        });
        return json({
          count: entries.length,
          changes: entries.map((entry) => ({
            id: entry.id,
            at: entry.createdAt.toISOString(),
            action: entry.action,
            entityType: entry.entityType,
            entityId: entry.entityId,
            client: entry.clientName ?? entry.clientId,
            // En las altas no hay "antes": se informa como alta en vez de listar todos los campos
            changedFields: entry.before === null ? "alta" : diffSnapshots(entry.before, entry.after),
            ...(includeSnapshots ? { before: entry.before, after: entry.after } : {}),
          })),
        });
      })
  );
}
