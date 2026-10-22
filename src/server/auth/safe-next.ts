/**
 * Destino interno seguro para redirigir después del login.
 * Solo rutas del mismo sitio ("/algo"); nunca URLs externas ni "//host" (open redirect).
 */
export function safeNextPath(next: unknown, fallback = "/admin/dashboard") {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  return next;
}
