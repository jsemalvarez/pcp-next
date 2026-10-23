import type { McpServer } from "@modelcontextprotocol/server";
import { PlaceCategory, type Place } from "@prisma/client";
import { z } from "zod";
import prisma from "@/data/prisma/db";
import * as placeService from "@/server/places/place.service";
import { findOccurrencesMatchingPlaceText, getPlaceById, searchPlaces } from "@/server/places/place.queries";
import { geocodeAddress, mapsUrl } from "@/server/places/place.geocoding";
import { revalidatePlaces } from "@/server/places/place.revalidate";
import { recordAudit } from "@/server/audit/audit.service";
import { siteUrl } from "@/server/oauth/oauth.config";
import { ValidationError } from "@/server/shared/validation";
import { actorFrom, fail, idSchema as id, json, omit, run } from "./mcp.shared";

/**
 * Tools MCP de lugares. No hay borrado: un lugar que ya no va se desactiva (isActive: false).
 * Las coordenadas salen de geocodificar la dirección si la IA no las manda.
 */

// ─────────────────────────────────────────────
// Esquemas de entrada (sin transforms: se convierten a JSON Schema para la IA)
// ─────────────────────────────────────────────

const text = (max: number) => z.string().max(max).nullable().optional();

const placeFields = {
  address: z
    .string()
    .min(1)
    .max(300)
    .describe("Calle y número con la ciudad, ej. 'Güemes 2955, Mar del Plata'"),
  lat: z.number().min(-90).max(90).optional().describe("Solo si la sabés con certeza; si no, se calcula desde la dirección"),
  lng: z.number().min(-180).max(180).optional(),
  description: text(5000),
  schedules: text(2000).describe("Días y horarios de atención, texto libre"),
  phone: text(50),
  whatsapp: text(50).describe("Ej. +5492231234567"),
  web: text(300),
  instagram: text(300).describe("Usuario o link, ej. @teatrocolonmdp"),
  facebook: text(300),
  categories: z.array(z.enum(PlaceCategory)).optional().describe("Ver get_catalogs.placeCategories"),
  ageMin: z.number().min(0).max(99).optional(),
  ageMax: z.number().min(0).max(99).nullable().optional(),
  hasFood: z.boolean().optional().describe("Tiene algo para comer"),
  hasShow: z.boolean().optional().describe("Tiene shows"),
  hasGames: z.boolean().optional().describe("Tiene juegos"),
  hasSupervision: z.boolean().optional().describe("Hay alguien que cuida a los chicos"),
  isShowInMap: z
    .boolean()
    .optional()
    .describe("Si aparece en el mapa de lugares de la app. Al crear, por defecto false: queda solo para eventos hasta que lo revisen."),
  isActive: z.boolean().optional().describe("false = lugar dado de baja (no se borra)"),
};

// ─────────────────────────────────────────────
// Formato de salida
// ─────────────────────────────────────────────

function formatPlace(place: Place) {
  return {
    ...omit(place, "createdAt", "updatedAt"),
    mapsUrl: mapsUrl(place.lat, place.lng),
    adminUrl: `${siteUrl()}/admin/lugares/${place.id}`,
  };
}

/** Coordenadas: las que mandó la IA o las de geocodificar la dirección */
async function resolveCoordinates(address: string, lat?: number, lng?: number) {
  if (lat !== undefined && lng !== undefined) return { lat, lng, geocodedAs: null };
  if (lat !== undefined || lng !== undefined) {
    throw new ValidationError("Mandá lat y lng juntos, o ninguno para calcularlos desde la dirección.");
  }
  const result = await geocodeAddress(address);
  if (!result) {
    throw new ValidationError(
      "No pude ubicar la dirección en el mapa. Probá con una dirección más completa (calle, número y ciudad) o mandá lat y lng."
    );
  }
  return { lat: result.lat, lng: result.lng, geocodedAs: result.displayName };
}

// ─────────────────────────────────────────────
// Registro
// ─────────────────────────────────────────────

