"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";

interface PlaceOption {
  id: string;
  name: string;
  address?: string | null;
}

interface SearchablePlaceSelectProps {
  places: PlaceOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchablePlaceSelect({
  places,
  value,
  onChange,
  placeholder = "— Seleccionar lugar —",
  className = "",
}: SearchablePlaceSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedPlace = places.find((p) => p.id === value);

  // Filtrar lugares
  const filteredPlaces = places.filter((place) => {
    const nameMatch = place.name.toLowerCase().includes(searchQuery.toLowerCase());
    const addressMatch = place.address?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
    return nameMatch || addressMatch;
  });

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Limpiar busqueda al abrir
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Botón principal del Select */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 bg-white hover:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-left outline-none text-sm cursor-pointer"
      >
        <span className={selectedPlace ? "text-gray-900 font-medium" : "text-gray-400"}>
          {selectedPlace
            ? `${selectedPlace.name}${selectedPlace.address ? ` · ${selectedPlace.address}` : ""}`
            : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Menú Desplegable */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Campo de Búsqueda */}
          <div className="relative p-2.5 bg-gray-50 border-b border-gray-100">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar lugar..."
              className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
              autoFocus
            />
          </div>

          {/* Opciones */}
          <ul className="max-h-60 overflow-y-auto py-1 divide-y divide-gray-50">
            <li key="empty-option">
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                Limpiar selección
              </button>
            </li>
            {filteredPlaces.length > 0 ? (
              filteredPlaces.map((place) => {
                const isSelected = place.id === value;
                return (
                  <li key={place.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(place.id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 flex items-start justify-between gap-3 text-sm hover:bg-brand-primary/5 transition-colors group ${
                        isSelected ? "bg-brand-primary/5 font-semibold text-brand-primary" : "text-gray-700"
                      }`}
                    >
                      <div className="leading-tight">
                        <span className="block font-bold">{place.name}</span>
                        {place.address && (
                          <span className="block text-xs text-gray-400 group-hover:text-gray-500 mt-0.5">
                            {place.address}
                          </span>
                        )}
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-brand-primary shrink-0 self-center" />}
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="px-4 py-6 text-center text-xs text-gray-400 font-medium">
                No se encontraron lugares
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
