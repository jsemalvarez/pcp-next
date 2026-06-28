"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
}

interface SearchableCategorySelectProps {
  categories: CategoryOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchableCategorySelect({
  categories,
  value,
  onChange,
  placeholder = "— Seleccionar categoría —",
  className = "",
}: SearchableCategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCategory = categories.find((c) => c.id === value);

  // Filtrar categorías
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
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
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-gray-200 bg-white/50 hover:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-left outline-none text-sm cursor-pointer"
      >
        <span className={selectedCategory ? "text-gray-900 font-medium" : "text-gray-400"}>
          {selectedCategory ? selectedCategory.name : placeholder}
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
              placeholder="Buscar categoría..."
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
                className="w-full text-left px-4 py-2 text-xs font-bold text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
              >
                Limpiar selección
              </button>
            </li>
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => {
                const isSelected = cat.id === value;
                return (
                  <li key={cat.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(cat.id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 text-sm hover:bg-brand-primary/5 transition-colors cursor-pointer ${
                        isSelected ? "bg-brand-primary/5 font-semibold text-brand-primary" : "text-gray-700"
                      }`}
                    >
                      <span className="block font-bold">{cat.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-brand-primary shrink-0" />}
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="px-4 py-6 text-center text-xs text-gray-400 font-medium">
                No se encontraron categorías
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
