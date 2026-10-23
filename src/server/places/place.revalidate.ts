import { revalidatePath } from "next/cache";
import { revalidateEvents } from "@/server/events/event.revalidate";

/** Páginas que muestran lugares; los eventos muestran el nombre y la dirección del lugar */
export function revalidatePlaces(id?: string) {
  revalidatePath("/map");
  revalidatePath("/admin/lugares");
  if (id) revalidatePath(`/admin/lugares/${id}`);
  revalidateEvents();
}
