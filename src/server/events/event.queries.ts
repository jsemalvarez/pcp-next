import { EventStatus, Prisma, type Place } from "@prisma/client";
import prisma from "@/data/prisma/db";

/**
 * Lecturas de eventos. Las públicas muestran SOLO eventos publicados y
 * fechas con lugar asignado; ninguna página debería armar su propio filtro.
 */

export const PUBLIC_EVENT_WHERE = {
  status: EventStatus.PUBLISHED,
} satisfies Prisma.EventWhereInput;

export const PUBLIC_OCCURRENCE_WHERE = {
  placeId: { not: null },
  event: PUBLIC_EVENT_WHERE,
} satisfies Prisma.EventOccurrenceWhereInput;

/** Para TypeScript: en las lecturas públicas el lugar siempre está asignado */
export function hasPlace<T extends { place: Place | null }>(o: T): o is T & { place: Place } {
  return o.place !== null;
}

// ─────────────────────────────────────────────
// Públicas
// ─────────────────────────────────────────────

/** Fechas publicadas de un mes (month: 1-12). Las fechas se guardan a medianoche UTC. */
export async function getPublishedOccurrencesByMonth(year: number, month: number) {
  const occurrences = await prisma.eventOccurrence.findMany({
    where: {
      ...PUBLIC_OCCURRENCE_WHERE,
      date: { gte: new Date(Date.UTC(year, month - 1, 1)), lt: new Date(Date.UTC(year, month, 1)) },
    },
    include: {
      event: { include: { organizers: { include: { organizer: true } } } },
      place: true,
    },
    orderBy: [{ date: "asc" }, { timeStart: "asc" }],
  });
  return occurrences.filter(hasPlace);
}

/** Fechas futuras de eventos destacados (home) */
export async function getFeaturedUpcomingOccurrences(from: Date) {
  const occurrences = await prisma.eventOccurrence.findMany({
    where: {
      ...PUBLIC_OCCURRENCE_WHERE,
      date: { gte: from },
      event: { ...PUBLIC_EVENT_WHERE, isFeatured: true },
    },
    include: { event: true, place: true },
  });
  return occurrences.filter(hasPlace);
}

/** Eventos publicados con sus fechas (favoritos) */
export async function getPublishedEventsWithOccurrences() {
  const events = await prisma.event.findMany({
    where: PUBLIC_EVENT_WHERE,
    include: {
      occurrences: {
        where: { placeId: { not: null } },
        include: { place: true },
        orderBy: { date: "asc" },
      },
      organizers: { include: { organizer: true } },
    },
    orderBy: { title: "asc" },
  });
  return events.map((event) => ({ ...event, occurrences: event.occurrences.filter(hasPlace) }));
}

// ─────────────────────────────────────────────
// Admin (incluyen borradores y notas internas)
// ─────────────────────────────────────────────

export async function listEventsForAdmin(filters: { status?: EventStatus } = {}) {
  return prisma.event.findMany({
    where: filters.status ? { status: filters.status } : undefined,
    include: {
      occurrences: {
        include: { place: true },
        orderBy: [{ date: "asc" }, { timeStart: "asc" }],
      },
      organizers: { include: { organizer: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getEventForAdmin(id: string) {
  return prisma.event.findUnique({
    where: { id },
    include: {
      occurrences: {
        include: { place: true },
        orderBy: [{ date: "asc" }, { timeStart: "asc" }],
      },
      organizers: true,
    },
  });
}
