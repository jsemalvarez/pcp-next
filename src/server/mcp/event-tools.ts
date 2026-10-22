import type { McpServer } from "@modelcontextprotocol/server";
import { ActivityType, EventStatus, Prisma, PriceType } from "@prisma/client";
import { z } from "zod";
import * as eventService from "@/server/events/event.service";
import { EventValidationError } from "@/server/events/event.service";
import { getEventForAdmin, listIncompleteEvents, searchEvents } from "@/server/events/event.queries";
import {
  getWarnings,
  MISSING_FIELD_LABELS,
  WARNING_LABELS,
  type EventWarning,
  type MissingField,
} from "@/server/events/event.completeness";
import { revalidateEvents } from "@/server/events/event.revalidate";
import { searchPlaces } from "@/server/places/place.queries";
import { searchOrganizers } from "@/server/organizers/organizer.queries";
import { EVENT_PRICES, EVENT_TYPES } from "@/presentation/constants/event-filters";

/**
 * Tools MCP de eventos, lugares y organizadores.
 * Son adaptadores finos: validan la forma de la entrada para la IA y delegan
 * en los servicios, que vuelven a validar y aplican las reglas de negocio.
 */

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.paseosconpeques.com.ar").replace(/\/$/, "");

// ─────────────────────────────────────────────
// Esquemas de entrada (sin transforms: se convierten a JSON Schema para la IA)
// ─────────────────────────────────────────────

const id = z.string().uuid();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Fecha de calendario YYYY-MM-DD (hora de Argentina)");
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).describe("Hora HH:mm en 24 hs");
const priceType = z
  .enum(PriceType)
  .nullable()
  .describe("Tipo de precio. null si la fuente no lo dice: no lo inventes.");

const occurrence = z.object({
  date,
  timeStart: time,
  timeEnd: time.nullable().optional(),
  placeId: id.nullable().optional().describe("Id de un lugar existente (buscalo con search_places)"),
  placeText: z
    .string()
    .max(200)
    .nullable()
    .optional()
    .describe("Si el lugar no está cargado, el nombre tal como aparece en la fuente"),
});

const eventFields = {
  description: z.string().max(5000).nullable().optional(),
  priceType: priceType.optional(),
  activityTypes: z.array(z.enum(ActivityType)).optional(),
  ageMin: z.number().min(0).max(99).optional().describe("Edad mínima en años (0 = todas las edades)"),
  ageMax: z.number().min(0).max(99).nullable().optional(),
  ticketUrl: z.string().nullable().optional().describe("Link de venta de entradas (http/https)"),
  bookingWhatsapp: z.string().max(50).nullable().optional().describe("WhatsApp para reservas, ej. +5492231234567"),
  organizerIds: z.array(id).optional().describe("Ids de organizadores existentes (buscalos con search_organizers)"),
  sourceUrl: z.string().nullable().optional().describe("Link al post de origen (ej. Instagram)"),
  sourceText: z.string().max(10000).nullable().optional().describe("Texto original del post, sin resumir"),
  internalNotes: z
    .string()
    .max(5000)
    .nullable()
    .optional()
    .describe("Notas internas: qué falta confirmar, a quién contactar. No se muestran en la app."),
};

// ─────────────────────────────────────────────
// Formato de salida
// ─────────────────────────────────────────────

type EventWithRelations = Prisma.EventGetPayload<{
  include: { occurrences: { include: { place: true } }; organizers: { include: { organizer: true } } };
}>;

function formatEvent(event: EventWithRelations) {
  const warnings = getWarnings({
    ...event,
    occurrences: event.occurrences,
    organizerCount: event.organizers.length,
  });
  return {
    id: event.id,
    title: event.title,
    status: event.status,
    missingToPublish: event.missingFields.map((f) => MISSING_FIELD_LABELS[f as MissingField] ?? f),
    recommendedToComplete: warnings.map((w: EventWarning) => WARNING_LABELS[w]),
    description: event.description,
    priceType: event.priceType,
    activityTypes: event.activityTypes,
    ageMin: event.ageMin,
    ageMax: event.ageMax,
    ticketUrl: event.ticketUrl,
    bookingWhatsapp: event.bookingWhatsapp,
    hasPhoto: !!event.photoId,
    isFeatured: event.isFeatured,
    occurrences: event.occurrences.map((o) => ({
      id: o.id,
      date: o.date.toISOString().slice(0, 10),
      timeStart: o.timeStart,
      timeEnd: o.timeEnd,
      place: o.place ? { id: o.place.id, name: o.place.name, address: o.place.address } : null,
      placeText: o.placeText,
    })),
    organizers: event.organizers.map((eo) => ({ id: eo.organizer.id, name: eo.organizer.name })),
    sourceUrl: event.sourceUrl,
    internalNotes: event.internalNotes,
    adminUrl: `${SITE_URL}/admin/eventos/${event.id}`,
  };
}

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function fail(message: string) {
  return { isError: true, content: [{ type: "text" as const, text: message }] };
}

