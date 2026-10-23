import { revalidatePath } from "next/cache";
import { revalidateEvents } from "@/server/events/event.revalidate";

/** Páginas que muestran organizadores; el calendario muestra los organizadores de cada evento */
export function revalidateOrganizers(slug?: string) {
  revalidatePath("/admin/organizers");
  if (slug) revalidatePath(`/perfil/${slug}`);
  revalidateEvents();
}
