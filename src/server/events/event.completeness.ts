import { EventStatus, PriceType } from "@prisma/client";

/**
 * Único lugar que define qué le falta a un evento.
 *
 * - Obligatorios: sin ellos no se puede publicar (el borrador queda INCOMPLETE).
 * - Recomendados: se muestran como aviso, no bloquean.
 *
 * Los códigos se guardan en Event.missingFields; las etiquetas son para mostrar.
 */

export const MISSING_FIELD_LABELS = {
  dates: "fecha y hora",
  place: "lugar asignado en cada fecha",
  priceType: "tipo de precio",
} as const;

export const WARNING_LABELS = {
  photo: "foto",
  activityTypes: "tipo de actividad",
  description: "descripción",
  organizers: "organizador",
  booking: "link de entradas o WhatsApp de reserva",
} as const;

export type MissingField = keyof typeof MISSING_FIELD_LABELS;
export type EventWarning = keyof typeof WARNING_LABELS;

type CompletenessInput = {
  priceType: PriceType | null;
  occurrences: { placeId: string | null }[];
};

type WarningsInput = CompletenessInput & {
  photoId: string | null;
  description: string | null;
  activityTypes: unknown[];
  ticketUrl: string | null;
  bookingWhatsapp: string | null;
  organizerCount: number;
};

export function getMissingFields(event: CompletenessInput): MissingField[] {
  const missing: MissingField[] = [];
  if (event.occurrences.length === 0) missing.push("dates");
  if (event.occurrences.some((o) => !o.placeId)) missing.push("place");
  if (!event.priceType) missing.push("priceType");
  return missing;
}

export function getWarnings(event: WarningsInput): EventWarning[] {
  const warnings: EventWarning[] = [];
  if (!event.photoId) warnings.push("photo");
  if (event.activityTypes.length === 0) warnings.push("activityTypes");
  if (!event.description) warnings.push("description");
  if (event.organizerCount === 0) warnings.push("organizers");
  if (event.priceType === "PAID_TICKET" && !event.ticketUrl && !event.bookingWhatsapp) {
    warnings.push("booking");
  }
  return warnings;
}

/** Estado de un evento no publicado según lo que le falta */
export function draftStatusFor(missing: MissingField[]): EventStatus {
  return missing.length > 0 ? EventStatus.INCOMPLETE : EventStatus.DRAFT;
}

export function describeMissing(missing: string[]): string {
  return missing
    .map((code) => MISSING_FIELD_LABELS[code as MissingField] ?? code)
    .join(", ");
}
