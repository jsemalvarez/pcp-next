import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import prisma from "@/data/prisma/db";
import * as organizerService from "@/server/organizers/organizer.service";
import { getOrganizerById, searchOrganizers } from "@/server/organizers/organizer.queries";
import { revalidateOrganizers } from "@/server/organizers/organizer.revalidate";
import { recordAudit } from "@/server/audit/audit.service";
import { siteUrl } from "@/server/oauth/oauth.config";
import { actorFrom, fail, idSchema as id, json, omit, run } from "./mcp.shared";

/**
 * Tools MCP de organizadores / artistas. No hay borrado desde el MCP.
 */

const text = (max: number) => z.string().max(max).nullable().optional();

const organizerFields = {
  typeId: id.describe("Tipo de organizador (ver get_catalogs.organizerTypes)"),
  description: text(5000),
  phone: text(50),
  whatsapp: text(50).describe("Ej. +5492231234567"),
  instagram: text(300).describe("Usuario o link, ej. @pepeelmago"),
  facebook: text(300),
  youtube: text(300),
  spotify: text(300),
  tiktok: text(300),
  web: text(300),
  email: text(200),
};

type OrganizerWithType = NonNullable<Awaited<ReturnType<typeof getOrganizerById>>>;

function formatOrganizer(organizer: OrganizerWithType) {
  return {
    ...omit(organizer, "createdAt", "updatedAt"),
    profileUrl: `${siteUrl()}/perfil/${organizer.slug}`,
    adminUrl: `${siteUrl()}/admin/organizers/${organizer.id}`,
  };
}

/** Foto del organizador para el historial (sin el tipo expandido) */
function organizerSnapshot(organizer: OrganizerWithType) {
  return omit(organizer, "type");
}

async function loadOrganizer(organizerId: string) {
  const organizer = await getOrganizerById(organizerId);
  if (!organizer) throw new Error(`Organizador ${organizerId} no encontrado después de escribirlo`);
  return organizer;
}

export function registerOrganizerTools(server: McpServer) {
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

  server.registerTool(
    "get_organizer",
    {
      title: "Ver organizador",
      description: "Detalle completo de un organizador / artista: tipo, contacto, redes y link al perfil público.",
      inputSchema: z.object({ id }),
      annotations: { readOnlyHint: true },
    },
    async (args) =>
      run("get_organizer", args, async () => {
        const organizer = await getOrganizerById(args.id);
        return organizer ? json(formatOrganizer(organizer)) : fail("No existe un organizador con ese id.");
      })
  );

  server.registerTool(
    "create_organizer",
    {
      title: "Crear organizador",
      description:
        "Da de alta un organizador / artista (tiene perfil público en /perfil/<slug>). " +
        "Antes buscalo con search_organizers (por nombre y por Instagram) para no duplicarlo. " +
        "El typeId sale de get_catalogs.organizerTypes.",
      inputSchema: z.object({
        name: z.string().min(1).max(200),
        ...organizerFields,
        allowDuplicateName: z
          .boolean()
          .optional()
          .describe("true solo si el usuario confirmó que es otro organizador con el mismo nombre"),
      }),
    },
    async ({ allowDuplicateName, ...data }, ctx) =>
      run("create_organizer", data, async () => {
        if (!allowDuplicateName) {
          const instagram = data.instagram?.trim();
          const existing = await prisma.organizer.findFirst({
            where: {
              OR: [
                { name: { equals: data.name.trim(), mode: "insensitive" } },
                ...(instagram ? [{ instagram: { equals: instagram, mode: "insensitive" as const } }] : []),
              ],
            },
            select: { id: true, name: true, instagram: true },
          });
          if (existing) {
            return fail(
              `Ya existe un organizador parecido: ${existing.name}${existing.instagram ? ` (${existing.instagram})` : ""}, id ${existing.id}. ` +
                "Usá ese id, o mandá allowDuplicateName: true si el usuario confirma que es otro."
            );
          }
        }

        const { id: organizerId } = await organizerService.createOrganizer(data);
        const organizer = await loadOrganizer(organizerId);
        revalidateOrganizers(organizer.slug);
        await recordAudit({
          actor: actorFrom(ctx),
          action: "create_organizer",
          entityType: "organizer",
          entityId: organizer.id,
          input: data,
          after: organizerSnapshot(organizer),
        });
        return json(formatOrganizer(organizer));
      })
  );

  server.registerTool(
    "update_organizer",
    {
      title: "Editar organizador",
      description:
        "Edita un organizador / artista. Solo cambia lo que mandes. El nombre se puede cambiar sin romper el link del perfil (el slug no cambia).",
      inputSchema: z.object({
        id,
        name: z.string().min(1).max(200).optional(),
        ...organizerFields,
        typeId: organizerFields.typeId.optional(),
      }),
      annotations: { idempotentHint: true },
    },
    async ({ id: organizerId, ...data }, ctx) =>
      run("update_organizer", { id: organizerId, ...data }, async () => {
        const before = await getOrganizerById(organizerId);
        if (!before) return fail("No existe un organizador con ese id.");

        await organizerService.updateOrganizer(organizerId, data);
        const organizer = await loadOrganizer(organizerId);
        revalidateOrganizers(organizer.slug);
        await recordAudit({
          actor: actorFrom(ctx),
          action: "update_organizer",
          entityType: "organizer",
          entityId: organizer.id,
          input: { id: organizerId, ...data },
          before: organizerSnapshot(before),
          after: organizerSnapshot(organizer),
        });
        return json(formatOrganizer(organizer));
      })
  );
}
