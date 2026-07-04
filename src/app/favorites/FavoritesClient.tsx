"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, MapPin, Calendar, ArrowRight, HeartOff, Clock, X, Info, Share2, Check, Globe, Navigation, Users, Ticket, User, MessageCircle } from "lucide-react";
import { useFavorites } from "@/presentation/contexts/FavoritesContext";
import { fortmatDate } from "@/presentation/utils/formatDate";
import Link from "next/link";

interface Place {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  description: string | null;
  schedules: string | null;
  photoUrl: string | null;
  phone: string | null;
  whatsapp: string | null;
  web: string | null;
  instagram: string | null;
  facebook: string | null;
  videoLink: string | null;
  hasFood: boolean;
  hasShow: boolean;
  hasGames: boolean;
  hasSupervision: boolean;
}

interface Occurrence {
  id: string;
  date: string;
  timeStart: string;
  timeEnd: string | null;
  place: {
    id: string;
    name: string;
    address: string;
    phone: string | null;
    whatsapp: string | null;
  };
}

interface Event {
  id: string;
  title: string;
  description: string | null;
  photoId: string | null;
  priceType: string;
  activityTypes: string[];
  ageMin: number;
  ageMax: number | null;
  ticketUrl: string | null;
  bookingWhatsapp: string | null;
  organizers?: { id: string; name: string; slug: string }[];
  occurrences: Occurrence[];
}

interface Props {
  initialPlaces: Place[];
  initialEvents: Event[];
}

type TabType = "places" | "events";

const PRICE_TYPE_LABELS: Record<string, string> = {
  FREE_ENTRY: "Gratuito",
  PAID_TICKET: "Arancelado",
  DONATION_BASED: "A la Gorra",
  WITH_CONSUMPTION: "Con Consumición",
};

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  CIRCUS: "Circo",
  MUSIC: "Música",
  WORKSHOP: "Taller",
  THEATER: "Teatro",
  ENTERTAINMENT: "Entretenimiento",
  FOOD: "Gastronomía",
};

