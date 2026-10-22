import { EventStatus, Prisma } from "@prisma/client";
import { z } from "zod";
import prisma from "@/data/prisma/db";
import {
  createEventSchema,
  occurrenceInputSchema,
  occurrenceUpdateSchema,
  updateEventSchema,
  type CreateEventInput,
  type OccurrenceInput,
  type OccurrenceUpdateInput,
  type UpdateEventInput,
} from "./event.schemas";
import { describeMissing, draftStatusFor, getMissingFields } from "./event.completeness";

/**
 * Escrituras de eventos. Lo usan las server actions del admin y el MCP.
 * No verifica permisos: eso es responsabilidad de quien lo llama.
 * No usar "use server" acá: expondría todas las funciones como endpoints.
 */

export class EventValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EventValidationError";
  }
}

type Tx = Prisma.TransactionClient;
type ParsedOccurrence = z.output<typeof occurrenceInputSchema>;

/** 'YYYY-MM-DD' → medianoche UTC (el front lee el día con getUTC*) */
export function toUtcDate(date: string) {
  return new Date(`${date}T00:00:00.000Z`);
}

function parse<T extends z.ZodType>(schema: T, input: unknown): z.output<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    const message = result.error.issues
      .map((issue) => (issue.path.length ? `${issue.path.join(".")}: ${issue.message}` : issue.message))
      .join("; ");
    throw new EventValidationError(message);
  }
  return result.data;
}

async function assertPlacesExist(tx: Tx, placeIds: (string | null)[]) {
  const ids = [...new Set(placeIds.filter((id): id is string => !!id))];
  if (ids.length === 0) return;
  const found = await tx.place.count({ where: { id: { in: ids } } });
  if (found !== ids.length) throw new EventValidationError("Alguno de los lugares indicados no existe.");
}

async function assertOrganizersExist(tx: Tx, organizerIds: string[]) {
  const ids = [...new Set(organizerIds)];
  if (ids.length === 0) return;
  const found = await tx.organizer.count({ where: { id: { in: ids } } });
  if (found !== ids.length) throw new EventValidationError("Alguno de los organizadores indicados no existe.");
}

function toOccurrenceData(o: ParsedOccurrence) {
  return {
    date: toUtcDate(o.date),
    timeStart: o.timeStart,
    timeEnd: o.timeEnd,
    placeId: o.placeId,
    // Si ya tiene lugar asignado, el texto de la fuente no hace falta
    placeText: o.placeId ? null : o.placeText,
  };
}

/**
 * Recalcula missingFields y, si corresponde, el estado.
 * Un evento publicado no puede quedar incompleto: hay que pasarlo a borrador antes.
 */
async function syncCompleteness(tx: Tx, eventId: string) {
  const event = await tx.event.findUniqueOrThrow({
    where: { id: eventId },
    select: { status: true, priceType: true, occurrences: { select: { placeId: true } } },
  });
  const missing = getMissingFields(event);

  if (event.status === EventStatus.PUBLISHED && missing.length > 0) {
    throw new EventValidationError(
      `Un evento publicado no puede quedar sin: ${describeMissing(missing)}. Pasalo a borrador primero.`
    );
  }

  const status =
    event.status === EventStatus.DRAFT || event.status === EventStatus.INCOMPLETE
      ? draftStatusFor(missing)
      : event.status;

  return tx.event.update({
    where: { id: eventId },
    data: { missingFields: missing, status },
    include: { occurrences: { include: { place: true } }, organizers: true },
  });
}

// ─────────────────────────────────────────────
// Evento
// ─────────────────────────────────────────────

/** Crea un evento con sus fechas. Por defecto queda como borrador (DRAFT o INCOMPLETE). */
export async function createEvent(input: CreateEventInput) {
  const { occurrences, organizerIds, publish, ...fields } = parse(createEventSchema, input);
  const missing = getMissingFields({ priceType: fields.priceType ?? null, occurrences });

  if (publish && missing.length > 0) {
    throw new EventValidationError(`No se puede publicar, falta: ${describeMissing(missing)}.`);
  }

  return prisma.$transaction(async (tx) => {
    await assertPlacesExist(tx, occurrences.map((o) => o.placeId));
    await assertOrganizersExist(tx, organizerIds);

    return tx.event.create({
      data: {
        ...fields,
        status: publish ? EventStatus.PUBLISHED : draftStatusFor(missing),
        publishedAt: publish ? new Date() : null,
        missingFields: missing,
        occurrences: { create: occurrences.map(toOccurrenceData) },
        organizers: { create: organizerIds.map((organizerId) => ({ organizerId })) },
      },
      include: { occurrences: { include: { place: true } }, organizers: true },
    });
  });
}

