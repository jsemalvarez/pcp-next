'use client'

import { useMemo, useRef } from "react";
import { CloudinaryImage } from "../common/CloudinaryImage";
import { ChevronRightIcon } from "../common/icons";
import { ChevronLeftIcon } from "../common/icons/ChevronLeftIcon";
import { Place } from "@/domain/entities/Place";


interface Props{
    places: Place[];
    setSelectedPlace: (palce: Place | null) => void;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export default function FeaturedPlaces({ places, setSelectedPlace }: Props) {
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);

    const featuredPlaces = useMemo(() => {
        const featured = places.filter(place => place.isFeatured);
        return shuffleArray(featured);
    }, [places]);

    if (featuredPlaces.length === 0) {
        return null
    }

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
                Nuestros favoritos
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

                <div
                    ref={scrollContainerRef}
                    className="mx-auto w-9/10 h-[220px] flex gap-4 overflow-x-auto p-4 snap-x snap-mandatory scroll-smooth scrollbar-hide"
                >
                    {featuredPlaces.map((place) => (
                        <div
                            key={place.id}
                            className="min-w-[180px] max-w-[180px] flex-shrink-0 cursor-pointer"
                            onClick={()=>setSelectedPlace(place)}
                        >
                            <div className="bg-gradient-to-b from-primary to-gray-100 shadow-lg shadow-cyan-500/50 p-[2px] flex justify-center items-center rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 snap-start">
                                <CloudinaryImage 
                                    imageName={ place.photoUrl ?? undefined }
                                    alt={ place.name }
                                    className="h-[160px] object-cover rounded-xl "
                                />
                            </div>

                            <div className="p-3">
                                <h3 className="text-sm truncate text-gray-200 text-center">{place.name}</h3>
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
