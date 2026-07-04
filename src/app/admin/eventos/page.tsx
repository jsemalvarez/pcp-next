import { getEvents } from "@/actions/events";
import { getPlaces } from "@/actions/places";
import Link from "next/link";
import { Plus, Edit2, Calendar } from "lucide-react";
import { DeleteEventButton } from "@/presentation/components/Admin/DeleteEventButton";
import dayjs from "dayjs";
import 'dayjs/locale/es';
dayjs.locale('es');

export const dynamic = "force-dynamic";

export default async function EventosPage() {
  const [events, places] = await Promise.all([getEvents(), getPlaces()]);

  const placesMap = new Map(places.map((p) => [p.id, p.name]));

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl shadow-brand-primary/20 border border-white/50 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-black text-brand-primary">Eventos</h1>
            <p className="text-sm font-bold text-gray-600 mt-1 uppercase tracking-widest">
              {events.length} evento{events.length !== 1 ? 's' : ''} registrado{events.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="text-gray-500 hover:text-gray-800 font-bold text-sm uppercase tracking-wider"
            >
              Volver al Dashboard
            </Link>
            <Link
              href="/admin/eventos/nuevo"
              className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-5 py-2.5 rounded-2xl font-black text-sm tracking-wide transition-all shadow-md hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              NUEVO EVENTO
            </Link>
          </div>
        </header>

        {/* Lista de eventos */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-primary/5 text-brand-primary text-sm uppercase tracking-wider">
                  <th className="p-4 font-black">Evento</th>
                  <th className="p-4 font-black">Fechas</th>
                  <th className="p-4 font-black">Tipo</th>
                  <th className="p-4 font-black text-center">Destacado</th>
                  <th className="p-4 font-black text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">
                      No hay eventos registrados aún.
                    </td>
                  </tr>
                ) : (
                  events.map((event) => {
                    const firstOccurrence = event.occurrences[0];
                    const occurrenceCount = event.occurrences.length;
                    return (
                      <tr key={event.id} className="border-t border-gray-100 hover:bg-white transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-gray-800">{event.title}</p>
                          {event.organizers && event.organizers.length > 0 && (
                            <p className="text-xs text-brand-primary font-medium mt-0.5">
                              {event.organizers.map((eo: any) => eo.organizer.name).join(', ')}
                            </p>
                          )}
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {firstOccurrence ? (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                              <span>
                                {dayjs(firstOccurrence.date).format('DD/MM/YYYY')}
                                {occurrenceCount > 1 && (
                                  <span className="ml-1.5 px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary text-xs font-black rounded-full">
                                    +{occurrenceCount - 1}
                                  </span>
                                )}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">Sin fechas</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {event.activityTypes.slice(0, 2).map((type) => (
                              <span
                                key={type}
                                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          {event.isFeatured ? (
                            <span className="text-yellow-500 font-black">★</span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="p-4 flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/eventos/${event.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <DeleteEventButton id={event.id} title={event.title} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
