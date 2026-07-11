"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, MapPin, Clock, Users, Info, Share2, Check, Globe, AlertCircle, Heart, Home as HomeIcon, Newspaper, User, Ticket, MessageCircle, Star } from 'lucide-react';
import { useFavorites } from '@/presentation/contexts/FavoritesContext';
import Link from 'next/link';
import { getOccurrencesByMonth } from "@/actions/events";
import { PriceType, ActivityType } from "@prisma/client";

// Map PriceType enum to friendly Spanish text
const PRICE_TYPE_LABELS: Record<PriceType, string> = {
  FREE_ENTRY: "Gratuito",
  PAID_TICKET: "Arancelado",
  DONATION_BASED: "A la Gorra",
  WITH_CONSUMPTION: "Con Consumición",
};

// Map ActivityType enum to friendly Spanish text
const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  CIRCUS: "Circo",
  MUSIC: "Música",
  WORKSHOP: "Taller",
  THEATER: "Teatro",
  ENTERTAINMENT: "Entretenimiento",
  FOOD: "Gastronomía",
};

type ViewType = 'day' | 'week' | 'month';

export default function CalendarPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-primary"></div>
            </div>
        }>
            <CalendarContent />
        </Suspense>
    );
}

function CalendarContent() {
    const { isFavoriteEvent, toggleFavoriteEvent } = useFavorites();
    const [mounted, setMounted] = useState(false);
    const [viewType, setViewType] = useState<ViewType>('day');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewDate, setViewDate] = useState(new Date());
    const [occurrences, setOccurrences] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    
    const scrollRef = useRef<HTMLDivElement>(null);
    const selectedRef = useRef<HTMLButtonElement>(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [copyFeedback, setCopyFeedback] = useState(false);

    const [activeMobileTab, setActiveMobileTab] = useState<'featured' | 'all'>('featured');

    // Helper to format occurrence date and time in Spanish (e.g., Sáb 12 jul · 17:00)
    const formatOccurrenceDateTime = (dateVal: string | Date, timeStart: string) => {
        const d = new Date(dateVal);
        const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        
        const dayName = weekdays[d.getUTCDay()];
        const dayNum = d.getUTCDate();
        const monthName = months[d.getUTCMonth()];
        
        return `${dayName} ${dayNum} ${monthName} · ${timeStart}`;
    };

    const featuredOccurrences = useMemo(() => {
        const seenEventIds = new Set<string>();
        return occurrences.filter(occ => {
            if (!occ.event.isFeatured) return false;
            if (seenEventIds.has(occ.event.id)) return false;
            seenEventIds.add(occ.event.id);
            return true;
        });
    }, [occurrences]);

    // Fetch occurrences from database whenever the viewed month changes
    useEffect(() => {
        const fetchOccurrences = async () => {
            setLoading(true);
            try {
                const year = viewDate.getFullYear();
                const month = viewDate.getMonth() + 1; // getMonth is 0-indexed
                const data = await getOccurrencesByMonth(year, month);
                setOccurrences(data);
            } catch (err) {
                console.error("Error fetching occurrences:", err);
            } finally {
                setLoading(false);
            }
        };
        
        if (mounted) {
            fetchOccurrences();
        }
    }, [viewDate.getFullYear(), viewDate.getMonth(), mounted]);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle Deep Linking: Open modal if event ID is in URL
    useEffect(() => {
        if (mounted) {
            const eventId = searchParams.get('event');
            if (eventId) {
                setSelectedEventId(eventId);
            } else {
                setSelectedEventId(null);
            }
        }
    }, [mounted, searchParams]);

    // Find the currently selected event details from occurrences
    const selectedEventOccurrence = useMemo(() => {
        if (!selectedEventId) return null;
        return occurrences.find(occ => occ.event.id === selectedEventId);
    }, [selectedEventId, occurrences]);

    const handleShare = async (event: any) => {
        const baseUrl = window.location.origin + pathname;
        const shareUrl = `${baseUrl}?event=${event.id}`;

        const shareData = {
            title: event.title,
            text: `¡Mira este plan!: ${event.title}.`,
            url: shareUrl,
        };

        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                setCopyFeedback(true);
                setTimeout(() => setCopyFeedback(false), 2000);
            } catch (err) {
                console.log('Error copying to clipboard:', err);
            }
        }
    };

    const handleOpenEvent = (eventId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('event', eventId);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleCloseModal = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('event');
        const query = params.toString() ? `?${params.toString()}` : '';
        router.push(`${pathname}${query}`, { scroll: false });
    };

    // Center the selected date in the strip (Day view only)
    useEffect(() => {
        if (mounted && selectedRef.current && viewType === 'day') {
            selectedRef.current.scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest'
            });
        }
    }, [mounted, selectedDate, viewDate, viewType]);

    // Generate 15 days around the view date for the strip
    const weekDays = useMemo(() => {
        const days = [];
        const start = new Date(viewDate);
        start.setDate(start.getDate() - 7);

        for (let i = 0; i < 15; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            days.push(date);
        }
        return days;
    }, [viewDate]);

    // Generate days of the current week (Monday to Sunday)
    const currentWeekDays = useMemo(() => {
        const startOfWeek = new Date(selectedDate);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
        startOfWeek.setDate(diff);

        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            days.push(d);
        }
        return days;
    }, [selectedDate]);

    // Generate Grid days for Month View
    const monthGridDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        let startDayOfWeek = firstDay.getDay();
        startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Adjust Monday start
        
        const totalDays = new Date(year, month + 1, 0).getDate();
        const grid = [];
        
        for (let i = 0; i < startDayOfWeek; i++) {
            grid.push(null);
        }
        for (let day = 1; day <= totalDays; day++) {
            grid.push(new Date(year, month, day));
        }
        return grid;
    }, [viewDate]);

    const formatMonth = (date: Date) => {
        return date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    const changeMonth = (offset: number) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(viewDate.getMonth() + offset);
        setViewDate(newDate);
        setSelectedDate(newDate);
    };

    const changeDay = (offset: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + offset);
        setSelectedDate(newDate);
        
        const start = new Date(viewDate);
        start.setDate(start.getDate() - 7);
        const end = new Date(viewDate);
        end.setDate(end.getDate() + 7);

        if (newDate < start || newDate > end) {
            setViewDate(newDate);
        }
    };

    const goToToday = () => {
        const today = new Date();
        setViewDate(today);
        setSelectedDate(today);
    };

    // Helper to get occurrences for a specific date
    const getOccurrencesForDate = (date: Date) => {
        return occurrences.filter(occ => {
            const occDate = new Date(occ.date);
            return occDate.getUTCDate() === date.getDate() &&
                   occDate.getUTCMonth() === date.getMonth() &&
                   occDate.getUTCFullYear() === date.getFullYear();
        });
    };

    // Filter occurrences for the selected date
    const filteredOccurrences = useMemo(() => {
        return getOccurrencesForDate(selectedDate);
    }, [occurrences, selectedDate]);

    // Format age range text
    const formatAgeRange = (min: number, max: number | null) => {
        if (min === 0 && !max) return "Todas las edades";
        if (min > 0 && !max) return `A partir de ${min} años`;
        return `${min} a ${max} años`;
    };

    if (!mounted) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900" />;

    return (
        <div className="min-h-screen pb-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 relative">
            {/* Desktop Navbar */}
            <header className="hidden md:block bg-brand-accent dark:bg-brand-accent/90 backdrop-blur-lg pt-safe border-b border-white/10 z-50 sticky top-0">
                <div className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto w-full">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="text-white hover:text-white/80 transition-colors flex items-center gap-2">
                            <span className="text-lg font-black tracking-tight">Paseos con Peques</span>
                        </Link>
                    </div>
                    {/* Desktop/Tablet Navigation Icons in Header */}
                    <div className="flex items-center gap-6 text-white/90">
                        <Link href="/" className="hover:text-white font-bold text-sm transition-colors flex items-center gap-1.5">
                            <HomeIcon className="w-4 h-4" />
                            <span>Inicio</span>
                        </Link>
                        <Link href="/noticias" className="hover:text-white font-bold text-sm transition-colors flex items-center gap-1.5">
                            <Newspaper className="w-4 h-4" />
                            <span>Noticias</span>
                        </Link>
                        <Link href="/calendario" className="hover:text-white font-bold text-sm transition-colors flex items-center gap-1.5 text-white">
                            <CalendarIcon className="w-4 h-4" />
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
                </div>
            </header>

            {/* Mobile Header controls */}
            <header className="bg-white dark:bg-gray-855 p-4 pb-4 sticky top-0 md:top-[65px] z-10 shadow-sm pt-safe border-b border-gray-100 dark:border-gray-800 transition-colors duration-300 lg:hidden">
                <div className="flex justify-between items-end mb-4">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white transition-colors">
                            Agenda
                        </h1>
                    </div>
                </div>

                {/* Mobile Tab Switcher (Featured / Calendar) */}
                <div className="flex gap-2 mb-3 bg-gray-50 dark:bg-gray-900/10 p-1.5 rounded-full border border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => setActiveMobileTab('featured')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 text-xs font-black rounded-full transition-all duration-300 ${
                            activeMobileTab === 'featured'
                                ? 'bg-brand-accent text-white shadow-md shadow-brand-accent/20 scale-105'
                                : 'text-gray-550 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                    >
                        <Star size={12} className={activeMobileTab === 'featured' ? 'fill-white text-white' : 'text-gray-550'} />
                        Destacados
                    </button>
                    <button
                        onClick={() => setActiveMobileTab('all')}
                        className={`flex-1 py-2 px-4 text-xs font-black rounded-full transition-all duration-300 ${
                            activeMobileTab === 'all'
                                ? 'bg-brand-accent text-white shadow-md shadow-brand-accent/20 scale-105'
                                : 'text-gray-550 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                    >
                        Todos
                    </button>
                </div>

                {/* Month Selector and HOY button below tabs (only in 'all' tab) */}
                {activeMobileTab === 'all' && (
                    <div className="flex justify-between items-center mb-3 animate-fadeIn">
                        <div className="flex items-center gap-3 text-brand-primary">
                            <button
                                onClick={() => changeMonth(-1)}
                                className="p-1 hover:bg-brand-primary/10 rounded-full transition-colors text-brand-primary"
                                aria-label="Mes anterior"
                            >
                                <ChevronLeft size={20} strokeWidth={3} />
                            </button>

                            <div className="flex items-center gap-1.5">
                                <CalendarIcon size={14} className="opacity-70" />
                                <span className="text-sm font-black uppercase tracking-wider capitalize">
                                    {formatMonth(viewDate)}
                                </span>
                            </div>

                            <button
                                onClick={() => changeMonth(1)}
                                className="p-1 hover:bg-brand-primary/10 rounded-full transition-colors text-brand-primary"
                                aria-label="Mes siguiente"
                            >
                                <ChevronRight size={20} strokeWidth={3} />
                            </button>
                        </div>

                        <button
                            onClick={goToToday}
                            className="px-4 py-1.5 text-xs font-black rounded-full bg-brand-primary text-white shadow-lg shadow-brand-primary/20 active:scale-95 transition-all"
                        >
                            HOY
                        </button>
                    </div>
                )}

                {/* View Switcher and strip for mobile (Calendar Tab Only) */}
                {activeMobileTab === 'all' && (
                    <>
                        {/* View Switcher (Tabs) */}
                        <div className="grid grid-cols-3 gap-1 bg-gray-100 dark:bg-gray-900/40 p-1 rounded-2xl mb-3">
                            {(['day', 'week', 'month'] as ViewType[]).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setViewType(type)}
                                    className={`py-2 text-xs font-black rounded-xl transition-all uppercase tracking-wider ${
                                        viewType === type
                                            ? 'bg-white dark:bg-gray-800 text-brand-primary shadow-sm'
                                            : 'text-gray-550 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                                >
                                    {type === 'day' ? 'Día' : type === 'week' ? 'Semana' : 'Mes'}
                                </button>
                            ))}
                        </div>

                        {/* Day View Strip Navigation */}
                        {viewType === 'day' && (
                            <div className="flex items-center gap-1 bg-gray-50/50 dark:bg-gray-900/10 rounded-2xl p-1 animate-fadeIn">
                                <button
                                    onClick={() => changeDay(-1)}
                                    className="flex-none p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-brand-primary active:scale-95 transition-all border border-gray-100 dark:border-gray-700"
                                    aria-label="Día anterior"
                                >
                                    <ChevronLeft size={20} strokeWidth={3} />
                                </button>

                                <div
                                    ref={scrollRef}
                                    className="flex-1 flex gap-3 overflow-x-auto no-scrollbar py-2 items-center"
                                >
                                    {weekDays.map((date) => {
                                        const isSelected = isSameDay(date, selectedDate);
                                        const isToday = isSameDay(date, new Date());

                                        return (
                                            <button
                                                key={date.toISOString()}
                                                ref={isSelected ? selectedRef : null}
                                                onClick={() => {
                                                    setSelectedDate(date);
                                                    if (date.getMonth() !== viewDate.getMonth()) {
                                                        setViewDate(date);
                                                    }
                                                }}
                                                className={`flex flex-col items-center p-2.5 rounded-2xl min-w-[3.5rem] transition-all duration-300 relative ${isSelected
                                                    ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20 transform scale-110 z-10'
                                                    : 'text-gray-550 dark:text-gray-400 bg-white dark:bg-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
                                                    }`}
                                            >
                                                <span className={`text-[10px] font-bold uppercase tracking-tighter ${isSelected ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'}`}>
                                                    {date.toLocaleString('es-ES', { weekday: 'short' }).replace('.', '')}
                                                </span>
                                                <span className="text-lg font-black leading-none mt-1">{date.getDate()}</span>
                                                {isToday && !isSelected && (
                                                    <div className="absolute -bottom-1 w-1 h-1 bg-brand-accent rounded-full" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => changeDay(1)}
                                    className="flex-none p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-brand-primary active:scale-95 transition-all border border-gray-100 dark:border-gray-700"
                                    aria-label="Día siguiente"
                                >
                                    <ChevronRight size={20} strokeWidth={3} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </header>

            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-primary"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* LEFT COLUMN: FEATURED EVENTS */}
                        <div className={`${activeMobileTab === 'featured' ? 'block' : 'hidden'} lg:block lg:col-span-5 xl:col-span-4 space-y-6 animate-fadeIn`}>
                            {/* Column Header for Desktop */}
                            <div className="hidden lg:block">
                                <h1 className="text-3xl font-black text-gray-900 dark:text-white transition-colors">Agenda</h1>
                            </div>

                            <div className="bg-brand-accent/5 dark:bg-brand-accent/15 p-4 rounded-3xl border border-brand-accent/10">
                                <p className="text-sm font-bold text-brand-accent leading-relaxed">
                                    Lo más elegido para llevar a los peques esta semana 💫
                                </p>
                            </div>

                            {/* Cards list */}
                            {featuredOccurrences.length === 0 ? (
                                <div className="bg-white dark:bg-gray-855 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 text-center space-y-2">
                                    <AlertCircle className="w-8 h-8 text-gray-400 mx-auto" />
                                    <p className="font-bold text-gray-600 dark:text-gray-350">No hay eventos destacados programados.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {featuredOccurrences.map((occ) => {
                                        const isFav = isFavoriteEvent(occ.event.id);
                                        return (
                                            <div
                                                key={occ.id}
                                                onClick={() => handleOpenEvent(occ.event.id)}
                                                className="bg-white dark:bg-gray-855 rounded-3xl p-4 flex gap-4 border border-gray-100 dark:border-gray-800 transition-all duration-300 cursor-pointer shadow-[0_8px_30px_rgb(227,123,124,0.08)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(227,123,124,0.15)] hover:border-brand-accent/20 relative group"
                                            >
                                                {/* Left side: Square image or placeholder */}
                                                <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-brand-accent/10">
                                                    {occ.event.photoId ? (
                                                        <img
                                                            src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dnpmw1mty'}/image/upload/w_200,q_auto,f_auto/${occ.event.photoId.includes('/') ? occ.event.photoId : 'events/' + occ.event.photoId}`}
                                                            alt={occ.event.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-brand-accent to-brand-primary/40 flex items-center justify-center">
                                                            <Star className="text-white w-6 h-6 fill-white opacity-40" />
                                                        </div>
                                                    )}
                                                    {/* Star Badge on Top-Right Corner of image */}
                                                    <div className="absolute top-1 right-1 bg-brand-accent text-white p-1 rounded-full shadow-md border border-white/20 z-10">
                                                        <Star size={10} className="fill-white text-white" />
                                                    </div>
                                                </div>

                                                {/* Middle side: details */}
                                                <div className="flex-1 min-w-0 pr-8 flex flex-col justify-between py-0.5">
                                                    <h3 className="font-extrabold text-[17px] text-gray-900 dark:text-white leading-tight group-hover:text-brand-accent transition-colors truncate">
                                                        {occ.event.title}
                                                    </h3>
                                                    
                                                    <div className="space-y-1 mt-1">
                                                        <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
                                                            <MapPin size={13} className="text-brand-accent" />
                                                            <span className="text-xs font-bold text-gray-550 dark:text-gray-450 truncate">
                                                                {occ.place.name}
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-550">
                                                            <Clock size={13} className="text-brand-accent" />
                                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-450">
                                                                {formatOccurrenceDateTime(occ.date, occ.timeStart)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right side: Favorite toggle button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleFavoriteEvent(occ.event.id);
                                                    }}
                                                    className="absolute top-4 right-4 p-2 bg-gray-50 dark:bg-gray-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-full text-gray-400 dark:text-gray-500 hover:text-rose-500 dark:hover:text-rose-400 transition-all duration-300 z-25"
                                                    aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
                                                >
                                                    <Heart size={16} className={isFav ? "fill-rose-500 text-rose-500" : "text-gray-400"} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: CALENDAR */}
                        <div className={`${activeMobileTab === 'all' ? 'block' : 'hidden'} lg:block lg:col-span-7 xl:col-span-8 space-y-6 animate-fadeIn`}>
                            {/* Calendar Header for Desktop */}
                            <div className="hidden lg:block bg-white dark:bg-gray-850 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-300">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex flex-col">
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white transition-colors">Agenda</h2>
                                        <div className="flex items-center gap-3 text-brand-primary mt-1">
                                            <button
                                                onClick={() => changeMonth(-1)}
                                                className="p-1 hover:bg-brand-primary/10 rounded-full transition-colors text-brand-primary cursor-pointer"
                                                aria-label="Mes anterior"
                                            >
                                                <ChevronLeft size={20} strokeWidth={3} />
                                            </button>

                                            <div className="flex items-center gap-1.5">
                                                <CalendarIcon size={14} className="opacity-70" />
                                                <span className="text-sm font-black uppercase tracking-wider capitalize">
                                                    {formatMonth(viewDate)}
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => changeMonth(1)}
                                                className="p-1 hover:bg-brand-primary/10 rounded-full transition-colors text-brand-primary cursor-pointer"
                                                aria-label="Mes siguiente"
                                            >
                                                <ChevronRight size={20} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={goToToday}
                                        className="px-4 py-1.5 text-xs font-black rounded-full bg-brand-primary text-white shadow-lg shadow-brand-primary/20 active:scale-95 transition-all cursor-pointer"
                                    >
                                        HOY
                                    </button>
                                </div>

                                {/* View Switcher (Tabs) */}
                                <div className="grid grid-cols-3 gap-1 bg-gray-100 dark:bg-gray-900/40 p-1 rounded-2xl mb-3">
                                    {(['day', 'week', 'month'] as ViewType[]).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setViewType(type)}
                                            className={`py-2 text-xs font-black rounded-xl transition-all uppercase tracking-wider cursor-pointer ${
                                                viewType === type
                                                    ? 'bg-white dark:bg-gray-800 text-brand-primary shadow-sm'
                                                    : 'text-gray-550 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                            }`}
                                        >
                                            {type === 'day' ? 'Día' : type === 'week' ? 'Semana' : 'Mes'}
                                        </button>
                                    ))}
                                </div>

                                {/* Day View Strip Navigation */}
                                {viewType === 'day' && (
                                    <div className="flex items-center gap-1 bg-gray-50/50 dark:bg-gray-900/10 rounded-2xl p-1 animate-fadeIn">
                                        <button
                                            onClick={() => changeDay(-1)}
                                            className="flex-none p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-brand-primary active:scale-95 transition-all border border-gray-100 dark:border-gray-700 cursor-pointer"
                                            aria-label="Día anterior"
                                        >
                                            <ChevronLeft size={20} strokeWidth={3} />
                                        </button>

                                        <div
                                            ref={scrollRef}
                                            className="flex-1 flex gap-3 overflow-x-auto no-scrollbar py-2 items-center"
                                        >
                                            {weekDays.map((date) => {
                                                const isSelected = isSameDay(date, selectedDate);
                                                const isToday = isSameDay(date, new Date());

                                                return (
                                                    <button
                                                        key={date.toISOString()}
                                                        ref={isSelected ? selectedRef : null}
                                                        onClick={() => {
                                                            setSelectedDate(date);
                                                            if (date.getMonth() !== viewDate.getMonth()) {
                                                                setViewDate(date);
                                                            }
                                                        }}
                                                        className={`flex flex-col items-center p-2.5 rounded-2xl min-w-[3.5rem] transition-all duration-300 relative cursor-pointer ${isSelected
                                                            ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20 transform scale-110 z-10'
                                                            : 'text-gray-550 dark:text-gray-400 bg-white dark:bg-gray-855 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
                                                            }`}
                                                    >
                                                        <span className={`text-[10px] font-bold uppercase tracking-tighter ${isSelected ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'}`}>
                                                            {date.toLocaleString('es-ES', { weekday: 'short' }).replace('.', '')}
                                                        </span>
                                                        <span className="text-lg font-black leading-none mt-1">{date.getDate()}</span>
                                                        {isToday && !isSelected && (
                                                            <div className="absolute -bottom-1 w-1 h-1 bg-brand-accent rounded-full" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={() => changeDay(1)}
                                            className="flex-none p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-brand-primary active:scale-95 transition-all border border-gray-100 dark:border-gray-700 cursor-pointer"
                                            aria-label="Día siguiente"
                                        >
                                            <ChevronRight size={20} strokeWidth={3} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* 1. DAY VIEW */}
                            {viewType === 'day' && (
                                <div className="animate-fadeIn">
                                    <h2 className="font-black text-gray-400 dark:text-gray-550 text-xs uppercase tracking-[0.2em] mb-4">
                                        {isSameDay(selectedDate, new Date()) ? 'Hoy, ' : ''}
                                        {selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                                    </h2>

                                    {filteredOccurrences.length === 0 ? (
                                        <div className="bg-white dark:bg-gray-855 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 text-center space-y-2">
                                            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto" />
                                            <p className="font-bold text-gray-600 dark:text-gray-350">No hay eventos programados para este día.</p>
                                            <p className="text-xs text-gray-400">¡Explorá otras fechas en el calendario!</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {filteredOccurrences.map((occ) => (
                                            <div 
                                                key={occ.id} 
                                                className="bg-white dark:bg-gray-855 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex gap-4 transition-all duration-300 group hover:shadow-md hover:border-brand-primary/20"
                                            >
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="flex flex-col items-center justify-center p-2 bg-brand-primary/5 dark:bg-brand-primary/10 rounded-2xl w-16 h-16 text-brand-primary transition-colors group-hover:scale-105 duration-300">
                                                        <span className="text-sm font-black">{occ.timeStart}</span>
                                                    </div>
                                                </div>

                                                <div className="flex-1 flex flex-col justify-center">
                                                    <h3
                                                        onClick={() => handleOpenEvent(occ.event.id)}
                                                        className="text-lg font-bold text-gray-950 dark:text-gray-50 transition-colors cursor-pointer hover:text-brand-primary leading-tight mb-1"
                                                    >
                                                        {occ.event.title}
                                                    </h3>
                                                    <div className="text-gray-550 dark:text-gray-455 text-sm transition-colors flex flex-col gap-0.5">
                                                        <span className="font-bold text-gray-750 dark:text-gray-300">{occ.place.name}</span>
                                                        <span className="text-xs opacity-80">{occ.place.address}</span>
                                                        <div className="flex gap-2 mt-1 flex-wrap">
                                                            <span className="text-[10px] bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                                                                {PRICE_TYPE_LABELS[occ.event.priceType as PriceType]}
                                                            </span>
                                                            <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                                                                {formatAgeRange(occ.event.ageMin, occ.event.ageMax)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 2. WEEK VIEW */}
                        {viewType === 'week' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="font-black text-gray-450 dark:text-gray-500 text-xs uppercase tracking-[0.2em]">
                                        Vista Semanal
                                    </h2>
                                    <span className="text-xs text-brand-primary font-bold">
                                        Lun {currentWeekDays[0].getDate()} - Dom {currentWeekDays[6].getDate()}
                                    </span>
                                </div>
                                
                                <div className="space-y-4">
                                    {currentWeekDays.map((day) => {
                                        const dayEvents = getOccurrencesForDate(day);
                                        const isToday = isSameDay(day, new Date());
                                        return (
                                            <div key={day.toISOString()} className={`p-4 rounded-3xl border transition-all ${
                                                isToday 
                                                    ? 'bg-brand-primary/5 border-brand-primary/20 dark:bg-brand-primary/10' 
                                                    : 'bg-white dark:bg-gray-855 border-gray-100 dark:border-gray-800'
                                            }`}>
                                                <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                                                    <span className={`text-xs font-black uppercase tracking-wider ${isToday ? 'text-brand-primary' : 'text-gray-500 dark:text-gray-455'}`}>
                                                        {day.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}
                                                    </span>
                                                    {isToday && (
                                                        <span className="text-[9px] bg-brand-primary text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Hoy</span>
                                                    )}
                                                </div>

                                                {dayEvents.length === 0 ? (
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 italic py-1">Sin eventos programados</p>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {dayEvents.map((occ) => (
                                                            <div 
                                                                key={occ.id} 
                                                                onClick={() => handleOpenEvent(occ.event.id)}
                                                                className="flex justify-between items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-xl transition-colors"
                                                            >
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{occ.event.title}</p>
                                                                    <p className="text-xs text-gray-450 dark:text-gray-400 truncate">{occ.place.name}</p>
                                                                </div>
                                                                <span className="text-xs font-black text-brand-primary bg-brand-primary/5 px-2.5 py-1 rounded-lg flex-shrink-0">
                                                                    {occ.timeStart} hs
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 3. MONTH VIEW */}
                        {viewType === 'month' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="bg-white dark:bg-gray-855 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                    <div className="grid grid-cols-7 gap-2 text-center">
                                        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d, i) => (
                                            <div key={i} className="text-[10px] font-black text-gray-450 dark:text-gray-500 uppercase py-2">{d}</div>
                                        ))}
                                        {monthGridDays.map((date, idx) => {
                                            if (!date) return <div key={idx} className="aspect-square" />;
                                            
                                            const isSelected = isSameDay(date, selectedDate);
                                            const isToday = isSameDay(date, new Date());
                                            const dayEvents = getOccurrencesForDate(date);
                                            const hasEvents = dayEvents.length > 0;
                                            
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => setSelectedDate(date)}
                                                    className={`aspect-square flex flex-col items-center justify-center rounded-2xl transition-all relative ${
                                                        isSelected 
                                                            ? 'bg-brand-primary text-white font-black shadow-md scale-105 z-10' 
                                                            : isToday 
                                                                ? 'bg-brand-primary/10 text-brand-primary font-bold' 
                                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                    }`}
                                                >
                                                    <span className="text-sm">{date.getDate()}</span>
                                                    {hasEvents && (
                                                        <span className={`w-1 h-1 rounded-full absolute bottom-1.5 ${isSelected ? 'bg-white' : 'bg-brand-accent'}`} />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* List events of the selected day below month grid */}
                                <div className="space-y-4">
                                    <h3 className="font-black text-gray-450 dark:text-gray-500 text-xs uppercase tracking-[0.2em]">
                                        Eventos para el {selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                                    </h3>

                                    {filteredOccurrences.length === 0 ? (
                                        <div className="bg-white dark:bg-gray-855 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 text-center text-sm text-gray-400">
                                            No hay eventos para esta fecha.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {filteredOccurrences.map((occ) => (
                                                <div 
                                                    key={occ.id}
                                                    onClick={() => handleOpenEvent(occ.event.id)}
                                                    className="bg-white dark:bg-gray-855 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex justify-between items-center cursor-pointer hover:shadow-md transition-all"
                                                >
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-gray-100">{occ.event.title}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{occ.place.name}</p>
                                                    </div>
                                                    <span className="text-xs font-black text-brand-primary bg-brand-primary/5 px-2.5 py-1 rounded-lg">
                                                        {occ.timeStart} hs
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>

            {/* Event Details Modal */}
            {selectedEventOccurrence && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2rem] shadow-2xl p-6 pb-8 relative animate-slide-up border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto no-scrollbar">
                        <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6 opacity-50" />

                        <button
                            onClick={() => toggleFavoriteEvent(selectedEventOccurrence.event.id)}
                            className="absolute top-6 right-16 p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-450 hover:text-rose-500 dark:hover:text-rose-400 cursor-pointer active:scale-90 transition-all z-[110] md:hidden"
                            aria-label={isFavoriteEvent(selectedEventOccurrence.event.id) ? "Quitar de favoritos" : "Guardar en favoritos"}
                        >
                            <Heart size={20} className={isFavoriteEvent(selectedEventOccurrence.event.id) ? "fill-rose-500 text-rose-500" : "text-gray-500"} />
                        </button>

                        <button
                            onClick={handleCloseModal}
                            className="absolute top-6 right-6 p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 cursor-pointer active:scale-90 transition-all z-[110]"
                        >
                            <X size={20} />
                        </button>

                        <div className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <div className="flex gap-1.5 flex-wrap">
                                    {selectedEventOccurrence.event.activityTypes.map((type: ActivityType) => (
                                        <span key={type} className="inline-block px-2.5 py-1 rounded-lg bg-brand-accent/10 text-brand-accent text-[10px] font-black tracking-widest uppercase">
                                            {ACTIVITY_TYPE_LABELS[type]}
                                        </span>
                                    ))}
                                </div>

                                <h2 className="text-2xl font-black text-gray-955 dark:text-white leading-tight">
                                    {selectedEventOccurrence.event.title}
                                </h2>
                            </div>

                            {/* Cloudinary Image if present */}
                            {selectedEventOccurrence.event.photoId && (
                                <div 
                                    className="relative w-full rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-855 shadow-sm"
                                    style={{
                                        aspectRatio: (selectedEventOccurrence.event.photoWidth && selectedEventOccurrence.event.photoHeight) 
                                            ? `${selectedEventOccurrence.event.photoWidth} / ${selectedEventOccurrence.event.photoHeight}` 
                                            : '16 / 9'
                                    }}
                                >
                                    <img
                                        src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dnpmw1mty'}/image/upload/w_800,q_auto,f_auto/${selectedEventOccurrence.event.photoId.includes('/') ? selectedEventOccurrence.event.photoId : 'events/' + selectedEventOccurrence.event.photoId}`}
                                        alt={selectedEventOccurrence.event.title}
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
                                            {selectedEventOccurrence.timeStart}
                                            {selectedEventOccurrence.timeEnd ? ` a ${selectedEventOccurrence.timeEnd}` : ' hs'}
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
                                            {formatAgeRange(selectedEventOccurrence.event.ageMin, selectedEventOccurrence.event.ageMax)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-gray-800/20 rounded-2xl border border-gray-100 dark:border-gray-800/50">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-400">
                                        <MapPin size={18} />
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <span className="text-sm font-bold text-gray-955 dark:text-white leading-tight">{selectedEventOccurrence.place.name}</span>
                                        <span className="text-[12px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">{selectedEventOccurrence.place.address}</span>
                                    </div>
                                </div>
                            </div>

                            {selectedEventOccurrence.event.description && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                        <Info size={16} className="text-brand-primary" />
                                        <span className="text-xs font-black uppercase tracking-wider">Acerca del evento</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium whitespace-pre-line">
                                        {selectedEventOccurrence.event.description}
                                    </p>
                                </div>
                            )}

                            {/* Organizadores */}
                            {selectedEventOccurrence.event.organizers && selectedEventOccurrence.event.organizers.length > 0 && (
                                <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800/50">
                                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                        <User size={16} className="text-brand-primary" />
                                        <span className="text-xs font-black uppercase tracking-wider">Organizadores</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedEventOccurrence.event.organizers.map((eo: any) => (
                                            <Link
                                                key={eo.organizer.id}
                                                href={`/perfil/${eo.organizer.slug}`}
                                                className="inline-block px-2.5 py-1 text-xs font-bold bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 rounded-xl transition-all cursor-pointer"
                                            >
                                                {eo.organizer.name}
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
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200 font-bold">
                                        {PRICE_TYPE_LABELS[selectedEventOccurrence.event.priceType as PriceType] || selectedEventOccurrence.event.priceType}
                                    </span>
                                </div>
                            </div>

                            {/* Reservas / Entradas */}
                            {(selectedEventOccurrence.event.ticketUrl || selectedEventOccurrence.event.bookingWhatsapp || (selectedEventOccurrence.event.priceType === 'PAID_TICKET' && (selectedEventOccurrence.place.whatsapp || selectedEventOccurrence.place.phone))) && (
                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800/50 space-y-3">
                                    {selectedEventOccurrence.event.ticketUrl ? (
                                        <a 
                                            href={selectedEventOccurrence.event.ticketUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-3.5 px-4 rounded-xl bg-brand-primary text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 hover:opacity-90 active:scale-[0.98] transition-all"
                                        >
                                            <Globe size={16} />
                                            RESERVAR ENTRADAS
                                        </a>
                                    ) : null}

                                    {selectedEventOccurrence.event.bookingWhatsapp ? (
                                        <a 
                                            href={`https://wa.me/${selectedEventOccurrence.event.bookingWhatsapp.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-3.5 px-4 rounded-xl bg-green-600 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-green-650/20 hover:bg-green-700 active:scale-[0.98] transition-all"
                                        >
                                            <MessageCircle size={16} />
                                            CONTACTAR POR WHATSAPP
                                        </a>
                                    ) : (
                                        selectedEventOccurrence.event.priceType === 'PAID_TICKET' && (
                                            <>
                                                {!selectedEventOccurrence.event.ticketUrl && selectedEventOccurrence.place.whatsapp && (
                                                    <a 
                                                        href={`https://wa.me/${selectedEventOccurrence.place.whatsapp.replace(/[^0-9]/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-full py-3.5 px-4 rounded-xl bg-green-600 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-green-650/20 hover:bg-green-700 active:scale-[0.98] transition-all"
                                                    >
                                                        💬 RESERVAR POR WHATSAPP
                                                    </a>
                                                )}
                                                {!selectedEventOccurrence.event.ticketUrl && !selectedEventOccurrence.place.whatsapp && selectedEventOccurrence.place.phone && (
                                                    <a 
                                                        href={`tel:${selectedEventOccurrence.place.phone}`}
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
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEventOccurrence.place.name + ", " + selectedEventOccurrence.place.address)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 py-3.5 px-4 rounded-xl bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-black flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-[0.98] transition-all"
                                    >
                                        <MapPin size={16} className="text-brand-primary" />
                                        COMO LLEGAR
                                    </a>

                                    <button
                                        onClick={() => handleShare(selectedEventOccurrence.event)}
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
