import { getSession } from "@/data/auth/session";

export class UnauthorizedError extends Error {
  constructor() {
    super("No autorizado. Volvé a iniciar sesión.");
    this.name = "UnauthorizedError";
  }
}

/**
 * Exige una sesión de admin válida. Toda server action que modifique datos
 * (o lea borradores / notas internas) tiene que llamarla primero: las server
 * actions son endpoints públicos y el middleware solo protege la navegación.
 */
export async function requireAdmin() {
  const session = await getSession();
  if (!session?.userId) throw new UnauthorizedError();
  return session;
}
