"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Edit2, Search } from "lucide-react";
import { Place } from "@/domain/entities/Place";
import { DeletePlaceButton } from "./DeletePlaceButton";

interface Props {
  places: Place[];
}

export function AdminPlacesTable({ places }: Props) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPlaces = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return places;
    return places.filter((place) =>
      place.name.toLowerCase().includes(term)
    );
  }, [searchTerm, places]);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-md border border-white/50 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar lugar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
          />
        </div>
        {searchTerm && (
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {filteredPlaces.length} {filteredPlaces.length === 1 ? "resultado" : "resultados"}
          </span>
        )}
      </div>

      {/* Content Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-primary/5 text-brand-primary text-sm uppercase tracking-wider">
                <th className="p-4 font-black">Nombre</th>
                <th className="p-4 font-black">Dirección</th>
                <th className="p-4 font-black text-center">Estado</th>
                <th className="p-4 font-black text-center">Destacado</th>
                <th className="p-4 font-black text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlaces.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">
                    {searchTerm ? "No se encontraron lugares que coincidan con la búsqueda." : "No hay lugares registrados aún."}
                  </td>
                </tr>
              ) : (
                filteredPlaces.map((place) => (
                  <tr key={place.id} className="border-t border-gray-100 hover:bg-white transition-colors">
                    <td className="p-4 font-bold text-gray-800">{place.name}</td>
                    <td className="p-4 text-gray-600 text-sm">{place.address}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wide ${place.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {place.isActive ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {place.isFeatured ? (
                        <span className="text-yellow-500 font-black">★</span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="p-4 flex items-center justify-end gap-2">
                      <Link 
                        href={`/admin/lugares/${place.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <DeletePlaceButton id={place.id} name={place.name} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
