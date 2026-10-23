import { z } from "zod";

/**
 * Validación compartida por los servicios (eventos, lugares, organizadores).
 * Los mensajes de ValidationError se pueden mostrar tal cual en la UI y en el MCP.
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/** Valida con zod y convierte los errores en un ValidationError legible */
export function parseInput<T extends z.ZodType>(schema: T, input: unknown): z.output<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    const message = result.error.issues
      .map((issue) => (issue.path.length ? `${issue.path.join(".")}: ${issue.message}` : issue.message))
      .join("; ");
    throw new ValidationError(message);
  }
  return result.data;
}

/**
 * Texto opcional: undefined = no tocar, "" o null = borrar.
 * Siempre sale recortado; los vacíos se guardan como null.
 */
export const optionalText = (max: number) =>
  z
    .string()
    .max(max)
    .nullish()
    .transform((v) => (v === undefined ? undefined : v?.trim() || null));

export const optionalUrl = z
  .string()
  .trim()
  .nullish()
  .transform((v) => (v === undefined ? undefined : v || null))
  .refine((v) => !v || /^https?:\/\/\S+$/i.test(v), "Tiene que ser una URL que empiece con http:// o https://");

export const ageRangeIsValid = (v: { ageMin?: number; ageMax?: number | null }) =>
  v.ageMax == null || v.ageMin == null || v.ageMax >= v.ageMin;
export const ageRangeError = { message: "La edad máxima no puede ser menor que la mínima", path: ["ageMax"] };
