import Image from "next/image";
import Link from "next/link";

import BannerCarousel from "@/presentation/components/BannerCarousel";
import { Facebook, Instagram, MessageCircle, Newspaper, Calendar, MapPin, User } from "lucide-react";

export default function Home() {
  const news = [
    {
      id: 1,
      title: "¡Gran Apertura del Harmony Family Park!",
      description: "Descubre las nuevas instalaciones diseñadas para que los niños disfruten al máximo este fin de semana.",
      image: "/images/noticia_preview.png",
    },
    {
      id: 2,
      title: "Taller de Pintura Creativa",
      description: "Un espacio para que los más pequeños exploren su lado artístico con colores y mucha diversión.",
      image: "/images/noticia_preview_2.png",
    }
  ];

  const events = [
    {
      id: 1,
      title: "Festival de Títeres en Familia",
      time: "Hoy • 16:00 hs",
      location: "Teatro de la Ciudad",
      image: "/images/evento_dia.png",
    },
    {
      id: 2,
      title: "Cuenta Cuentos en el Parque",
      time: "Hoy • 17:30 hs",
      location: "Plaza Central",
      image: "/images/lugar_recomendado.png", // Reusing an image for variety
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-brand-accent dark:bg-brand-accent/90 backdrop-blur-lg pt-safe transition-all duration-300">
        <div className="px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight transition-colors duration-300">
              Paseos con Peques
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/90 transition-colors duration-300">
              Guía cultural para familias
            </p>
          </div>
          <Link href="/admin/login" className="p-2 text-white/70 hover:text-white transition-colors">
            <User className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative w-full bg-gray-900 pb-12 min-h-[calc(100dvh-68px)] flex flex-col justify-start overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0 opacity-80">
          <Image
            src="/images/hero-bg.png"
            alt="Hero background"
            fill
            className="object-cover"
            priority
          />
          {/* Gradient overlay to blend smoothly into the rest of the page */}
          {/* <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/40 to-gray-50 dark:to-gray-900" /> */}
        </div>

        {/* Banner Carousel - Independiente de los links */}
        <div className="relative z-20 w-full p-2 pt-4">
          <BannerCarousel />
        </div>

        {/* Navigation Squares - Rotated 35deg */}
        <div className="relative z-10 w-full flex-1 flex flex-col items-center pb-20 -mt-165 -translate-x-[10%]">
          {/* Noticias */}
          <div className="group relative block w-[150%] aspect-square active:scale-[0.98] transition-transform z-30">
            <div className="absolute inset-0 bg-brand-accent shadow-2xl rotate-[20deg] rounded-[40px] flex items-end justify-end p-3 pr-12">
              <div className="flex items-center gap-4 animate-slide-in-left">
                <Newspaper className="w-10 h-10 text-white flex-shrink-0" strokeWidth={2.5} />
                <div className="flex flex-col items-start">
                  <h2 className="text-white font-black text-3xl tracking-widest leading-none">Noticias</h2>
                  <p className="text-white/90 font-bold text-xs tracking-widest mt-1">Novedades de la ciudad</p>
                </div>
              </div>
            </div>
          </div>

          {/* Eventos */}
          <div className="w-[150%] z-20 -mt-[135%] animate-slide-in-left will-change-transform" style={{ animationDelay: '0.5s' }}>
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
          </div>

          {/* Lugares */}
          <div className="w-[150%] z-10 -mt-[135%] animate-slide-in-left will-change-transform" style={{ animationDelay: '1s' }}>
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
          </div>
        </div>
      </section>

      <div className="p-4 space-y-8 pb-24 -mt-6 relative z-10">

        {/* Noticias section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-100">Noticias</h2>
            <Link href="/news" className="px-4 py-1.5 bg-brand-primary dark:bg-brand-soft hover:bg-brand-accent dark:hover:bg-brand-accent/20 text-brand-accent hover:text-brand-primary dark:hover:text-brand-accent border border-gray-300 dark:border-brand-accent/20 text-[10px] font-black uppercase tracking-widest rounded-full transition-all active:scale-95 shadow-sm">Ver todas</Link>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {news.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="relative aspect-video w-full">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 bg-white dark:bg-gray-800">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Eventos del dia section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-100">Eventos del día</h2>
            <Link href="/calendar" className="px-4 py-1.5 bg-brand-primary dark:bg-brand-soft hover:bg-brand-accent dark:hover:bg-brand-accent/20 text-brand-accent hover:text-brand-primary dark:hover:text-brand-accent border border-gray-300 dark:border-brand-accent/20 text-[10px] font-black uppercase tracking-widest rounded-full transition-all active:scale-95 shadow-sm">Agenda completa</Link>
          </div>
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="flex gap-4 p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="w-20 h-20 relative rounded-xl overflow-hidden flex-none">
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
              </div>
            ))}
          </div>
        </section>

        {/* Lugares recomendados section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-100">Lugares recomendados</h2>
            <Link href="/map" className="px-4 py-1.5 bg-brand-primary dark:bg-brand-soft hover:bg-brand-accent dark:hover:bg-brand-accent/20 text-brand-accent hover:text-brand-primary dark:hover:text-brand-accent border border-gray-300 dark:border-brand-accent/20 text-[10px] font-black uppercase tracking-widest rounded-full transition-all active:scale-95 shadow-sm">Explorar más</Link>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="w-24 h-24 relative rounded-xl overflow-hidden flex-none">
                  <Image
                    src="/images/lugar_recomendado.png"
                    alt={`Lugar recomendado ${i}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">The Nest Family Cafe</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">Un lugar acogedor con zona de juegos para niños.</p>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <div key={s} className="w-3 h-3 bg-yellow-400 dark:bg-yellow-500 rounded-full" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
