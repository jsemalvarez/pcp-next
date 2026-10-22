import { revalidatePath } from "next/cache";

/** Páginas que muestran eventos; se revalidan después de cualquier escritura (admin o MCP) */
export function revalidateEvents(id?: string) {
  revalidatePath("/");
  revalidatePath("/calendario");
  revalidatePath("/favorites");
  revalidatePath("/admin/eventos");
  if (id) revalidatePath(`/admin/eventos/${id}`);
}
