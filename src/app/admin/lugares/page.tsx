import { getPlaces } from "@/actions/places";
import Link from "next/link";
import { Plus, Edit2 } from "lucide-react";
import { DeletePlaceButton } from "@/presentation/components/Admin/DeletePlaceButton";

export const dynamic = "force-dynamic";

export default async function LugaresPage() {
  const places = await getPlaces();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl shadow-brand-primary/20 border border-white/50 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-black text-brand-primary">Lugares</h1>
            <p className="text-sm font-bold text-gray-600 mt-1 uppercase tracking-widest">
              Directorio de lugares y actividades
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
              href="/admin/lugares/nuevo"
              className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-5 py-2.5 rounded-2xl font-black text-sm tracking-wide transition-all shadow-md hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              NUEVO LUGAR
            </Link>
          </div>
        </header>

        {/* Content */}
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
                {places.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">
                      No hay lugares registrados aún.
                    </td>
                  </tr>
                ) : (
                  places.map((place) => (
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
    </div>
  );
}
