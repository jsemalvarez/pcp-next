import { z } from "zod";
import { PlaceCategory } from "@prisma/client";
import { ageRangeError, ageRangeIsValid, optionalText } from "@/server/shared/validation";

const placeFields = {
  name: z.string().trim().min(1, "El nombre es obligatorio").max(200),
  address: z.string().trim().min(1, "La dirección es obligatoria").max(300),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),

  // Visibilidad
  isActive: z.boolean(),
  isShowInMap: z.boolean(),
  isFeatured: z.boolean(),

  // Contenido
  description: optionalText(5000),
  schedules: optionalText(2000),
  photoUrl: optionalText(500),
  bgColor: optionalText(30),

  // Ícono del mapa
  hasCustomIcon: z.boolean(),
  iconType: optionalText(50),

  // Contacto y redes (se aceptan usuarios o links, como en el admin)
  phone: optionalText(50),
  whatsapp: optionalText(50),
  web: optionalText(300),
  instagram: optionalText(300),
  facebook: optionalText(300),
  videoLink: optionalText(300),

  // Características
  hasFood: z.boolean(),
  hasShow: z.boolean(),
  hasGames: z.boolean(),
  hasSupervision: z.boolean(),

  categories: z.array(z.enum(PlaceCategory)),
  ageMin: z.number().min(0).max(99),
  ageMax: z.number().min(0).max(99).nullish(),
};

export const createPlaceSchema = z
  .object({
    ...placeFields,
    isActive: placeFields.isActive.default(true),
    isShowInMap: placeFields.isShowInMap.default(true),
    isFeatured: placeFields.isFeatured.default(false),
    hasCustomIcon: placeFields.hasCustomIcon.default(false),
    hasFood: placeFields.hasFood.default(false),
    hasShow: placeFields.hasShow.default(false),
    hasGames: placeFields.hasGames.default(false),
    hasSupervision: placeFields.hasSupervision.default(false),
    categories: placeFields.categories.default([]),
    ageMin: placeFields.ageMin.default(0),
  })
  .refine(ageRangeIsValid, ageRangeError);

export const updatePlaceSchema = z.object(placeFields).partial().refine(ageRangeIsValid, ageRangeError);

export type CreatePlaceInput = z.input<typeof createPlaceSchema>;
export type UpdatePlaceInput = z.input<typeof updatePlaceSchema>;
