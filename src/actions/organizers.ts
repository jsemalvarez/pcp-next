"use server";

import prisma from "@/data/prisma/db";
import { revalidatePath } from "next/cache";

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

// Generar un slug único para el organizador
async function generateUniqueSlug(name: string, excludeId?: string) {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.organizer.findFirst({
      where: {
        slug,
        id: excludeId ? { not: excludeId } : undefined,
      },
    });

    if (!existing) {
      break;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

export async function getOrganizers() {
  try {
    const organizers = await prisma.organizer.findMany({
      include: {
        type: true,
      },
      orderBy: { name: "asc" },
    });
    return organizers;
  } catch (error) {
    console.error("Error al obtener organizadores:", error);
    return [];
  }
}

export async function getOrganizerById(id: string) {
  try {
    const organizer = await prisma.organizer.findUnique({
      where: { id },
    });
    return organizer;
  } catch (error) {
    console.error("Error al obtener organizador por ID:", error);
    return null;
  }
}

export async function getOrganizerBySlug(slug: string) {
  try {
    const organizer = await prisma.organizer.findUnique({
      where: { slug },
      include: {
        type: true,
        events: {
          include: {
            event: {
              include: {
                occurrences: {
                  include: {
                    place: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return organizer;
  } catch (error) {
    console.error("Error al obtener organizador por slug:", error);
    return null;
  }
}

interface OrganizerInput {
  name: string;
  typeId: string;
  slug?: string | null;
  description?: string | null;
  photoId?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  youtube?: string | null;
  spotify?: string | null;
  tiktok?: string | null;
  web?: string | null;
  email?: string | null;
}

export async function createOrganizer(data: OrganizerInput) {
  try {
    const baseSlugName = data.slug || data.name;
    const slug = await generateUniqueSlug(baseSlugName);
    const organizer = await prisma.organizer.create({
      data: {
        ...data,
        slug,
      },
    });
    revalidatePath("/admin/organizers");
    return { success: true, data: organizer };
  } catch (error) {
    console.error("Error al crear organizador:", error);
    return { success: false, error: "Error al crear el organizador." };
  }
}

export async function updateOrganizer(id: string, data: OrganizerInput) {
  try {
    const baseSlugName = data.slug || data.name;
    const slug = await generateUniqueSlug(baseSlugName, id);
    const organizer = await prisma.organizer.update({
      where: { id },
      data: {
        ...data,
        slug,
      },
    });
    revalidatePath("/admin/organizers");
    revalidatePath(`/perfil/${organizer.slug}`);
    return { success: true, data: organizer };
  } catch (error) {
    console.error("Error al actualizar organizador:", error);
    return { success: false, error: "Error al actualizar el organizador." };
  }
}

export async function deleteOrganizer(id: string) {
  try {
    const organizer = await prisma.organizer.findUnique({
      where: { id },
      select: { slug: true },
    });

    await prisma.organizer.delete({
      where: { id },
    });

    revalidatePath("/admin/organizers");
    if (organizer) {
      revalidatePath(`/perfil/${organizer.slug}`);
    }
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar organizador:", error);
    return { success: false, error: "Error al eliminar el organizador." };
  }
}
