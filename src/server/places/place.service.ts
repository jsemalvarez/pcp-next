import prisma from "@/data/prisma/db";
import { parseInput, ValidationError } from "@/server/shared/validation";
import {
  createPlaceSchema,
  updatePlaceSchema,
  type CreatePlaceInput,
  type UpdatePlaceInput,
} from "./place.schemas";

/**
 * Escrituras de lugares. Lo usan las server actions del admin y el MCP.
 * No verifica permisos: eso es responsabilidad de quien lo llama.
 */

export async function createPlace(input: CreatePlaceInput) {
  const data = parseInput(createPlaceSchema, input);
  return prisma.place.create({ data });
}

/** Solo cambia lo que viene definido */
export async function updatePlace(id: string, input: UpdatePlaceInput) {
  const data = parseInput(updatePlaceSchema, input);
  return prisma.place.update({ where: { id }, data });
}

/** Solo desde el admin web. Falla si el lugar tiene fechas de eventos asignadas. */
export async function deletePlace(id: string) {
  const occurrences = await prisma.eventOccurrence.count({ where: { placeId: id } });
  if (occurrences > 0) {
    throw new ValidationError(
      `No se puede eliminar: el lugar tiene ${occurrences} fecha(s) de eventos. Desactivalo o cambiales el lugar primero.`
    );
  }
  return prisma.place.delete({ where: { id } });
}
