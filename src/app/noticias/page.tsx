import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getActiveNews } from "@/actions/news";
import { Calendar, ArrowLeft, Home as HomeIcon, Newspaper, MapPin, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PublicNewsPage() {
  const newsList = await getActiveNews();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-brand-accent dark:bg-brand-accent/90 backdrop-blur-lg pt-safe border-b border-white/10">
        <div className="px-4 py-3 flex justify-between items-center max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-white hover:text-white/80 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">
                Noticias y Novedades
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                Paseos con Peques
              </p>
            </div>
          </div>

          {/* Desktop/Tablet Navigation Icons in Header */}
          <div className="hidden md:flex items-center gap-6 text-white/90">
            <Link href="/" className="hover:text-white font-bold text-sm transition-colors flex items-center gap-1.5">
              <HomeIcon className="w-4 h-4" />
              <span>Inicio</span>
            </Link>
            <Link href="/noticias" className="hover:text-white font-bold text-sm transition-colors flex items-center gap-1.5 text-white">
              <Newspaper className="w-4 h-4" />
              <span>Noticias</span>
            </Link>
            <Link href="/calendario" className="hover:text-white font-bold text-sm transition-colors flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>Eventos</span>
            </Link>
            <Link href="/map" className="hover:text-white font-bold text-sm transition-colors flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>Mapa</span>
            </Link>
            <div className="h-4 w-px bg-white/20" />
            <Link href="/admin/login" className="p-2 text-white/70 hover:text-white transition-colors">
              <User className="w-5 h-5" />
            </Link>
          </div>

          {/* Mobile Admin Icon */}
          <Link href="/admin/login" className="md:hidden p-2 text-white/70 hover:text-white transition-colors">
            <User className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {newsList.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <p className="text-gray-500 dark:text-gray-400 font-bold text-lg">
              No hay novedades publicadas por el momento.
            </p>
            <p className="text-sm text-gray-400 mt-1">
              ¡Volvé pronto para enterarte de todas las novedades!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {newsList.map((news) => (
              <article 
                key={news.id} 
                className="flex flex-col bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                {/* Image */}
                <div className="relative aspect-video w-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  {news.photoId ? (
                    <img
                      src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dnpmw1mty'}/image/upload/w_600,q_auto,f_auto/${news.photoId}`}
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-brand-primary/5 dark:bg-brand-primary/10">
                      <span className="font-black text-sm text-brand-primary uppercase tracking-widest">Paseos con Peques</span>
                    </div>
                  )}
                  {news.isFeatured && (
                    <span className="absolute top-4 left-4 bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                      Destacado
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-xs text-brand-primary dark:text-brand-primary/80 font-black uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(news.publishedAt).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric"
                      })}
                    </div>
                    
                    <h2 className="text-xl font-black text-gray-900 dark:text-white line-clamp-2 leading-tight group-hover:text-brand-primary transition-colors">
                      <Link href={`/noticias/${news.slug}`}>
                        {news.title}
                      </Link>
                    </h2>

                    {news.subtitle && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                        {news.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="pt-6">
                    <Link
                      href={`/noticias/${news.slug}`}
                      className="inline-block bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-2xl transition-all active:scale-95"
                    >
                      Leer noticia completa
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
