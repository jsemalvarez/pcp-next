"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Edit2, Calendar, Search } from "lucide-react";
import { DeleteEventButton } from "./DeleteEventButton";
import dayjs from "dayjs";
import 'dayjs/locale/es';

dayjs.locale('es');

interface Props {
  initialEvents: any[];
}

export function AdminEventsTable({ initialEvents }: Props) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEvents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return initialEvents;
    return initialEvents.filter((event) =>
      event.title.toLowerCase().includes(term)
    );
  }, [searchTerm, initialEvents]);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-md border border-white/50 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar evento por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
          />
        </div>
        {searchTerm && (
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {filteredEvents.length} {filteredEvents.length === 1 ? "resultado" : "resultados"}
          </span>
        )}
      </div>

      {/* Table Card */}
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
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">
                    {searchTerm ? "No se encontraron eventos que coincidan con la búsqueda." : "No hay eventos registrados aún."}
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => {
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
                          {event.activityTypes.slice(0, 2).map((type: string) => (
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
  );
}
