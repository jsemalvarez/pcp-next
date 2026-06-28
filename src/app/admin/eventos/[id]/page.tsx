import { getEventById } from "@/actions/events";
import { getPlaces } from "@/actions/places";
import { getOrganizers } from "@/actions/organizers";
import { notFound } from "next/navigation";
import { EventForm } from "@/presentation/components/Admin/EventForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarEventoPage({ params }: Props) {
  const { id } = await params;
  const [event, places, organizers] = await Promise.all([
    getEventById(id),
    getPlaces(),
    getOrganizers(),
  ]);

  if (!event) notFound();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl shadow-brand-primary/20 border border-white/50">
          <h1 className="text-3xl font-black text-brand-primary">Editar Evento</h1>
          <p className="text-sm font-bold text-gray-600 mt-1 uppercase tracking-widest">
            {event.title}
          </p>
        </header>

        <EventForm places={places} organizers={organizers} initialData={event} />
      </div>
    </div>
  );
}