/** Ejecuta la tool y traduce errores a mensajes útiles sin filtrar detalles internos */
async function run(tool: string, args: unknown, fn: () => Promise<ReturnType<typeof json>>) {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof EventValidationError) return fail(error.message);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return fail("No existe un registro con ese id.");
    }
    console.error(`[mcp:${tool}] Error`, { args, error });
    return fail("Error interno al ejecutar la herramienta.");
  }
}

async function loadEvent(eventId: string) {
  const event = await getEventForAdmin(eventId);
  if (!event) throw new EventValidationError("No existe un evento con ese id.");
  return event;
}

/** Escritura + revalidación + respuesta con el evento actualizado */
async function writeAndReturn(tool: string, args: unknown, write: () => Promise<{ id: string }>) {
  return run(tool, args, async () => {
    const { id: eventId } = await write();
    console.info(`[mcp:${tool}] evento ${eventId}`);
    revalidateEvents(eventId);
    return json(formatEvent(await loadEvent(eventId)));
  });
}

/** Hoy en Argentina (UTC-3), para que la IA resuelva "el sábado", "mañana", etc. */
function todayInArgentina() {
  return new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

// ─────────────────────────────────────────────
// Registro
// ─────────────────────────────────────────────

export function registerEventTools(server: McpServer) {
  server.registerTool(
    "get_catalogs",
    {
      title: "Catálogos y fecha de hoy",
      description:
        "Devuelve los valores válidos de tipo de precio, tipo de actividad y estados, más la fecha de hoy en Argentina. Llamala antes de crear o editar eventos.",
      annotations: { readOnlyHint: true },
    },
    async () =>
      json({
        today: todayInArgentina(),
        timezone: "America/Argentina/Buenos_Aires",
        priceTypes: EVENT_PRICES,
        activityTypes: EVENT_TYPES,
        statuses: {
          DRAFT: "Borrador completo, listo para publicar",
          INCOMPLETE: "Borrador con datos obligatorios faltantes",
          PUBLISHED: "Visible en la app",
          ARCHIVED: "Oculto",
        },
        requiredToPublish: Object.values(MISSING_FIELD_LABELS),
        recommended: Object.values(WARNING_LABELS),
      })
  );

  server.registerTool(
    "search_events",
    {
      title: "Buscar eventos",
      description:
        "Busca eventos (incluye borradores) por texto, estado, rango de fechas, lugar u organizador. Devuelve los más recientes primero.",
      inputSchema: z.object({
        query: z.string().optional().describe("Texto en título, descripción, texto de la fuente o lugar"),
        status: z.enum(EventStatus).optional(),
        from: date.optional().describe("Con alguna fecha desde este día (inclusive)"),
        to: date.optional().describe("Con alguna fecha hasta este día (inclusive)"),
        placeId: id.optional(),
        organizerId: id.optional(),
        limit: z.number().int().min(1).max(50).optional(),
      }),
      annotations: { readOnlyHint: true },
    },
    async (args) =>
      run("search_events", args, async () => {
        const events = await searchEvents({ ...args, text: args.query });
        return json({ count: events.length, events: events.map(formatEvent) });
      })
  );

  server.registerTool(
    "get_event",
    {
      title: "Ver evento",
      description: "Detalle completo de un evento: fechas, lugar, organizadores, faltantes y notas internas.",
      inputSchema: z.object({ id }),
      annotations: { readOnlyHint: true },
    },
    async (args) => run("get_event", args, async () => json(formatEvent(await loadEvent(args.id))))
  );

  server.registerTool(
    "list_incomplete_events",
    {
      title: "Borradores incompletos",
      description:
        "Lista los borradores con datos obligatorios faltantes, con los contactos del lugar y de los organizadores para pedirles lo que falta.",
      inputSchema: z.object({ limit: z.number().int().min(1).max(100).optional() }),
      annotations: { readOnlyHint: true },
    },
    async (args) =>
      run("list_incomplete_events", args, async () => {
        const events = await listIncompleteEvents(args.limit);
        return json({
          count: events.length,
          events: events.map((event) => ({
            ...formatEvent(event),
            contacts: {
              places: event.occurrences
                .filter((o) => o.place)
                .map((o) => ({
                  name: o.place!.name,
                  phone: o.place!.phone,
                  whatsapp: o.place!.whatsapp,
                  instagram: o.place!.instagram,
                })),
              organizers: event.organizers.map(({ organizer }) => ({
                name: organizer.name,
                phone: organizer.phone,
                whatsapp: organizer.whatsapp,
                instagram: organizer.instagram,
                email: organizer.email,
              })),
            },
          })),
        });
      })
  );

  server.registerTool(
    "create_event_draft",
    {
      title: "Crear borrador de evento",
      description:
        "Crea un evento SIEMPRE como borrador (nunca se publica desde acá). Si faltan datos obligatorios queda como INCOMPLETE. " +
        "Antes buscá el lugar con search_places y los organizadores con search_organizers; si el lugar no existe, usá placeText. " +
        "Guardá el texto original del post en sourceText y el link en sourceUrl.",
      inputSchema: z.object({
        title: z.string().min(1).max(200),
        ...eventFields,
        occurrences: z.array(occurrence).optional().describe("Fechas del evento"),
      }),
    },
    async (args) => writeAndReturn("create_event_draft", args, () => eventService.createEvent({ ...args, publish: false }))
  );

  server.registerTool(
    "update_event",
    {
      title: "Editar evento",
      description:
        "Edita campos de un evento. Solo cambia lo que mandes. Si mandás `occurrences`, REEMPLAZA todas las fechas; " +
        "para tocar una sola fecha usá add_occurrence / update_occurrence / delete_occurrence. " +
        "Un evento publicado no puede quedar sin datos obligatorios.",
      inputSchema: z.object({
        id,
        title: z.string().min(1).max(200).optional(),
        ...eventFields,
        occurrences: z.array(occurrence).optional(),
      }),
      annotations: { idempotentHint: true },
    },
    async ({ id: eventId, ...data }) =>
      writeAndReturn("update_event", { id: eventId, ...data }, () => eventService.updateEvent(eventId, data))
  );

  server.registerTool(
    "add_occurrence",
    {
      title: "Agregar fecha",
      description: "Agrega una fecha a un evento existente.",
      inputSchema: z.object({ eventId: id, ...occurrence.shape }),
    },
    async ({ eventId, ...data }) =>
      writeAndReturn("add_occurrence", { eventId, ...data }, () => eventService.addOccurrence(eventId, data))
  );

  server.registerTool(
    "update_occurrence",
    {
      title: "Editar fecha",
      description: "Cambia día, horario o lugar de una fecha puntual (usá el id de la fecha, no el del evento).",
      inputSchema: z.object({
        id: id.describe("Id de la fecha (occurrences[].id)"),
        date: date.optional(),
        timeStart: time.optional(),
        timeEnd: time.nullable().optional(),
        placeId: id.nullable().optional(),
        placeText: z.string().max(200).nullable().optional(),
      }),
      annotations: { idempotentHint: true },
    },
    async ({ id: occurrenceId, ...data }) =>
      writeAndReturn("update_occurrence", { id: occurrenceId, ...data }, () =>
        eventService.updateOccurrence(occurrenceId, data)
      )
  );

  server.registerTool(
    "delete_occurrence",
    {
      title: "Borrar fecha",
      description: "Borra una fecha puntual de un evento.",
      inputSchema: z.object({ id: id.describe("Id de la fecha (occurrences[].id)") }),
      annotations: { destructiveHint: true },
    },
    async (args) => writeAndReturn("delete_occurrence", args, () => eventService.deleteOccurrence(args.id))
  );

  server.registerTool(
    "publish_event",
    {
      title: "Publicar evento",
      description:
        "Publica un borrador: pasa a verse en la app. Usala SOLO cuando el usuario lo pida explícitamente. Falla si faltan datos obligatorios.",
      inputSchema: z.object({ id }),
      annotations: { idempotentHint: true },
    },
    async (args) => writeAndReturn("publish_event", args, () => eventService.publishEvent(args.id))
  );

  server.registerTool(
    "unpublish_event",
    {
      title: "Pasar a borrador",
      description: "Saca un evento publicado de la app y lo vuelve a borrador.",
      inputSchema: z.object({ id }),
      annotations: { idempotentHint: true },
    },
    async (args) => writeAndReturn("unpublish_event", args, () => eventService.unpublishEvent(args.id))
  );

  server.registerTool(
    "archive_event",
    {
      title: "Archivar evento",
      description:
        "Oculta un evento sin borrarlo (los eventos no se borran desde el MCP; el borrado definitivo es solo desde el admin web).",
      inputSchema: z.object({ id }),
      annotations: { idempotentHint: true },
    },
    async (args) => writeAndReturn("archive_event", args, () => eventService.archiveEvent(args.id))
  );

  server.registerTool(
    "search_places",
    {
      title: "Buscar lugares",
      description: "Busca lugares cargados por nombre o dirección, para asignarlos a las fechas de un evento.",
      inputSchema: z.object({
        query: z.string().describe("Nombre o dirección, ej. 'Teatro Colón' o 'Güemes'"),
        limit: z.number().int().min(1).max(50).optional(),
      }),
      annotations: { readOnlyHint: true },
    },
    async (args) =>
      run("search_places", args, async () => {
        const places = await searchPlaces(args.query, args.limit);
        return json({ count: places.length, places });
      })
  );

  server.registerTool(
    "search_organizers",
    {
      title: "Buscar organizadores",
      description: "Busca organizadores / artistas cargados por nombre o Instagram, para vincularlos a un evento.",
      inputSchema: z.object({
        query: z.string(),
        limit: z.number().int().min(1).max(50).optional(),
      }),
      annotations: { readOnlyHint: true },
    },
    async (args) =>
      run("search_organizers", args, async () => {
        const organizers = await searchOrganizers(args.query, args.limit);
        return json({ count: organizers.length, organizers });
      })
  );
}