/**
 * Actualiza campos del evento. Solo cambia lo que viene definido.
 * Si viene `occurrences`, reemplaza todas las fechas.
 */
export async function updateEvent(id: string, input: UpdateEventInput) {
  const { occurrences, organizerIds, ...fields } = parse(updateEventSchema, input);

  return prisma.$transaction(async (tx) => {
    if (occurrences) await assertPlacesExist(tx, occurrences.map((o) => o.placeId));
    if (organizerIds) await assertOrganizersExist(tx, organizerIds);

    await tx.event.update({
      where: { id },
      data: {
        ...fields,
        organizers: organizerIds
          ? { deleteMany: {}, create: organizerIds.map((organizerId) => ({ organizerId })) }
          : undefined,
        occurrences: occurrences
          ? { deleteMany: {}, create: occurrences.map(toOccurrenceData) }
          : undefined,
      },
    });

    return syncCompleteness(tx, id);
  });
}

/** Publica un borrador. Falla si le faltan datos obligatorios. */
export async function publishEvent(id: string) {
  return prisma.$transaction(async (tx) => {
    const event = await tx.event.findUniqueOrThrow({
      where: { id },
      select: { priceType: true, publishedAt: true, occurrences: { select: { placeId: true } } },
    });
    const missing = getMissingFields(event);
    if (missing.length > 0) {
      throw new EventValidationError(`No se puede publicar, falta: ${describeMissing(missing)}.`);
    }
    return tx.event.update({
      where: { id },
      data: { status: EventStatus.PUBLISHED, publishedAt: event.publishedAt ?? new Date(), missingFields: [] },
    });
  });
}

/** Saca el evento de la app y lo devuelve a borrador (DRAFT o INCOMPLETE). */
export async function unpublishEvent(id: string) {
  return prisma.$transaction(async (tx) => {
    await tx.event.update({ where: { id }, data: { status: EventStatus.DRAFT } });
    return syncCompleteness(tx, id);
  });
}

/** Oculta el evento sin borrarlo. */
export async function archiveEvent(id: string) {
  return prisma.event.update({ where: { id }, data: { status: EventStatus.ARCHIVED } });
}

/** Borra el evento y todas sus fechas. Solo desde el admin web. */
export async function deleteEvent(id: string) {
  return prisma.event.delete({ where: { id } });
}

// ─────────────────────────────────────────────
// Fechas individuales
// ─────────────────────────────────────────────

export async function addOccurrence(eventId: string, input: OccurrenceInput) {
  const occurrence = parse(occurrenceInputSchema, input);
  return prisma.$transaction(async (tx) => {
    await assertPlacesExist(tx, [occurrence.placeId]);
    await tx.eventOccurrence.create({ data: { eventId, ...toOccurrenceData(occurrence) } });
    return syncCompleteness(tx, eventId);
  });
}

export async function updateOccurrence(id: string, input: OccurrenceUpdateInput) {
  const { date, placeId, ...rest } = parse(occurrenceUpdateSchema, input);
  return prisma.$transaction(async (tx) => {
    if (placeId) await assertPlacesExist(tx, [placeId]);
    const occurrence = await tx.eventOccurrence.update({
      where: { id },
      data: {
        ...rest,
        date: date ? toUtcDate(date) : undefined,
        placeId,
        // Al asignar un lugar real, el texto de la fuente deja de hacer falta
        ...(placeId ? { placeText: null } : {}),
      },
    });
    return syncCompleteness(tx, occurrence.eventId);
  });
}

export async function deleteOccurrence(id: string) {
  return prisma.$transaction(async (tx) => {
    const occurrence = await tx.eventOccurrence.delete({ where: { id } });
    return syncCompleteness(tx, occurrence.eventId);
  });
}
