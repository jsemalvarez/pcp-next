import type { ServerContext } from "@modelcontextprotocol/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import type { AuditActor } from "@/server/audit/audit.service";
import { ValidationError } from "@/server/shared/validation";

/** Helpers comunes a todas las tools MCP */

export const idSchema = z.string().uuid();

export function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function fail(message: string) {
  return { isError: true, content: [{ type: "text" as const, text: message }] };
}

export type ToolResult = ReturnType<typeof json> | ReturnType<typeof fail>;

/** Ejecuta la tool y traduce errores a mensajes útiles sin filtrar detalles internos */
export async function run(tool: string, args: unknown, fn: () => Promise<ToolResult>) {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof ValidationError) return fail(error.message);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") return fail("No existe un registro con ese id.");
      if (error.code === "P2002") return fail("Ya existe un registro con ese valor (debe ser único).");
    }
    console.error(`[mcp:${tool}] Error`, { args, error });
    return fail("Error interno al ejecutar la herramienta.");
  }
}

/** Quién hizo el cambio, a partir del token con el que se autenticó el pedido */
export function actorFrom(ctx: ServerContext): AuditActor {
  const auth = ctx.http?.authInfo;
  const extra = (auth?.extra ?? {}) as { userId?: string; clientName?: string | null };
  return {
    source: "mcp",
    clientId: auth?.clientId ?? null,
    clientName: extra.clientName ?? null,
    userId: extra.userId ?? null,
  };
}

/** Copia del objeto sin las claves indicadas */
export function omit<T extends object, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> {
  const copy = { ...obj };
  for (const key of keys) delete copy[key];
  return copy;
}
