import React from "react";
import Link from "next/link";
import { Plus, Edit2, ExternalLink } from "lucide-react";
import { getOrganizers } from "@/actions/organizers";
import { DeleteOrganizerButton } from "@/presentation/components/Admin/DeleteOrganizerButton";

export const dynamic = "force-dynamic";

export default async function AdminOrganizersPage() {
  const organizers = await getOrganizers();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl shadow-brand-primary/20 border border-white/50 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-black text-brand-primary">Organizadores y Artistas</h1>
            <p className="text-sm font-bold text-gray-600 mt-1 uppercase tracking-widest">
              Directorio de músicos, payasos, animadores y especialistas
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
              href="/admin/organizers/nuevo"
              className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-5 py-2.5 rounded-2xl font-black text-sm tracking-wide transition-all shadow-md hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              NUEVO ORGANIZADOR
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-primary/5 text-brand-primary text-sm uppercase tracking-wider">
                  <th className="p-4 font-black">Foto</th>
                  <th className="p-4 font-black">Nombre</th>
                  <th className="p-4 font-black">Especialidad</th>
                  <th className="p-4 font-black">URL de Perfil</th>
                  <th className="p-4 font-black text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {organizers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">
                      No hay organizadores registrados aún.
                    </td>
                  </tr>
                ) : (
                  organizers.map((org) => (
                    <tr key={org.id} className="border-t border-gray-100 hover:bg-white transition-colors">
                      <td className="p-4">
                        {org.photoId ? (
                          <img
                            src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dwhdla1b4'}/image/upload/w_100,h_100,c_fill,q_auto,f_auto/${org.photoId}`}
                            alt={org.name}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold border border-gray-200">
                            N/A
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-bold text-gray-800">{org.name}</td>
                      <td className="p-4">
                        <span className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase">
                          {org.type.name}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 text-sm font-mono">
                        <Link
                          href={`/perfil/${org.slug}`}
                          target="_blank"
                          className="flex items-center gap-1 hover:text-brand-primary hover:underline transition-all"
                        >
                          /perfil/{org.slug}
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                      <td className="p-4 flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/organizers/${org.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <DeleteOrganizerButton id={org.id} name={org.name} />
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