export function registerPlaceTools(server: McpServer) {
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
    "get_place",
    {
      title: "Ver lugar",
      description: "Detalle completo de un lugar: dirección, coordenadas, contacto, características y visibilidad.",
      inputSchema: z.object({ id }),
      annotations: { readOnlyHint: true },
    },
    async (args) =>
      run("get_place", args, async () => {
        const place = await getPlaceById(args.id);
        return place ? json(formatPlace(place)) : fail("No existe un lugar con ese id.");
      })
  );

  server.registerTool(
    "create_place",
    {
      title: "Crear lugar",
      description:
        "Da de alta un lugar nuevo. Antes buscalo con search_places para no duplicarlo. " +
        "Si no mandás lat/lng se calculan desde la dirección: mostrale al usuario `geocodedAs` y `mapsUrl` para que confirme la ubicación. " +
        "La respuesta incluye las fechas de eventos sin lugar cuyo texto coincide (`pendingOccurrences`): ofrecé asignarlas con update_occurrence.",
      inputSchema: z.object({
        name: z.string().min(1).max(200),
        ...placeFields,
        allowDuplicateName: z
          .boolean()
          .optional()
          .describe("true solo si el usuario confirmó que es otro lugar con el mismo nombre"),
      }),
    },
    async ({ allowDuplicateName, lat, lng, ...data }, ctx) =>
      run("create_place", data, async () => {
        if (!allowDuplicateName) {
          const existing = await prisma.place.findFirst({
            where: { name: { equals: data.name.trim(), mode: "insensitive" } },
            select: { id: true, name: true, address: true },
          });
          if (existing) {
            return fail(
              `Ya existe un lugar con ese nombre: ${existing.name} (${existing.address}), id ${existing.id}. ` +
                "Usá ese id, o mandá allowDuplicateName: true si el usuario confirma que es otro lugar."
            );
          }
        }

        const coordinates = await resolveCoordinates(data.address, lat, lng);
        const place = await placeService.createPlace({
          ...data,
          lat: coordinates.lat,
          lng: coordinates.lng,
          isShowInMap: data.isShowInMap ?? false,
        });
        revalidatePlaces(place.id);
        await recordAudit({
          actor: actorFrom(ctx),
          action: "create_place",
          entityType: "place",
          entityId: place.id,
          input: { ...data, lat, lng },
          after: place,
        });

        const pending = await findOccurrencesMatchingPlaceText(place.name);
        return json({
          ...formatPlace(place),
          geocodedAs: coordinates.geocodedAs,
          pendingOccurrences: pending.map((o) => ({
            occurrenceId: o.id,
            date: o.date.toISOString().slice(0, 10),
            timeStart: o.timeStart,
            placeText: o.placeText,
            event: o.event,
          })),
        });
      })
  );

  server.registerTool(
    "update_place",
    {
      title: "Editar lugar",
      description:
        "Edita un lugar. Solo cambia lo que mandes. Si cambiás la dirección sin mandar lat/lng, se vuelven a calcular: " +
        "mostrale al usuario `geocodedAs` y `mapsUrl` para que confirme. Para dar de baja un lugar usá isActive: false.",
      inputSchema: z.object({
        id,
        name: z.string().min(1).max(200).optional(),
        ...placeFields,
        address: placeFields.address.optional(),
      }),
      annotations: { idempotentHint: true },
    },
    async ({ id: placeId, lat, lng, ...data }, ctx) =>
      run("update_place", { id: placeId, ...data }, async () => {
        const before = await getPlaceById(placeId);
        if (!before) return fail("No existe un lugar con ese id.");

        let coordinates: { lat?: number; lng?: number; geocodedAs: string | null } = { lat, lng, geocodedAs: null };
        if (data.address && data.address.trim() !== before.address) {
          coordinates = await resolveCoordinates(data.address, lat, lng);
        } else if (lat !== undefined || lng !== undefined) {
          coordinates = await resolveCoordinates(before.address, lat, lng);
        }

        const place = await placeService.updatePlace(placeId, { ...data, lat: coordinates.lat, lng: coordinates.lng });
        revalidatePlaces(place.id);
        await recordAudit({
          actor: actorFrom(ctx),
          action: "update_place",
          entityType: "place",
          entityId: place.id,
          input: { id: placeId, ...data, lat, lng },
          before,
          after: place,
        });
        return json({ ...formatPlace(place), geocodedAs: coordinates.geocodedAs });
      })
  );
}
