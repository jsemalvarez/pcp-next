import prisma from "@/data/prisma/db";

/** Búsqueda de organizadores / artistas por nombre o redes (admin / MCP) */
export async function searchOrganizers(text: string, limit = 10) {
  const contains = { contains: text.trim(), mode: "insensitive" as const };
  return prisma.organizer.findMany({
    where: text.trim()
      ? { OR: [{ name: contains }, { instagram: contains }, { slug: contains }] }
      : undefined,
    select: {
      id: true,
      name: true,
      slug: true,
      type: { select: { name: true } },
      phone: true,
      whatsapp: true,
      instagram: true,
      email: true,
    },
    orderBy: { name: "asc" },
    take: Math.min(Math.max(limit, 1), 50),
  });
}

export async function getOrganizerById(id: string) {
  return prisma.organizer.findUnique({ where: { id }, include: { type: { select: { id: true, name: true } } } });
}

export async function listOrganizerTypes() {
  return prisma.organizerType.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
}
