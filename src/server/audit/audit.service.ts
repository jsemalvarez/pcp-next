import { Prisma } from "@prisma/client";
import prisma from "@/data/prisma/db";

/**
 * Historial de cambios hechos desde el MCP: quién (cliente), qué tool, sobre qué registro,
 * y cómo estaba antes y después. Sirve para revisar y revertir lo que escribió una IA.
 */

export type AuditEntityType = "event" | "place" | "organizer";

export interface AuditActor {
  source: "mcp";
  clientId?: string | null;
  clientName?: string | null;
  userId?: string | null;
}

export interface AuditEntry {
  actor: AuditActor;
  action: string;
  entityType: AuditEntityType;
  entityId: string;
  input?: unknown;
  before?: unknown;
  after?: unknown;
}

/** Fechas a ISO y sin undefined, para guardar en una columna JSON */
function toJson(value: unknown): Prisma.InputJsonValue | typeof Prisma.DbNull {
  if (value === undefined || value === null) return Prisma.DbNull;
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

/**
 * Registra un cambio. Si falla, lo loguea y sigue: la escritura ya se hizo
 * y no tiene sentido devolverle un error a la IA por el historial.
 */
export async function recordAudit(entry: AuditEntry) {
  try {
    await prisma.auditLog.create({
      data: {
        source: entry.actor.source,
        clientId: entry.actor.clientId ?? null,
        clientName: entry.actor.clientName ?? null,
        userId: entry.actor.userId ?? null,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        input: toJson(entry.input),
        before: toJson(entry.before),
        after: toJson(entry.after),
      },
    });
  } catch (error) {
    console.error("[audit] No se pudo registrar el cambio", { action: entry.action, entityId: entry.entityId, error });
  }
}

/** Campos que cambiaron entre dos fotos del registro (comparación de primer nivel) */
export function diffSnapshots(before: unknown, after: unknown) {
  const a = (before ?? {}) as Record<string, unknown>;
  const b = (after ?? {}) as Record<string, unknown>;
  const changes: Record<string, { from: unknown; to: unknown }> = {};
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (key === "updatedAt") continue;
    if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) {
      changes[key] = { from: a[key] ?? null, to: b[key] ?? null };
    }
  }
  return changes;
}

export interface AuditFilters {
  entityType?: AuditEntityType;
  entityId?: string;
  action?: string;
  since?: Date;
  limit?: number;
}

export async function listAuditLog(filters: AuditFilters = {}) {
  return prisma.auditLog.findMany({
    where: {
      entityType: filters.entityType,
      entityId: filters.entityId,
      action: filters.action,
      createdAt: filters.since ? { gte: filters.since } : undefined,
    },
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(filters.limit ?? 20, 1), 100),
  });
}
