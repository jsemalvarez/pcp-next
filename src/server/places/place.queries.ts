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
