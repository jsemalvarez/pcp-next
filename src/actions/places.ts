"use server";

import prisma from "@/data/prisma/db";
import { revalidatePath } from "next/cache";
import { Place } from "@/domain/entities/Place";

export async function getPlaces() {
  try {
    const places = await prisma.place.findMany({
      orderBy: { createdAt: "desc" },
    });
    return places;
  } catch (error) {
    console.error("Error al obtener lugares:", error);
    return [];
  }
}

export async function getPlaceById(id: string) {
  try {
    const place = await prisma.place.findUnique({
      where: { id },
    });
    return place;
  } catch (error) {
    console.error("Error al obtener el lugar:", error);
    return null;
  }
}

export async function createPlace(data: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const place = await prisma.place.create({
      data,
    });
    revalidatePath("/admin/lugares");
    revalidatePath("/places"); // En caso de que haya una página pública de lugares
    return { success: true, place };
  } catch (error: any) {
    console.error("Error al crear lugar:", error);
    return { success: false, error: error?.message || "Error al crear lugar" };
  }
}

export async function updatePlace(id: string, data: Partial<Omit<Place, 'id' | 'createdAt' | 'updatedAt'>>) {
  try {
    const place = await prisma.place.update({
      where: { id },
      data,
    });
    revalidatePath("/admin/lugares");
    revalidatePath(`/admin/lugares/${id}`);
    revalidatePath("/places"); 
    return { success: true, place };
  } catch (error: any) {
    console.error("Error al actualizar lugar:", error);
    return { success: false, error: error?.message || "Error al actualizar lugar" };
  }
}

export async function deletePlace(id: string) {
  try {
    await prisma.place.delete({
      where: { id },
    });
    revalidatePath("/admin/lugares");
    revalidatePath("/places");
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar lugar:", error);
    return { success: false, error: "Error al eliminar lugar" };
  }
}
