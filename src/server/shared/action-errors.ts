import { Prisma } from "@prisma/client";
import { UnauthorizedError } from "@/server/auth/require-admin";
import { ValidationError } from "./validation";

/** Mensaje para la UI sin filtrar detalles internos (Prisma, stack, etc.) */
export function toErrorMessage(context: string, error: unknown, fallback: string) {
  if (error instanceof ValidationError || error instanceof UnauthorizedError) return error.message;
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    return "No existe un registro con ese id.";
  }
  console.error(`[${context}] Error:`, error);
  return fallback;
}
