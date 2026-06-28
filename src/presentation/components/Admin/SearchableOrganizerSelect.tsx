"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";

interface OrganizerOption {
  id: string;
  name: string;
  type: {
    name: string;
  };
}

interface SearchableOrganizerSelectProps {
  organizers: OrganizerOption[];
  value: string[]; // IDs seleccionados
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function SearchableOrganizerSelect({
  organizers,
  value,
  onChange,
  placeholder = "Buscar y agregar organizador / artista...",
}: SearchableOrganizerSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Filtrar las opciones disponibles (que no hayan sido seleccionadas ya)
  const availableOrganizers = organizers.filter((org) => !value.includes(org.id));

  // Filtrar por el término de búsqueda
  const filteredOrganizers = availableOrganizers.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.type.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  // Limpiar búsqueda al abrir
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  const handleSelect = (id: string) => {
    onChange([...value, id]);
    setIsOpen(false);
  };

  const handleRemove = (id: string) => {
    onChange(value.filter((valId) => valId !== id));
  };

  // Obtener los objetos de los organizadores actualmente seleccionados
  const selectedOrganizers = organizers.filter((org) => value.includes(org.id));

  return (
    <div ref={containerRef} className="relative w-full space-y-3">
      {/* Selector / Buscador */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-gray-200 bg-white/50 hover:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-left outline-none text-sm cursor-pointer"
        >
          <span className="text-gray-400 font-medium">{placeholder}</span>
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
                placeholder="Buscar por nombre o categoría..."
                className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                autoFocus
              />
            </div>

            {/* Opciones */}
            <ul className="max-h-60 overflow-y-auto py-1 divide-y divide-gray-50">
              {filteredOrganizers.length > 0 ? (
                filteredOrganizers.map((org) => (
                  <li key={org.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(org.id)}
                      className="w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 text-sm hover:bg-brand-primary/5 transition-colors cursor-pointer"
                    >
                      <div>
                        <span className="block font-bold text-gray-800">{org.name}</span>
                        <span className="block text-xs text-gray-400 uppercase tracking-wider font-semibold mt-0.5">
                          {org.type.name}
                        </span>
                      </div>
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-4 py-6 text-center text-xs text-gray-400 font-medium">
                  {availableOrganizers.length === 0
                    ? "Todos los organizadores ya están vinculados"
                    : "No se encontraron resultados"}
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Lista de Organizadores Seleccionados (Chips) */}
      {selectedOrganizers.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-white/40 border border-gray-100 rounded-2xl">
          {selectedOrganizers.map((org) => (
            <div
              key={org.id}
              className="flex items-center gap-1.5 bg-brand-primary/10 text-brand-primary px-3 py-1.5 rounded-xl text-xs font-bold border border-brand-primary/10"
            >
              <span>{org.name}</span>
              <span className="text-[10px] bg-brand-primary/20 px-1.5 py-0.5 rounded-md uppercase font-black tracking-wide">
                {org.type.name}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(org.id)}
                className="hover:bg-brand-primary/20 p-0.5 rounded-md transition-colors text-brand-primary cursor-pointer"
                title="Eliminar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