export default function FavoritesClient({ initialPlaces, initialEvents }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("events");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const { favoritePlaceIds, favoriteEventIds, toggleFavoritePlace, toggleFavoriteEvent, isFavoritePlace, isFavoriteEvent } = useFavorites();

  // Filter places and events based on favorite IDs
  const favoritePlaces = initialPlaces.filter(place => favoritePlaceIds.includes(place.id));
  const favoriteEvents = initialEvents.filter(event => favoriteEventIds.includes(event.id));

  const handleShare = async (title: string, text: string, url: string) => {
    const shareData = { title, text, url };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
      } catch (err) {
        console.log('Error copying to clipboard:', err);
      }
    }
  };

  const formatAgeRange = (min: number, max: number | null) => {
    if (min === 0 && !max) return "Todas las edades";
    if (min > 0 && !max) return `A partir de ${min} años`;
    return `${min} a ${max} años`;
  };

  return (
    <div className="min-h-screen pb-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg pt-safe border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="px-4 py-4 flex flex-col">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white transition-colors">
            Mis Favoritos
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Tus lugares y eventos guardados en este dispositivo
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex px-4 border-b border-gray-150 dark:border-gray-800">
          <button
            onClick={() => setActiveTab("places")}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
              activeTab === "places"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-650"
            }`}
          >
            Lugares ({favoritePlaces.length})
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
              activeTab === "events"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-650"
            }`}
          >
            Eventos ({favoriteEvents.length})
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 max-w-2xl mx-auto">
        {activeTab === "places" ? (
          favoritePlaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-fadeIn">
              <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-full text-rose-500">
                <HeartOff className="w-12 h-12" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">No hay lugares guardados</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                  Explora el mapa y toca el corazón para guardar tus lugares preferidos.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fadeIn">
              {favoritePlaces.map(place => {
                const imageUrl = place.photoUrl || "/images/lugar_recomendado.png";

                return (
                  <div
                    key={place.id}
                    onClick={() => setSelectedPlace(place)}
                    className="flex gap-4 p-3 bg-white dark:bg-gray-855 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow duration-200 relative group cursor-pointer"
                  >
                    {/* Place Image */}
                    <div className="w-20 h-20 relative rounded-xl overflow-hidden flex-none bg-gray-100 dark:bg-gray-700">
                      <Image
                        src={imageUrl}
                        alt={place.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Place Info */}
                    <div className="flex flex-col justify-center flex-1 pr-8">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-brand-primary transition-colors">
                        {place.name}
                      </h3>
                      {place.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                          {place.description}
                        </p>
                      )}
                      <p className="text-xs text-brand-primary font-black uppercase tracking-wider mt-1 flex items-center gap-1">
                        <MapPin size={12} className="opacity-70" />
                        {place.address}
                      </p>
                    </div>

                    {/* Unfavorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoritePlace(place.id);
                      }}
                      className="absolute top-3 right-3 p-1.5 bg-gray-55 dark:bg-gray-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-full text-rose-500 hover:text-rose-600 transition-colors duration-155 z-10 cursor-pointer active:scale-90"
                      aria-label="Quitar de favoritos"
                    >
                      <Heart size={16} className="fill-rose-500 text-rose-500" />
                    </button>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          favoriteEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-fadeIn">
              <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-full text-rose-500">
                <HeartOff className="w-12 h-12" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">No hay eventos guardados</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                  Explora la agenda y guarda los eventos que no te quieres perder.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fadeIn">
              {favoriteEvents.map(event => {
                const imageUrl = event.photoId
                  ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dnpmw1mty'}/image/upload/w_300,q_auto,f_auto/${event.photoId}`
                  : "/images/evento_dia.png";

                // Find next upcoming occurrence if any
                const nextOcc = event.occurrences.length > 0 ? event.occurrences[0] : null;

                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="flex gap-4 p-3 bg-white dark:bg-gray-855 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow duration-200 relative group cursor-pointer"
                  >
                    {/* Event Image */}
                    <div className="w-20 h-20 relative rounded-xl overflow-hidden flex-none bg-gray-150 dark:bg-gray-700">
                      <Image
                        src={imageUrl}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Event Info */}
                    <div className="flex flex-col justify-center flex-1 pr-8">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-brand-primary transition-colors">
                        {event.title}
                      </h3>
                      {nextOcc ? (
                        <>
                          <p className="text-xs text-brand-primary font-black uppercase tracking-wider mt-0.5 flex items-center gap-1">
                            <Clock size={12} />
                            {fortmatDate(nextOcc.date)} • {nextOcc.timeStart} hs
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-0.5 mt-0.5">
                            <MapPin size={12} className="opacity-70" />
                            {nextOcc.place.name}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-gray-400 dark:text-gray-500 italic mt-0.5">
                          Sin fechas programadas
                        </p>
                      )}
                    </div>

                    {/* Unfavorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteEvent(event.id);
                      }}
                      className="absolute top-3 right-3 p-1.5 bg-gray-55 dark:bg-gray-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-full text-rose-500 hover:text-rose-600 transition-colors duration-155 z-10 cursor-pointer active:scale-90"
                      aria-label="Quitar de favoritos"
                    >
                      <Heart size={16} className="fill-rose-500 text-rose-500" />
                    </button>
                  </div>
                );
              })}
            </div>
          )
        )}
      </main>

      {/* Place Details Modal */}
      {selectedPlace && (
        <div className="fixed inset-0 z-[10000] flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2rem] shadow-2xl p-6 pb-8 relative animate-slide-up border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6 opacity-50" />

            <button
              onClick={() => toggleFavoritePlace(selectedPlace.id)}
              className="absolute top-6 right-16 p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 cursor-pointer active:scale-90 transition-all z-[110]"
            >
              <Heart size={20} className={isFavoritePlace(selectedPlace.id) ? "fill-rose-500 text-rose-500" : "text-gray-500"} />
            </button>

            <button
              onClick={() => setSelectedPlace(null)}
              className="absolute top-6 right-6 p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 cursor-pointer active:scale-90 transition-all z-[110]"
            >
              <X size={20} />
            </button>

            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                  {selectedPlace.name}
                </h2>

                <div className="space-y-2 mt-2">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <div className="p-1.5 bg-brand-soft rounded-lg">
                      <MapPin size={14} className="text-brand-primary" />
                    </div>
                    <span className="text-xs font-medium">{selectedPlace.address}</span>
                  </div>
                  {selectedPlace.schedules && (
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <div className="p-1.5 bg-brand-soft rounded-lg">
                        <Clock size={14} className="text-brand-primary" />
                      </div>
                      <span className="text-xs font-medium">{selectedPlace.schedules}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedPlace.description && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Info size={16} className="text-brand-primary" />
                    <span className="text-xs font-black uppercase tracking-wider">Acerca del lugar</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    {selectedPlace.description}
                  </p>
                </div>
              )}

              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedPlace.name} Mar del Plata`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3.5 px-4 rounded-xl bg-brand-primary text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-brand/20 hover:opacity-90 active:scale-[0.98] transition-all"
                  >
                    <Navigation size={16} />
                    CÓMO LLEGAR
                  </a>

                  <button
                    onClick={() => handleShare(
                      selectedPlace.name,
                      `¡Mira este lugar!: ${selectedPlace.name} en Mar del Plata.`,
                      `${window.location.origin}/map?place=${selectedPlace.id}`
                    )}
                    className="flex-1 py-3.5 px-4 rounded-xl bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-black flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-[0.98] transition-all relative overflow-hidden"
                  >
                    {copyFeedback ? (
                      <>
                        <Check size={16} className="text-green-500" />
                        COPIADO
                      </>
                    ) : (
                      <>
                        <Share2 size={16} className="text-brand-primary" />
                        COMPARTIR
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Redes del lugar</span>
                    <span className="text-[9px] text-gray-400 font-medium text-left">Ver fotos y comunidad</span>
                  </div>
                  <div className="flex gap-2">
                    {[
                      { icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>, label: "Facebook", link: selectedPlace.facebook },
                      { icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>, label: "Instagram", link: selectedPlace.instagram },
                      { icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.558 0 11.895-5.335 11.898-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>, label: "WhatsApp", link: selectedPlace.whatsapp ? `https://wa.me/${selectedPlace.whatsapp}` : null },
                      { icon: <Globe size={16} />, label: "Sitio Web", link: selectedPlace.web },
                    ].map((social, idx) => {
                      if (!social.link) return null;
                      return (
                        <a
                          key={idx}
                          href={social.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-gray-55 dark:bg-gray-800 text-gray-400 hover:text-brand-accent transition-all active:scale-90 border border-gray-100 dark:border-gray-800 flex items-center justify-center"
                          aria-label={social.label}
                        >
                          {social.icon}
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[10000] flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2rem] shadow-2xl p-6 pb-8 relative animate-slide-up border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6 opacity-50" />

            <button
              onClick={() => toggleFavoriteEvent(selectedEvent.id)}
              className="absolute top-6 right-16 p-2 bg-gray-55 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-450 hover:text-rose-500 dark:hover:text-rose-400 cursor-pointer active:scale-90 transition-all z-[110]"
            >
              <Heart size={20} className={isFavoriteEvent(selectedEvent.id) ? "fill-rose-500 text-rose-500" : "text-gray-550"} />
            </button>

            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-6 right-6 p-2 bg-gray-55 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 cursor-pointer active:scale-90 transition-all z-[110]"
            >
              <X size={20} />
            </button>

            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <div className="flex gap-1.5 flex-wrap">
                  {selectedEvent.activityTypes.map((type) => (
                    <span key={type} className="inline-block px-2.5 py-1 rounded-lg bg-brand-accent/10 text-brand-accent text-[10px] font-black tracking-widest uppercase">
                      {ACTIVITY_TYPE_LABELS[type] || type}
                    </span>
                  ))}
                </div>

                <h2 className="text-2xl font-black text-gray-955 dark:text-white leading-tight">
                  {selectedEvent.title}
                </h2>
              </div>

              {selectedEvent.photoId && (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-855 shadow-sm">
                  <img
                    src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dnpmw1mty'}/image/upload/w_800,q_auto,f_auto/${selectedEvent.photoId}`}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-gray-55 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                    <Clock size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">Horario</span>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                      {selectedEvent.occurrences[0]?.timeStart || "A definir"}
                      {selectedEvent.occurrences[0]?.timeEnd ? ` a ${selectedEvent.occurrences[0]?.timeEnd}` : ' hs'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-55 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-xl text-purple-600 dark:text-purple-400">
                    <Users size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">Edad</span>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                      {formatAgeRange(selectedEvent.ageMin, selectedEvent.ageMax)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedEvent.occurrences[0]?.place && (
                <div className="p-4 bg-gray-55 dark:bg-gray-800/20 rounded-2xl border border-gray-100 dark:border-gray-800/50">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-400">
                      <MapPin size={18} />
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="text-sm font-bold text-gray-955 dark:text-white leading-tight">{selectedEvent.occurrences[0].place.name}</span>
                      <span className="text-[12px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">{selectedEvent.occurrences[0].place.address}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedEvent.description && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                        <Info size={16} className="text-brand-primary" />
                                        <span className="text-xs font-black uppercase tracking-wider">Acerca del evento</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium whitespace-pre-line">
                                        {selectedEvent.description}
                                    </p>
                                </div>
                            )}

                            {/* Organizadores */}
                            {selectedEvent.organizers && selectedEvent.organizers.length > 0 && (
                                <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800/50">
                                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                        <User size={16} className="text-brand-primary" />
                                        <span className="text-xs font-black uppercase tracking-wider">Organizadores</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedEvent.organizers.map((eo: any) => (
                                            <Link
                                                key={eo.id}
                                                href={`/perfil/${eo.slug}`}
                                                className="inline-block px-2.5 py-1 text-xs font-bold bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 rounded-xl transition-all cursor-pointer"
                                            >
                                                {eo.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Precio */}
                            <div className="flex items-center gap-3 p-3 bg-gray-55 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl text-emerald-600 dark:text-emerald-400">
                                    <Ticket size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-400 dark:text-gray-550 uppercase font-bold tracking-wider">Precio</span>
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                        {PRICE_TYPE_LABELS[selectedEvent.priceType] || selectedEvent.priceType}
                                    </span>
                                </div>
                            </div>

                            {/* Reservas / Entradas */}
                            {(selectedEvent.ticketUrl || selectedEvent.bookingWhatsapp || (selectedEvent.priceType === 'PAID_TICKET' && (selectedEvent.occurrences[0]?.place?.whatsapp || selectedEvent.occurrences[0]?.place?.phone))) && (
                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800/50 space-y-3">
                                    {selectedEvent.ticketUrl ? (
                                        <a 
                                            href={selectedEvent.ticketUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-3.5 px-4 rounded-xl bg-brand-primary text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 hover:opacity-90 active:scale-[0.98] transition-all"
                                        >
                                            <Globe size={16} />
                                            RESERVAR ENTRADAS
                                        </a>
                                    ) : null}

                                    {selectedEvent.bookingWhatsapp ? (
                                        <a 
                                            href={`https://wa.me/${selectedEvent.bookingWhatsapp.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-3.5 px-4 rounded-xl bg-green-600 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-green-650/20 hover:bg-green-700 active:scale-[0.98] transition-all"
                                        >
                                            <MessageCircle size={16} />
                                            CONTACTAR POR WHATSAPP
                                        </a>
                                    ) : (
                                        selectedEvent.priceType === 'PAID_TICKET' && (
                                            <>
                                                {!selectedEvent.ticketUrl && selectedEvent.occurrences[0]?.place?.whatsapp && (
                                                    <a 
                                                        href={`https://wa.me/${selectedEvent.occurrences[0].place.whatsapp.replace(/[^0-9]/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-full py-3.5 px-4 rounded-xl bg-green-600 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-green-650/20 hover:bg-green-700 active:scale-[0.98] transition-all"
                                                    >
                                                        💬 RESERVAR POR WHATSAPP
                                                    </a>
                                                )}
                                                {!selectedEvent.ticketUrl && !selectedEvent.occurrences[0]?.place?.whatsapp && selectedEvent.occurrences[0]?.place?.phone && (
                                                    <a 
                                                        href={`tel:${selectedEvent.occurrences[0].place.phone}`}
                                                        className="w-full py-3.5 px-4 rounded-xl bg-brand-primary text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 hover:opacity-90 active:scale-[0.98] transition-all"
                                                    >
                                                        📞 RESERVAR POR TELÉFONO
                                                    </a>
                                                )}
                                            </>
                                        )
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                  {selectedEvent.occurrences[0]?.place && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEvent.occurrences[0].place.name + ", " + selectedEvent.occurrences[0].place.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3.5 px-4 rounded-xl bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-black flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-[0.98] transition-all"
                    >
                      <MapPin size={16} className="text-brand-primary" />
                      COMO LLEGAR
                    </a>
                  )}

                  <button
                    onClick={() => handleShare(
                      selectedEvent.title,
                      `¡Mira este plan!: ${selectedEvent.title}.`,
                      `${window.location.origin}/calendario?event=${selectedEvent.id}`
                    )}
                    className="flex-1 py-3.5 px-4 rounded-xl bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-black flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-[0.98] transition-all relative overflow-hidden"
                  >
                    {copyFeedback ? (
                      <>
                        <Check size={16} className="text-green-500" />
                        COPIADO
                      </>
                    ) : (
                      <>
                        <Share2 size={16} className="text-brand-primary" />
                        COMPARTIR
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
      )}
    </div>
  );
}
