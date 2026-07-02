import React from "react";
import Link from "next/link";
import { Plus, Edit2, ExternalLink, ArrowUpDown, CheckCircle2, XCircle } from "lucide-react";
import { getBanners } from "@/actions/banners";
import { DeleteBannerButton } from "@/presentation/components/Admin/DeleteBannerButton";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const banners = await getBanners();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl shadow-brand-primary/20 border border-white/50 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-black text-brand-primary">Banners</h1>
            <p className="text-sm font-bold text-gray-600 mt-1 uppercase tracking-widest">
              Administración de banners dinámicos de la página de inicio
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
              href="/admin/banners/nuevo"
              className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-5 py-2.5 rounded-2xl font-black text-sm tracking-wide transition-all shadow-md hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              NUEVO BANNER
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-primary/5 text-brand-primary text-sm uppercase tracking-wider">
                  <th className="p-4 font-black">Imagen</th>
                  <th className="p-4 font-black">Título / Subtítulo</th>
                  <th className="p-4 font-black">Enlace destino</th>
                  <th className="p-4 font-black">Prioridad</th>
                  <th className="p-4 font-black">Estado</th>
                  <th className="p-4 font-black text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {banners.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500 font-medium">
                      No hay banners registrados aún.
                    </td>
                  </tr>
                ) : (
                  banners.map((banner) => (
                    <tr key={banner.id} className="border-t border-gray-100 hover:bg-white transition-colors">
                      <td className="p-4">
                        {banner.photoId ? (
                          <img
                            src={`https://res.cloudinary.com/dwhdla1b4/image/upload/w_120,h_80,c_fill,q_auto,f_auto/v1749595725/pcp-images/${banner.photoId}`}
                            alt={banner.title}
                            className="w-16 h-10 rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-16 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-[10px] font-bold border border-gray-200" style={{ backgroundColor: banner.bgColor || undefined }}>
                            Sin Foto
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-800 line-clamp-1">{banner.title}</div>
                        {banner.subtitle && (
                          <div className="text-xs text-gray-500 line-clamp-1">{banner.subtitle}</div>
                        )}
                      </td>
                      <td className="p-4 text-sm font-mono text-gray-600">
                        {banner.linkUrl ? (
                          <div className="flex items-center gap-1">
                            <span className="truncate max-w-[200px]">{banner.linkUrl}</span>
                            <a
                              href={banner.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-primary"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-gray-400 font-sans italic">Sin link</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-700 font-bold">
                        <div className="flex items-center gap-1">
                          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                          {banner.priority}
                        </div>
                      </td>
                      <td className="p-4">
                        {banner.isActive ? (
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-black tracking-wide uppercase border border-green-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-black tracking-wide uppercase border border-gray-200">
                            <XCircle className="w-3 h-3" />
                            Desactivado
                          </span>
                        )}
                      </td>
                      <td className="p-4 flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/banners/${banner.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <DeleteBannerButton id={banner.id} title={banner.title} />
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
