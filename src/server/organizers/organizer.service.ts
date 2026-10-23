import prisma from "@/data/prisma/db";
import { parseInput, ValidationError } from "@/server/shared/validation";
import {
  createOrganizerSchema,
  updateOrganizerSchema,
  type CreateOrganizerInput,
  type UpdateOrganizerInput,
} from "./organizer.schemas";

/**
 * Escrituras de organizadores / artistas. Lo usan las server actions del admin y el MCP.
 * No verifica permisos: eso es responsabilidad de quien lo llama.
 */

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

/** Slug único para el perfil público (/perfil/<slug>); agrega -1, -2… si ya existe */
async function generateUniqueSlug(name: string, excludeId?: string) {
  const baseSlug = slugify(name) || "organizador";
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.organizer.findFirst({ where: { slug, id: excludeId ? { not: excludeId } : undefined } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

async function assertTypeExists(typeId: string) {
  const type = await prisma.organizerType.findUnique({ where: { id: typeId }, select: { id: true } });
  if (!type) throw new ValidationError("El tipo de organizador indicado no existe.");
}

export async function createOrganizer(input: CreateOrganizerInput) {
  const { slug, ...data } = parseInput(createOrganizerSchema, input);
  await assertTypeExists(data.typeId);
  return prisma.organizer.create({
    data: { ...data, slug: await generateUniqueSlug(slug || data.name) },
  });
}

/**
 * Solo cambia lo que viene definido. El slug se mantiene salvo que se mande uno nuevo
 * (cambiarlo rompe los links ya compartidos al perfil).
 */
export async function updateOrganizer(id: string, input: UpdateOrganizerInput) {
  const { slug, ...data } = parseInput(updateOrganizerSchema, input);
  if (data.typeId) await assertTypeExists(data.typeId);
  return prisma.organizer.update({
    where: { id },
    data: { ...data, slug: slug ? await generateUniqueSlug(slug, id) : undefined },
  });
}

/** Solo desde el admin web */
export async function deleteOrganizer(id: string) {
  return prisma.organizer.delete({ where: { id } });
}
