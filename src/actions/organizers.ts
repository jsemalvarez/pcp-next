"use server";

import { requireAdmin } from "@/server/auth/require-admin";
import prisma from "@/data/prisma/db";
import * as organizerService from "@/server/organizers/organizer.service";
import { revalidateOrganizers } from "@/server/organizers/organizer.revalidate";
import { toErrorMessage } from "@/server/shared/action-errors";
import type { CreateOrganizerInput, UpdateOrganizerInput } from "@/server/organizers/organizer.schemas";
import { PUBLIC_EVENT_WHERE } from "@/server/events/event.queries";

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
        // Perfil público: solo eventos publicados y fechas con lugar
        events: {
          where: { event: PUBLIC_EVENT_WHERE },
          include: {
            event: {
              include: {
                occurrences: {
                  where: { placeId: { not: null } },
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

export async function createOrganizer(data: CreateOrganizerInput) {
  try {
    await requireAdmin();
    const organizer = await organizerService.createOrganizer(data);
    revalidateOrganizers(organizer.slug);
    return { success: true, data: organizer };
  } catch (error) {
    return { success: false, error: toErrorMessage("createOrganizer", error, "Error al crear el organizador.") };
  }
}

export async function updateOrganizer(id: string, data: UpdateOrganizerInput) {
  try {
    await requireAdmin();
    const before = await prisma.organizer.findUnique({ where: { id }, select: { slug: true } });
    const organizer = await organizerService.updateOrganizer(id, data);
    revalidateOrganizers(organizer.slug);
    if (before && before.slug !== organizer.slug) revalidateOrganizers(before.slug);
    return { success: true, data: organizer };
  } catch (error) {
    return { success: false, error: toErrorMessage("updateOrganizer", error, "Error al actualizar el organizador.") };
  }
}

export async function deleteOrganizer(id: string) {
  try {
    await requireAdmin();
    const organizer = await organizerService.deleteOrganizer(id);
    revalidateOrganizers(organizer.slug);
    return { success: true };
  } catch (error) {
    return { success: false, error: toErrorMessage("deleteOrganizer", error, "Error al eliminar el organizador.") };
  }
}
