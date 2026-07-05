import React from "react";
import Link from "next/link";
import { getNewsBySlug } from "@/actions/news";
import { Calendar, ArrowLeft, Share2, Home as HomeIcon, Newspaper, MapPin, User } from "lucide-react";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

// Generate SEO Metadata dynamically
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const newsItem = await getNewsBySlug(slug);

  if (!newsItem) {
    return {
      title: "Noticia no encontrada - Paseos con Peques",
    };
  }

  return {
    title: `${newsItem.title} - Paseos con Peques`,
    description: newsItem.subtitle || newsItem.content.substring(0, 150),
    openGraph: {
      title: newsItem.title,
      description: newsItem.subtitle || newsItem.content.substring(0, 150),
      type: "article",
      publishedTime: newsItem.publishedAt.toISOString(),
      images: newsItem.photoId
        ? [
            {
              url: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dnpmw1mty'}/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/${newsItem.photoId}`,
              width: 1200,
              height: 630,
              alt: newsItem.title,
            },
          ]
        : [],
    },
  };
}

export default async function PublicNewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const newsItem = await getNewsBySlug(slug);

  if (!newsItem || !newsItem.isActive) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-brand-accent dark:bg-brand-accent/90 backdrop-blur-lg pt-safe border-b border-white/10">
        <div className="px-4 py-3 flex justify-between items-center max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-4 max-w-xl">
            <Link href="/noticias" className="text-white hover:text-white/80 transition-colors flex-shrink-0">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/70 block">
                Noticias
              </span>
              <span className="text-xs font-bold text-white/90 line-clamp-1">
                {newsItem.title}
              </span>
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
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        <article className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-700 p-6 md:p-10 space-y-6">
          
          {/* Metadata */}
          <div className="flex items-center gap-2 text-xs text-brand-primary dark:text-brand-primary/85 font-black uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            {new Date(newsItem.publishedAt).toLocaleDateString("es-AR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight">
            {newsItem.title}
          </h1>

          {/* Subtitle / Copete */}
          {newsItem.subtitle && (
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 font-medium border-l-4 border-brand-primary pl-4 py-1 italic">
              {newsItem.subtitle}
            </p>
          )}

          {/* Image */}
          {newsItem.photoId && (
            <div 
              className="relative w-full rounded-2xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700"
              style={{ aspectRatio: newsItem.photoWidth && newsItem.photoHeight ? `${newsItem.photoWidth}/${newsItem.photoHeight}` : '16/9' }}
            >
              <img
                src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dnpmw1mty'}/image/upload/w_1000,q_auto,f_auto/${newsItem.photoId}`}
                alt={newsItem.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content Body */}
          <div className="text-gray-800 dark:text-gray-200 text-base md:text-lg leading-relaxed whitespace-pre-line font-sans space-y-4">
            {newsItem.content}
          </div>

        </article>
      </main>
    </div>
  );
}
