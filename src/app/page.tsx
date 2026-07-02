import Image from "next/image";
import Link from "next/link";

import BannerCarousel from "@/presentation/components/BannerCarousel";
import { Share2, Camera, MessageCircle, Newspaper, Calendar, MapPin, User, Home as HomeIcon, Heart } from "lucide-react";
import { getActiveNews } from "@/actions/news";
import { FavoriteHeartButton } from "@/presentation/components/common/FavoriteHeartButton";

import prisma from "@/data/prisma/db";

// Note: Facebook & Instagram icons were removed from lucide-react; using Share2 and Camera as placeholders
const Facebook = Share2;
const Instagram = Camera;


export default async function Home() {
  const dbNews = await getActiveNews();
  const news = dbNews.slice(0, 2).map((item) => ({
    id: item.id,
    title: item.title,
    description: item.subtitle || item.content.substring(0, 150),
    image: item.photoId
      ? `https://res.cloudinary.com/dwhdla1b4/image/upload/w_600,q_auto,f_auto/v1749595725/pcp-images/${item.photoId}`
      : "/images/noticia_preview.png",
    slug: item.slug,
  }));

  // Calculate today's date at midnight UTC adjusted for UTC-3 (Argentina)
  const today = new Date();
  const offset = -3;
  const localDate = new Date(today.getTime() + offset * 3600000);
  const startOfToday = new Date(Date.UTC(localDate.getUTCFullYear(), localDate.getUTCMonth(), localDate.getUTCDate()));

  const dbOccurrences = await prisma.eventOccurrence.findMany({
    where: {
      date: startOfToday,
    },
    include: {
      event: true,
      place: true,
    },
    orderBy: {
      timeStart: "asc",
    },
  });

  const events = dbOccurrences.map((occ) => ({
    id: occ.id,
    eventId: occ.event.id,
    title: occ.event.title,
    time: `Hoy • ${occ.timeStart} hs`,
    location: occ.place.name,
    image: occ.event.photoId
      ? `https://res.cloudinary.com/dwhdla1b4/image/upload/w_300,q_auto,f_auto/v1749595725/pcp-images/${occ.event.photoId}`
      : "/images/evento_dia.png",
  }));

  // Fetch recommended places from the database
  const dbPlaces = await prisma.place.findMany({
    where: {
      isActive: true,
    },
    orderBy: [
      { isFeatured: "desc" },
      { createdAt: "desc" },
    ],
    take: 3,
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-brand-accent dark:bg-brand-accent/90 backdrop-blur-lg pt-safe transition-all duration-300">
        <div className="px-4 py-3 flex justify-between items-center max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight transition-colors duration-300">
              Paseos con Peques
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/90 transition-colors duration-300">
              Guía cultural para familias
            </p>
          </div>

          {/* Desktop/Tablet Navigation Icons in Header */}
          <div className="hidden md:flex items-center gap-6 text-white/90">
            <Link href="/" className="hover:text-white font-bold text-sm transition-colors flex items-center gap-1.5">
              <HomeIcon className="w-4 h-4" />
              <span>Inicio</span>
            </Link>
            <Link href="/noticias" className="hover:text-white font-bold text-sm transition-colors flex items-center gap-1.5">
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

      {/* Mobile View Hero (Original Design) */}
      <div className="block md:hidden w-full">
        <section className="relative w-full bg-gray-900 pb-12 min-h-[calc(100dvh-68px)] flex flex-col justify-start overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0 z-0 opacity-80">
            <Image
              src="/images/img-rambla.webp"
              alt="Hero background"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Banner Carousel */}
          <div className="relative z-20 w-full p-2 pt-4">
            <BannerCarousel />
          </div>

          {/* Navigation Squares - Rotated 35deg */}
          <div className="relative z-10 w-full flex-1 flex flex-col items-center pb-20 -mt-165 -translate-x-[10%]">
            {/* Noticias */}
            <Link href="/noticias" className="group relative block w-[750px] aspect-square active:scale-[0.98] transition-transform z-30">
              <div className="absolute inset-0 bg-brand-accent shadow-2xl rotate-[20deg] rounded-[40px] flex items-end justify-end p-3 pr-12">
                <div className="flex items-center gap-4 animate-slide-in-left">
                  <Newspaper className="w-10 h-10 text-white flex-shrink-0" strokeWidth={2.5} />
                  <div className="flex flex-col items-start">
                    <h2 className="text-white font-black text-3xl tracking-widest leading-none">Noticias</h2>
                    <p className="text-white/90 font-bold text-xs tracking-widest mt-1">Novedades de la ciudad</p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Eventos */}
            <Link href="/calendario" className="w-[750px] z-20 -mt-[650px] animate-slide-in-left will-change-transform block" style={{ animationDelay: '0.5s' }}>
              <div className="group relative block w-full aspect-square active:scale-[0.98] transition-transform">
                <div className="absolute inset-0 bg-brand-primary/80 shadow-2xl rotate-[20deg] rounded-[40px] flex items-end justify-end p-3 pr-12">
                  <div className="flex items-center gap-4">
                    <Calendar className="w-10 h-10 text-white flex-shrink-0" strokeWidth={2.5} />
                    <div className="flex flex-col items-start">
                      <h2 className="text-white font-black text-3xl tracking-widest leading-none">EVENTOS</h2>
                      <p className="text-white/90 font-bold text-xs tracking-widest mt-1">Nuestro Calendario</p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Lugares */}
            <Link href="/map" className="w-[750px] z-10 -mt-[650px] animate-slide-in-left will-change-transform block" style={{ animationDelay: '1s' }}>
              <div className="group relative block w-full aspect-square active:scale-[0.98] transition-transform">
                <div className="absolute inset-0 bg-white/60 dark:bg-gray-300/60 shadow-2xl rotate-[20deg] rounded-[40px] flex items-end justify-end p-3 pr-12">
                  <div className="flex items-center gap-4">
                    <MapPin className="w-10 h-10 text-brand-primary flex-shrink-0" strokeWidth={2.5} />
                    <div className="flex flex-col items-start">
                      <h2 className="text-brand-primary font-black text-3xl tracking-widest leading-none">LUGARES</h2>
                      <p className="text-brand-primary/90 font-bold text-xs tracking-widest mt-1">Mapa Interactivo</p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      </div>

      {/* Tablet & Desktop View Hero (Slanted Background & Bottom Tabs) */}
      <div className="hidden md:flex flex-col justify-between min-h-[calc(100vh-68px)] relative w-full">
        {/* Slanted Background Images */}
        <div className="absolute inset-0 z-0 flex">
          {/* Left Image (Noticias) - Spans from 0% to 40% of screen width */}
          <div
            className="absolute top-0 left-0 w-[40%] h-full bg-gray-900 transition-all duration-500"
            style={{ clipPath: 'polygon(0 0, 95% 0, 70% 100%, 0 100%)' }}
          >
            <Image
              src="/images/img-rambla.webp"
              alt="Noticias BG"
              fill
              className="object-cover opacity-40 hover:opacity-50 transition-opacity duration-300"
              priority
            />
          </div>
          {/* Middle Image (Eventos) - Spans from 25% to 75% of screen width */}
          <div
            className="absolute top-0 left-[25%] w-[50%] h-full bg-gray-900 transition-all duration-500"
            style={{ clipPath: 'polygon(26% 0, 94% 0, 74% 100%, 6% 100%)' }}
          >
            <Image
              src="/images/img-puerto.webp"
              alt="Eventos BG"
              fill
              className="object-cover opacity-45 hover:opacity-55 transition-opacity duration-300"
              priority
            />
          </div>
          {/* Right Image (Lugares) - Spans from 60% to 100% of screen width */}
          <div
            className="absolute top-0 right-0 w-[40%] h-full bg-gray-900 transition-all duration-500"
            style={{ clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 5% 100%)' }}
          >
            <Image
              src="/images/img-molinos.webp"
              alt="Lugares BG"
              fill
              className="object-cover opacity-40 hover:opacity-50 transition-opacity duration-300"
              priority
            />
          </div>
          {/* Dark Overlay for Text Contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 z-10 pointer-events-none" />
        </div>

        {/* Center Banner Carousel */}
        <div className="relative z-20 flex-1 flex items-start justify-center max-w-4xl mx-auto w-full px-6 pt-16 pb-12">
          <div className="w-full bg-gray-950/40 backdrop-blur-md p-5 rounded-[32px] border border-white/10 shadow-2xl">
            <BannerCarousel />
          </div>
        </div>

        {/* Bottom Navigation Tabs */}
        <div className="relative z-20 w-full">
          <div className="w-full grid grid-cols-8">
            {/* Left Empty Tab */}
            <div className="col-span-1 border-t border-white/15 bg-black/40 backdrop-blur-md" />

            {/* Noticias Tab */}
            <Link href="/noticias" className="col-span-2 group px-4 lg:px-8 py-5 flex items-center justify-start gap-4 bg-brand-accent/90 hover:bg-brand-accent transition-all duration-300 border-t border-white/15">
              <div className="p-2.5 bg-white/20 rounded-xl flex-shrink-0">
                <Newspaper className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col items-start min-w-0">
                <span className="text-white font-black text-base lg:text-lg tracking-wider uppercase leading-none truncate w-full">Noticias</span>
                <span className="text-white/85 text-[11px] lg:text-xs font-bold tracking-wide mt-1 hidden md:inline truncate w-full">Novedades de la ciudad</span>
              </div>
            </Link>

            {/* Eventos Tab */}
            <Link href="/calendario" className="col-span-2 group px-4 lg:px-8 py-5 flex items-center justify-start gap-4 bg-brand-primary/95 hover:bg-brand-primary transition-all duration-300 border-t border-white/15">
              <div className="p-2.5 bg-white/20 rounded-xl flex-shrink-0">
                <Calendar className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col items-start min-w-0">
                <span className="text-white font-black text-base lg:text-lg tracking-wider uppercase leading-none truncate w-full">Eventos</span>
                <span className="text-white/85 text-[11px] lg:text-xs font-bold tracking-wide mt-1 hidden md:inline truncate w-full">Nuestro Calendario</span>
              </div>
            </Link>

            {/* Lugares Tab */}
            <Link href="/map" className="col-span-2 group px-4 lg:px-8 py-5 flex items-center justify-start gap-4 bg-white/95 dark:bg-gray-850/95 hover:bg-white dark:hover:bg-gray-850 transition-all duration-300 border-t border-white/15">
              <div className="p-2.5 bg-brand-primary/10 dark:bg-brand-primary/20 rounded-xl flex-shrink-0">
                <MapPin className="w-6 h-6 text-brand-primary dark:text-brand-accent group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col items-start min-w-0">
                <span className="text-brand-primary dark:text-white font-black text-base lg:text-lg tracking-wider uppercase leading-none truncate w-full">Lugares</span>
                <span className="text-brand-primary/85 dark:text-gray-300 text-[11px] lg:text-xs font-bold tracking-wide mt-1 hidden md:inline truncate w-full">Mapa Interactivo</span>
              </div>
            </Link>

            {/* Right Empty Tab */}
            <div className="col-span-1 border-t border-white/15 bg-black/40 backdrop-blur-md" />
          </div>
        </div>
      </div>

      {/* Unified Content Sections (Below the Hero, visible on all viewports) */}
      <div className="w-full max-w-6xl mx-auto p-4 md:p-8 space-y-12 pb-24 relative z-10">

        {/* Noticias section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Noticias</h2>
            <Link href="/noticias" className="px-4 py-1.5 bg-brand-primary dark:bg-brand-soft hover:bg-brand-accent dark:hover:bg-brand-accent/20 text-brand-accent hover:text-brand-primary dark:hover:text-brand-accent border border-gray-300 dark:border-brand-accent/20 text-[10px] font-black uppercase tracking-widest rounded-full transition-all active:scale-95 shadow-sm">Ver todas</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {news.length === 0 ? (
              <div className="p-6 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 col-span-full">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">No hay noticias publicadas todavía.</p>
              </div>
            ) : (
              news.map((item) => (
                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-300">
                  <div className="relative aspect-video w-full">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                      {item.slug ? (
                        <Link href={`/noticias/${item.slug}`} className="hover:text-brand-primary transition-colors">
                          {item.title}
                        </Link>
                      ) : (
                        item.title
                      )}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Eventos del dia section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Eventos del día</h2>
            <Link href="/calendario" className="px-4 py-1.5 bg-brand-primary dark:bg-brand-soft hover:bg-brand-accent dark:hover:bg-brand-accent/20 text-brand-accent hover:text-brand-primary dark:hover:text-brand-accent border border-gray-300 dark:border-brand-accent/20 text-[10px] font-black uppercase tracking-widest rounded-full transition-all active:scale-95 shadow-sm">Agenda completa</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.length === 0 ? (
              <div className="p-6 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 col-span-full">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">No hay eventos programados para hoy.</p>
                <Link href="/calendario" className="text-xs text-brand-primary hover:underline mt-1 inline-block font-bold">Ver toda la agenda ➔</Link>
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="relative group">
                  <Link
                    href={`/calendario?event=${event.eventId}`}
                    className="flex gap-4 p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200 block pr-12 h-full"
                  >
                    <div className="w-20 h-20 relative rounded-xl overflow-hidden flex-none bg-gray-150 dark:bg-gray-700">
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{event.title}</h3>
                      <p className="text-xs text-brand-primary font-black uppercase tracking-wider">{event.time}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{event.location}</p>
                    </div>
                  </Link>
                  <FavoriteHeartButton
                    id={event.eventId}
                    type="event"
                    className="absolute top-1/2 -translate-y-1/2 right-3 z-10 bg-gray-50 dark:bg-gray-750 shadow-sm border border-gray-100 dark:border-gray-700"
                  />
                </div>
              ))
            )}
          </div>
        </section>

        {/* Lugares recomendados section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Lugares recomendados</h2>
            <Link href="/map" className="px-4 py-1.5 bg-brand-primary dark:bg-brand-soft hover:bg-brand-accent dark:hover:bg-brand-accent/20 text-brand-accent hover:text-brand-primary dark:hover:text-brand-accent border border-gray-300 dark:border-brand-accent/20 text-[10px] font-black uppercase tracking-widest rounded-full transition-all active:scale-95 shadow-sm">Explorar más</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dbPlaces.length === 0 ? (
              <div className="p-6 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 col-span-full">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">No hay lugares cargados todavía.</p>
              </div>
            ) : (
              dbPlaces.map((place) => (
                <div key={place.id} className="relative group">
                  <Link
                    href={`/map?place=${place.id}`}
                    className="flex gap-4 p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700 hover:shadow-md transition-shadow duration-200 block pr-12 h-full"
                  >
                    <div className="w-24 h-24 relative rounded-xl overflow-hidden flex-none bg-gray-100 dark:bg-gray-700">
                      <Image
                        src={place.photoUrl || "/images/lugar_recomendado.png"}
                        alt={place.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-center flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100">{place.name}</h3>
                      {place.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{place.description}</p>
                      )}
                      <p className="text-xs text-brand-primary font-bold mt-1">{place.address}</p>
                    </div>
                  </Link>
                  <FavoriteHeartButton
                    id={place.id}
                    type="place"
                    className="absolute top-1/2 -translate-y-1/2 right-3 z-10 bg-gray-50 dark:bg-gray-750 shadow-sm border border-gray-100 dark:border-gray-700"
                  />
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
