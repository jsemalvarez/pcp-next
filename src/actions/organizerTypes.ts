"use server";

import prisma from "@/data/prisma/db";
import { revalidatePath } from "next/cache";

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD") // normalize diacritics
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .trim()
    .replace(/\s+/g, "-") // replace spaces with -
    .replace(/[^\w\-]+/g, "") // remove all non-word chars
    .replace(/\-\-+/g, "-") // replace multiple - with single -
    .replace(/^-+/, "") // trim - from start of text
    .replace(/-+$/, ""); // trim - from end of text
};

export async function getOrganizerTypes() {
  try {
    const types = await prisma.organizerType.findMany({
      orderBy: { name: "asc" },
    });
    return types;
  } catch (error) {
    console.error("Error al obtener tipos de organizador:", error);
    return [];
  }
}

export async function createOrganizerType(name: string) {
  try {
    const slug = slugify(name);
    const type = await prisma.organizerType.create({
      data: {
        name,
        slug,
      },
    });
    revalidatePath("/admin/organizer-types");
    return { success: true, data: type };
  } catch (error: any) {
    console.error("Error al crear tipo de organizador:", error);
    if (error.code === "P2002") {
      return { success: false, error: "Ya existe una especialidad con este nombre." };
    }
    return { success: false, error: "Error interno del servidor." };
  }
}

export async function updateOrganizerType(id: string, name: string) {
  try {
    const slug = slugify(name);
    const type = await prisma.organizerType.update({
      where: { id },
      data: {
        name,
        slug,
      },
    });
    revalidatePath("/admin/organizer-types");
    return { success: true, data: type };
  } catch (error: any) {
    console.error("Error al actualizar tipo de organizador:", error);
    if (error.code === "P2002") {
      return { success: false, error: "Ya existe una especialidad con este nombre." };
    }
    return { success: false, error: "Error interno del servidor." };
  }
}

export async function deleteOrganizerType(id: string) {
  try {
    // Check if there are organizers using this type
    const count = await prisma.organizer.count({
      where: { typeId: id },
    });

    if (count > 0) {
      return {
        success: false,
        error: "No se puede eliminar esta especialidad porque tiene organizadores/artistas asociados.",
      };
    }

    await prisma.organizerType.delete({
      where: { id },
    });
    revalidatePath("/admin/organizer-types");
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar tipo de organizador:", error);
    return { success: false, error: "Error interno del servidor." };
  }
}
