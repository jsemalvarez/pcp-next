"use server";

import { requireAdmin, UnauthorizedError } from "@/server/auth/require-admin";
import { revalidateEvents } from "@/server/events/event.revalidate";
import * as eventService from "@/server/events/event.service";
import { EventValidationError } from "@/server/events/event.service";
import {
  getEventForAdmin,
  getPublishedOccurrencesByMonth,
  listEventsForAdmin,
} from "@/server/events/event.queries";
import type { CreateEventInput, OccurrenceInput, UpdateEventInput } from "@/server/events/event.schemas";

/**
 * Adaptador fino entre la UI y el servicio de eventos:
 * verifica la sesión, llama al servicio y revalida las páginas afectadas.
 */

export type { CreateEventInput, UpdateEventInput, OccurrenceInput };

/** Mensaje para la UI sin filtrar detalles internos (Prisma, stack, etc.) */
function toErrorMessage(context: string, error: unknown, fallback: string) {
  if (error instanceof EventValidationError || error instanceof UnauthorizedError) return error.message;
  console.error(`[${context}] Error:`, error);
  return fallback;
}

// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────

/** Admin: todos los eventos, incluidos borradores */
export async function getEvents() {
  await requireAdmin();
  return listEventsForAdmin();
}

/** Admin: un evento con sus fechas */
export async function getEventById(id: string) {
  await requireAdmin();
  return getEventForAdmin(id);
}

/** Público: fechas publicadas de un mes, para el calendario */
export async function getOccurrencesByMonth(year: number, month: number) {
  try {
    return await getPublishedOccurrencesByMonth(year, month);
  } catch (error) {
    console.error("[getOccurrencesByMonth] Error:", error);
    return [];
  }
}

// ─────────────────────────────────────────────
// WRITE
// ─────────────────────────────────────────────

export async function createEvent(data: CreateEventInput) {
  try {
    await requireAdmin();
    const event = await eventService.createEvent(data);
    revalidateEvents();
    return { success: true as const, event };
  } catch (error) {
    return { success: false as const, error: toErrorMessage("createEvent", error, "Error al crear el evento") };
  }
}

export async function updateEvent(id: string, data: UpdateEventInput) {
  try {
    await requireAdmin();
    const event = await eventService.updateEvent(id, data);
    revalidateEvents(id);
    return { success: true as const, event };
  } catch (error) {
    return { success: false as const, error: toErrorMessage("updateEvent", error, "Error al actualizar el evento") };
  }
}

export async function publishEvent(id: string) {
  try {
    await requireAdmin();
    await eventService.publishEvent(id);
    revalidateEvents(id);
    return { success: true as const };
  } catch (error) {
    return { success: false as const, error: toErrorMessage("publishEvent", error, "Error al publicar el evento") };
  }
}

export async function unpublishEvent(id: string) {
  try {
    await requireAdmin();
    await eventService.unpublishEvent(id);
    revalidateEvents(id);
    return { success: true as const };
  } catch (error) {
    return { success: false as const, error: toErrorMessage("unpublishEvent", error, "Error al pasar a borrador") };
  }
}

export async function archiveEvent(id: string) {
  try {
    await requireAdmin();
    await eventService.archiveEvent(id);
    revalidateEvents(id);
    return { success: true as const };
  } catch (error) {
    return { success: false as const, error: toErrorMessage("archiveEvent", error, "Error al archivar el evento") };
  }
}

/** Borra el evento y todas sus fechas (onDelete: Cascade en el schema). */
export async function deleteEvent(id: string) {
  try {
    await requireAdmin();
    await eventService.deleteEvent(id);
    revalidateEvents();
    return { success: true as const };
  } catch (error) {
    return { success: false as const, error: toErrorMessage("deleteEvent", error, "Error al eliminar el evento") };
  }
}
