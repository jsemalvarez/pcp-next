import { z } from "zod";
import { ActivityType, PriceType } from "@prisma/client";
import { ageRangeError, ageRangeIsValid, optionalText, optionalUrl } from "@/server/shared/validation";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Fecha de calendario 'YYYY-MM-DD' (sin hora ni zona horaria) */
export const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha tiene que tener el formato YYYY-MM-DD")
  .refine((v) => !Number.isNaN(Date.parse(`${v}T00:00:00Z`)), "Fecha inválida");

/** Hora 'HH:mm' en 24 hs */
export const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "La hora tiene que tener el formato HH:mm (24 hs)");

// ─────────────────────────────────────────────
// Ocurrencias (fechas)
// ─────────────────────────────────────────────

export const occurrenceInputSchema = z.object({
  date: dateString,
  timeStart: timeString,
  timeEnd: timeString.nullish().transform((v) => v || null),
  placeId: z.string().uuid().nullish().transform((v) => v || null),
  /** Lugar tal como figura en la fuente, si todavía no está cargado como Place */
  placeText: optionalText(200).transform((v) => v ?? null),
});

export const occurrenceUpdateSchema = z.object({
  date: dateString.optional(),
  timeStart: timeString.optional(),
  timeEnd: timeString.nullish(),
  placeId: z.string().uuid().nullish(),
  placeText: optionalText(200),
});

export type OccurrenceInput = z.input<typeof occurrenceInputSchema>;
export type OccurrenceUpdateInput = z.input<typeof occurrenceUpdateSchema>;

// ─────────────────────────────────────────────
// Evento
// ─────────────────────────────────────────────

const eventFields = {
  title: z.string().trim().min(1, "El título es obligatorio").max(200),
  description: optionalText(5000),
  photoId: optionalText(300),
  photoWidth: z.number().int().positive().nullish(),
  photoHeight: z.number().int().positive().nullish(),
  bgColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "El color tiene que ser hexadecimal, ej. #9575CD")
    .nullish(),
  ticketUrl: optionalUrl,
  bookingWhatsapp: optionalText(50),
  priceType: z.enum(PriceType).nullish(),
  activityTypes: z.array(z.enum(ActivityType)),
  ageMin: z.number().min(0).max(99),
  ageMax: z.number().min(0).max(99).nullish(),
  isFeatured: z.boolean(),
  isSponsored: z.boolean(),
  sourceUrl: optionalUrl,
  sourceText: optionalText(10000),
  internalNotes: optionalText(5000),
  organizerIds: z.array(z.string().uuid()),
};

export const createEventSchema = z
  .object({
    ...eventFields,
    activityTypes: eventFields.activityTypes.default([]),
    ageMin: eventFields.ageMin.default(0),
    isFeatured: eventFields.isFeatured.default(false),
    isSponsored: eventFields.isSponsored.default(false),
    organizerIds: eventFields.organizerIds.default([]),
    occurrences: z.array(occurrenceInputSchema).default([]),
    /** true = publicar al crear (falla si faltan datos obligatorios) */
    publish: z.boolean().default(false),
  })
  .refine(ageRangeIsValid, ageRangeError);

export const updateEventSchema = z
  .object({
    ...eventFields,
    /** Si viene, reemplaza TODAS las fechas del evento */
    occurrences: z.array(occurrenceInputSchema),
  })
  .partial()
  .refine(ageRangeIsValid, ageRangeError);

export type CreateEventInput = z.input<typeof createEventSchema>;
export type UpdateEventInput = z.input<typeof updateEventSchema>;
