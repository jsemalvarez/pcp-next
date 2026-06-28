"use server";

import prisma from "@/data/prisma/db";
import { revalidatePath } from "next/cache";
import { ActivityType, PriceType } from "@prisma/client";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type CreateEventInput = {
  title: string;
  description?: string;
  artists?: string;
  photoId?: string;
  bgColor?: string;
  ticketUrl?: string;
  bookingWhatsapp?: string;
  priceType: PriceType;
  activityTypes: ActivityType[];
  ageMin: number;
  ageMax?: number | null;
  isFeatured?: boolean;
  occurrences: CreateOccurrenceInput[];
};

export type CreateOccurrenceInput = {
  date: Date;
  timeStart: string;
  timeEnd?: string;
  placeId: string;
};

export type UpdateEventInput = Partial<Omit<CreateEventInput, "occurrences">>;

// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────

export async function getEvents() {
  try {
    const events = await prisma.event.findMany({
      include: {
        occurrences: {
          include: { place: true },
          orderBy: [{ date: "asc" }, { timeStart: "asc" }],
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return events;
  } catch (error) {
    console.error("[getEvents] Error:", error);
    return [];
  }
}

export async function getEventById(id: string) {
  try {
    return await prisma.event.findUnique({
      where: { id },
      include: {
        occurrences: {
          include: { place: true },
          orderBy: [{ date: "asc" }, { timeStart: "asc" }],
        },
      },
    });
  } catch (error) {
    console.error("[getEventById] Error:", error);
    return null;
  }
}

/**
 * Devuelve todas las ocurrencias de un mes dado.
 * Usado por el CalendarGrid para renderizar el calendario.
 */
export async function getOccurrencesByMonth(year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  try {
    return await prisma.eventOccurrence.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
      },
      include: {
        event: true,
        place: true,
      },
      orderBy: [{ date: "asc" }, { timeStart: "asc" }],
    });
  } catch (error) {
    console.error("[getOccurrencesByMonth] Error:", error);
    return [];
  }
}

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

/**
 * Crea un Event con todas sus ocurrencias en una sola transacción.
 * Si cualquier parte falla, se revierte todo.
 */
export async function createEvent(data: CreateEventInput) {
  try {
    const { occurrences, ...eventData } = data;

    const event = await prisma.$transaction(async (tx) => {
      const newEvent = await tx.event.create({
        data: {
          ...eventData,
          isFeatured: eventData.isFeatured ?? false,
          occurrences: {
            createMany: {
              data: occurrences.map((o) => ({
                date: o.date,
                timeStart: o.timeStart,
                timeEnd: o.timeEnd,
                placeId: o.placeId,
              })),
            },
          },
        },
        include: { occurrences: true },
      });
      return newEvent;
    });

    revalidatePath("/");
    revalidatePath("/admin/eventos");
    return { success: true, event };
  } catch (error: any) {
    console.error("[createEvent] Error:", error);
    return { success: false, error: error?.message || "Error al crear el evento" };
  }
}

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────

export async function updateEvent(id: string, data: UpdateEventInput) {
  try {
    const event = await prisma.event.update({
      where: { id },
      data,
      include: { occurrences: { include: { place: true } } },
    });
    revalidatePath("/");
    revalidatePath("/admin/eventos");
    revalidatePath(`/admin/eventos/${id}`);
    return { success: true, event };
  } catch (error: any) {
    console.error("[updateEvent] Error:", error);
    return { success: false, error: error?.message || "Error al actualizar el evento" };
  }
}

// ─────────────────────────────────────────────
// OCCURRENCE — CRUD individual
// ─────────────────────────────────────────────

export async function addOccurrence(eventId: string, data: CreateOccurrenceInput) {
  try {
    const occurrence = await prisma.eventOccurrence.create({
      data: { eventId, ...data },
      include: { place: true },
    });
    revalidatePath("/");
    revalidatePath("/admin/eventos");
    return { success: true, occurrence };
  } catch (error: any) {
    console.error("[addOccurrence] Error:", error);
    return { success: false, error: error?.message || "Error al agregar la fecha" };
  }
}

export async function updateOccurrence(
  id: string,
  data: Partial<CreateOccurrenceInput>
) {
  try {
    const occurrence = await prisma.eventOccurrence.update({
      where: { id },
      data,
      include: { place: true },
    });
    revalidatePath("/");
    revalidatePath("/admin/eventos");
    return { success: true, occurrence };
  } catch (error: any) {
    console.error("[updateOccurrence] Error:", error);
    return { success: false, error: error?.message || "Error al actualizar la fecha" };
  }
}

export async function deleteOccurrence(id: string) {
  try {
    await prisma.eventOccurrence.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin/eventos");
    return { success: true };
  } catch (error) {
    console.error("[deleteOccurrence] Error:", error);
    return { success: false, error: "Error al eliminar la fecha" };
  }
}

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────

/**
 * Borra el evento y todas sus ocurrencias (onDelete: Cascade en el schema).
 */
export async function deleteEvent(id: string) {
  try {
    await prisma.event.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin/eventos");
    return { success: true };
  } catch (error) {
    console.error("[deleteEvent] Error:", error);
    return { success: false, error: "Error al eliminar el evento" };
  }
}
