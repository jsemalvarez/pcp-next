import prisma from "@/data/prisma/db";

/** Búsqueda de lugares por nombre o dirección (admin / MCP). Incluye inactivos. */
export async function searchPlaces(text: string, limit = 10) {
  const contains = { contains: text.trim(), mode: "insensitive" as const };
  return prisma.place.findMany({
    where: text.trim() ? { OR: [{ name: contains }, { address: contains }] } : undefined,
    select: {
      id: true,
      name: true,
      address: true,
      isActive: true,
      phone: true,
      whatsapp: true,
      instagram: true,
      web: true,
    },
    orderBy: { name: "asc" },
    take: Math.min(Math.max(limit, 1), 50),
  });
}

export async function getPlaceById(id: string) {
  return prisma.place.findUnique({ where: { id } });
}

/**
 * Fechas de eventos (no archivados) que todavía no tienen lugar asignado y cuyo texto
 * de la fuente se parece al nombre del lugar. Sirve para ofrecer asignarlas al crear un lugar.
 */
export async function findOccurrencesMatchingPlaceText(placeName: string, limit = 20) {
  const name = placeName.trim();
  if (!name) return [];
  return prisma.eventOccurrence.findMany({
    where: {
      placeId: null,
      placeText: { contains: name, mode: "insensitive" },
      event: { status: { not: "ARCHIVED" } },
    },
    select: {
      id: true,
      date: true,
      timeStart: true,
      placeText: true,
      event: { select: { id: true, title: true, status: true } },
    },
    orderBy: { date: "asc" },
    take: limit,
  });
}
