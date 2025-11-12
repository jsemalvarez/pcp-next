'use client'

import { Event } from "@/domain/entities/Event";
import { useRef } from "react";
import { CloudinaryImage } from "../common/CloudinaryImage";
import { ChevronRightIcon } from "../common/icons";
import { ChevronLeftIcon } from "../common/icons/ChevronLeftIcon";


interface Props{
    events: Event[];
}

export const FeaturedEvents = ({ events }: Props) => {
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    /**
     * NOTA: new Date("2025-10-11")
     * javaScript interpreta ese string como una fecha en UTC (zona horaria 0), no como hora local.
     * "2025-10-11" se interpreta como:
     *    2025-10-11T00:00:00.000Z (UTC)
     *   Pero tu zona horaria es GMT-3 (Argentina)
     *   Entonces se convierte automáticamente a hora local:
     *    2025-10-10T21:00:00.000-03:00
     * 
     *  Como la fecha viene del backend y para mantener consistencia en UTC:
     *  const eventDate = new Date(`${event.date}T00:00:00`)
     *  Esto la trata como hora local (sin Z), no como UTC.
     *  Pero si hacés T00:00:00Z, ahí sí sería UTC y volvería a restar el día.
     */
    const upcomingEvents = events.filter((event) => {
        const eventDate = new Date(`${event.date}T00:00:00`);
        const isUpcoming = eventDate >= todayStart;
        const isFeatured = event.isFeatured;

        return isUpcoming && isFeatured;
    });

    // if (upcomingEvents.length === 0) {
    //   return null
    // }

    const scroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const scrollAmount = 250; // píxeles a mover por clic
        const delta = direction === "left" ? -scrollAmount : scrollAmount;
        container.scrollBy({ left: delta, behavior: "smooth" });
    };

    return (
        <section className="relative w-full max-w-[1600px] mx-auto mb-6">
            {/* Título */}
            <h3 className="ml-4 md:ml-12 text-2xl font-semibold">
                Eventos Destacados
            </h3>

            {/* Contenedor del carrusel */}
            <div className="relative">
                {/* Botón izquierdo */}
                <button
                    onClick={() => scroll("left")}
                    className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 bg-primary shadow-md rounded-full p-2 z-10 hover:scale-105 transition cursor-pointer"
                    aria-label="Desplazar a la izquierda"
                >
                    <ChevronLeftIcon />
                </button>

                {/* Lista de eventos */}
                <div
                    ref={scrollContainerRef}
                    className="mx-auto w-9/10 h-[380px] flex gap-4 overflow-x-auto p-4 snap-x snap-mandatory scroll-smooth scrollbar-hide"
                >
                    {upcomingEvents.map((event) => (
                        <div
                            key={event.id}
                            className="min-w-[180px] max-w-[180px] flex-shrink-0 cursor-pointer"
                        >
                            <div className="bg-gradient-to-b from-primary to-gray-100 shadow-lg shadow-cyan-500/50 p-[2px] flex justify-center items-center rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 snap-start">
                                <CloudinaryImage 
                                    imageName={ event.photoId }
                                    alt={ event.title }
                                    className="h-[320px] object-cover rounded-xl "
                                />
                            </div>

                            <div className="p-3">
                                <h3 className="text-sm truncate text-gray-200 text-center">{event.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Botón derecho */}
                <button
                    onClick={() => scroll("right")}
                    className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 bg-primary shadow-md rounded-full p-2 z-10 hover:scale-105 transition cursor-pointer"
                    aria-label="Desplazar a la derecha"
                >
                    <ChevronRightIcon />
                </button>
            </div>
        </section>
    );
}
