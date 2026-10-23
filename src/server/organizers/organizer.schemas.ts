import { z } from "zod";
import { optionalText } from "@/server/shared/validation";

const organizerFields = {
  name: z.string().trim().min(1, "El nombre es obligatorio").max(200),
  typeId: z.string().uuid("Tipo de organizador inválido"),
  /** Si no viene, se genera a partir del nombre */
  slug: optionalText(200),
  description: optionalText(5000),
  photoId: optionalText(300),

  // Contacto y redes (se aceptan usuarios o links, como en el admin)
  phone: optionalText(50),
  whatsapp: optionalText(50),
  instagram: optionalText(300),
  facebook: optionalText(300),
  youtube: optionalText(300),
  spotify: optionalText(300),
  tiktok: optionalText(300),
  web: optionalText(300),
  email: optionalText(200).refine((v) => !v || /^\S+@\S+\.\S+$/.test(v), "Email inválido"),
};

export const createOrganizerSchema = z.object(organizerFields);
export const updateOrganizerSchema = z.object(organizerFields).partial();

export type CreateOrganizerInput = z.input<typeof createOrganizerSchema>;
export type UpdateOrganizerInput = z.input<typeof updateOrganizerSchema>;
