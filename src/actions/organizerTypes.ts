"use server";

import { requireAdmin } from "@/server/auth/require-admin";
import { Prisma } from "@prisma/client";
import prisma from "@/data/prisma/db";
import { revalidatePath } from "next/cache";
import { slugify } from "@/server/organizers/organizer.service";

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
    await requireAdmin();
    const slug = slugify(name);
    const type = await prisma.organizerType.create({
      data: {
        name,
        slug,
      },
    });
    revalidatePath("/admin/organizer-types");
    return { success: true, data: type };
  } catch (error) {
    console.error("Error al crear tipo de organizador:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: "Ya existe una especialidad con este nombre." };
    }
    return { success: false, error: "Error interno del servidor." };
  }
}

export async function updateOrganizerType(id: string, name: string) {
  try {
    await requireAdmin();
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
  } catch (error) {
    console.error("Error al actualizar tipo de organizador:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: "Ya existe una especialidad con este nombre." };
    }
    return { success: false, error: "Error interno del servidor." };
  }
}

export async function deleteOrganizerType(id: string) {
  try {
    await requireAdmin();
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
