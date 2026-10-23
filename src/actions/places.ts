"use server";

import { requireAdmin } from "@/server/auth/require-admin";
import prisma from "@/data/prisma/db";
import * as placeService from "@/server/places/place.service";
import { revalidatePlaces } from "@/server/places/place.revalidate";
import { toErrorMessage } from "@/server/shared/action-errors";
import type { CreatePlaceInput, UpdatePlaceInput } from "@/server/places/place.schemas";

/**
 * Adaptador fino entre la UI y el servicio de lugares:
 * verifica la sesión, llama al servicio y revalida las páginas afectadas.
 */

export async function getPlaces() {
  try {
    const places = await prisma.place.findMany({
      orderBy: { name: "asc" },
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

export async function createPlace(data: CreatePlaceInput) {
  try {
    await requireAdmin();
    const place = await placeService.createPlace(data);
    revalidatePlaces();
    return { success: true, place };
  } catch (error) {
    return { success: false, error: toErrorMessage("createPlace", error, "Error al crear lugar") };
  }
}

export async function updatePlace(id: string, data: UpdatePlaceInput) {
  try {
    await requireAdmin();
    const place = await placeService.updatePlace(id, data);
    revalidatePlaces(id);
    return { success: true, place };
  } catch (error) {
    return { success: false, error: toErrorMessage("updatePlace", error, "Error al actualizar lugar") };
  }
}

export async function deletePlace(id: string) {
  try {
    await requireAdmin();
    await placeService.deletePlace(id);
    revalidatePlaces(id);
    return { success: true };
  } catch (error) {
    return { success: false, error: toErrorMessage("deletePlace", error, "Error al eliminar lugar") };
  }
}
