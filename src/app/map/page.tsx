"use client";

import dynamic from 'next/dynamic';
import { Search, MapPin, Navigation, Filter, X, Clock, Info, Share2, Check, Globe, Heart } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Place } from '@/domain/entities/Place';
import { getPlaces } from '@/actions/places';
import { getCategoryLabel } from '@/presentation/utils/category';
import { useFavorites } from '@/presentation/contexts/FavoritesContext';

// Import map component dynamically to avoid SSR issues with Leaflet
const MapContainer = dynamic(
    () => import('@/presentation/components/MapContainer'),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <MapPin className="text-brand-accent animate-bounce" size={32} />
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Cargando mapa...</span>
                </div>
            </div>
        )
    }
);

export default function MapPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white dark:bg-gray-900" />}>
            <MapContent />
        </Suspense>
    );
}

function MapContent() {
    const { isFavoritePlace, toggleFavoritePlace } = useFavorites();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [places, setPlaces] = useState<Place[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
    const [copyFeedback, setCopyFeedback] = useState(false);
    const categories = ["Todos", "Cultura", "Al Aire Libre", "Entretenimiento", "Gastronomía", "Todo el Día", "Con Profe"];
    const [activeCategory, setActiveCategory] = useState("Todos");

    // Fetch places from database
    useEffect(() => {
        getPlaces().then((data) => {
            // Filter only active and map-visible places
            const activePlaces = (data || []).filter(p => p.isActive && p.isShowInMap) as Place[];
            setPlaces(activePlaces);
        });
    }, []);

    // Handle Deep Linking: Open modal if place ID is in URL
    useEffect(() => {
        if (places.length === 0) return;
        const placeId = searchParams.get('place');
        if (placeId) {
            const place = places.find(p => p.id === placeId);
            if (place) {
                setSelectedPlace(place);
            }
        }
    }, [searchParams, places]);

    const handleSelectPlace = (place: Place) => {
        setSelectedPlace(place);
        const params = new URLSearchParams(searchParams.toString());
        params.set('place', place.id);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleCloseModal = () => {
        setSelectedPlace(null);
        const params = new URLSearchParams(searchParams.toString());
        params.delete('place');
        const query = params.toString() ? `?${params.toString()}` : '';
        router.push(`${pathname}${query}`, { scroll: false });
    };

    const handleShare = async (place: Place) => {
        const baseUrl = window.location.origin + pathname;
        const shareUrl = `${baseUrl}?place=${place.id}`;

        const shareData = {
            title: place.name,
            text: `¡Mira este lugar!: ${place.name} en Mar del Plata.`,
            url: shareUrl,
        };

        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                setCopyFeedback(true);
                setTimeout(() => setCopyFeedback(false), 2000);
            } catch (err) {
                console.log('Error copying to clipboard:', err);
            }
        }
    };

    // Filter places based on category and search query
    const filteredPlaces = places.filter(place => {
        // Category Filter
        if (activeCategory !== "Todos") {
            const categoryEnumMap: Record<string, string> = {
                "Cultura": "CULTURE",
                "Al Aire Libre": "OUTDOORS",
                "Entretenimiento": "ENTERTAINMENT",
                "Gastronomía": "FOOD",
                "Todo el Día": "ALL_DAY",
                "Con Profe": "SUPERVISION"
            };
            const targetEnum = categoryEnumMap[activeCategory];
            if (!place.categories.includes(targetEnum as any)) {
                return false;
            }
        }

        // Search Query Filter
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            const nameMatch = place.name.toLowerCase().includes(query);
            const descMatch = place.description?.toLowerCase().includes(query) || false;
            const addressMatch = place.address?.toLowerCase().includes(query) || false;
            return nameMatch || descMatch || addressMatch;
        }

        return true;
    });

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 relative overflow-hidden">
            {/* Unified Search & Filter Header */}
            <div className="absolute top-0 left-0 right-0 z-[1000] p-0 pt-safe pointer-events-none">
                <div className="w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-xl border-b border-gray-100 dark:border-gray-800 pointer-events-auto overflow-hidden">
                    <div className="p-1.5 flex flex-col">
                        {/* Search Input */}
                        <div className="flex items-center gap-2 p-1.5">
                            <div className="p-2 text-brand-primary">
                                <Search size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="¿A dónde vamos hoy?"
                                className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-gray-900 dark:text-white placeholder:text-gray-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery("")} 
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            )}
                            <button className="p-2 text-gray-400 hover:text-brand-accent transition-colors">
                                <Filter size={18} />
                            </button>
                        </div>

                        {/* Floating Search Results */}
                        {searchQuery.trim() !== "" && (
                            <div className="max-h-60 overflow-y-auto border-t border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                                {filteredPlaces.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                        No se encontraron lugares
                                    </div>
                                ) : (
                                    filteredPlaces.map((place) => (
                                        <button
                                            key={place.id}
                                            onClick={() => {
                                                handleSelectPlace(place);
                                                setSearchQuery("");
                                            }}
                                            className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 flex items-center gap-3 transition-colors cursor-pointer"
                                        >
                                            <MapPin className="text-brand-primary flex-shrink-0" size={18} />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{place.name}</h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{place.address}</p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Integrated Filters */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar p-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${activeCategory === cat
                                        ? 'bg-brand-accent text-white shadow-lg shadow-brand/20'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Container - Zero index to be behind overlay */}
            <div className="flex-1 relative z-0">
                <MapContainer places={filteredPlaces} onSelectPlace={handleSelectPlace} selectedPlace={selectedPlace} />
            </div>

            {/* Place Details Modal */}
            {selectedPlace && (
                <div className="fixed inset-0 z-[10000] flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2rem] shadow-2xl p-6 pb-8 relative animate-slide-up border border-gray-100 dark:border-gray-800">
                        <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6 opacity-50" />

                        <button
                            onClick={() => toggleFavoritePlace(selectedPlace.id)}
                            className="absolute top-6 right-16 p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 cursor-pointer active:scale-90 transition-all z-[110]"
                            aria-label={isFavoritePlace(selectedPlace.id) ? "Quitar de favoritos" : "Guardar en favoritos"}
                        >
                            <Heart size={20} className={isFavoritePlace(selectedPlace.id) ? "fill-rose-500 text-rose-500" : "text-gray-500"} />
                        </button>

                        <button
                            onClick={handleCloseModal}
                            className="absolute top-6 right-6 p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 cursor-pointer active:scale-90 transition-all z-[110]"
                        >
                            <X size={20} />
                        </button>

                        <div className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedPlace.categories.map((cat) => (
                                        <div key={cat} className="inline-block self-start px-2.5 py-1 rounded-lg bg-accent-soft text-brand-accent text-[10px] font-black tracking-widest uppercase">
                                            {getCategoryLabel(cat)}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-start gap-4 mt-1">
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                                        {selectedPlace.name}
                                    </h2>
                                </div>

                                <div className="space-y-2 mt-1">
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
                                        onClick={() => handleShare(selectedPlace)}
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
                                                    className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-brand-accent transition-all active:scale-90 border border-gray-100 dark:border-gray-800 flex items-center justify-center"
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
        </div>
    );
}
