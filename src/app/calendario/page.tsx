"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, MapPin, Clock, Users, Info, Share2, Check, Globe, AlertCircle, Heart } from 'lucide-react';
import { useFavorites } from '@/presentation/contexts/FavoritesContext';
import Link from 'next/link';
import { getOccurrencesByMonth } from "@/actions/events";
import { PriceType, ActivityType } from "@prisma/client";

// Map PriceType enum to friendly Spanish text
const PRICE_TYPE_LABELS: Record<PriceType, string> = {
  FREE_ENTRY: "Gratuito",
  PAID_TICKET: "Con Entrada",
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
            <header className="bg-white dark:bg-gray-850 p-4 pb-4 sticky top-0 z-10 shadow-sm pt-safe border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
                <div className="flex justify-between items-end mb-4">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white transition-colors">Agenda</h1>
                        <div className="flex items-center gap-3 text-brand-primary mt-1">
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
                    </div>

                    <button
                        onClick={goToToday}
                        className="px-4 py-1.5 text-xs font-black rounded-full bg-brand-primary text-white shadow-lg shadow-brand-primary/20 active:scale-95 transition-all"
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
            </header>

            <div className="p-4 space-y-6 max-w-2xl mx-auto">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-primary"></div>
                    </div>
                ) : (
                    <>
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
                    </>
                )}
            </div>

            {/* Event Details Modal */}
            {selectedEventOccurrence && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2rem] shadow-2xl p-6 pb-8 relative animate-slide-up border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
                        <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6 opacity-50" />

                        <button
                            onClick={() => toggleFavoriteEvent(selectedEventOccurrence.event.id)}
                            className="absolute top-6 right-16 p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-450 hover:text-rose-500 dark:hover:text-rose-400 cursor-pointer active:scale-90 transition-all z-[110]"
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
                                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-855 shadow-sm">
                                    <img
                                        src={`https://res.cloudinary.com/dwhdla1b4/image/upload/w_800,q_auto,f_auto/v1749595725/pcp-images/${selectedEventOccurrence.event.photoId}`}
                                        alt={selectedEventOccurrence.event.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800">
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
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800">
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

                            <div className="pt-4 space-y-3">
                                {/* Ticket / Booking buttons */}
                                {selectedEventOccurrence.event.ticketUrl && (
                                    <a 
                                        href={selectedEventOccurrence.event.ticketUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-3.5 px-4 rounded-xl bg-brand-primary text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 hover:opacity-90 active:scale-[0.98] transition-all"
                                    >
                                        <Globe size={16} />
                                        RESERVAR ENTRADAS
                                    </a>
                                )}

                                {selectedEventOccurrence.event.bookingWhatsapp && (
                                    <a 
                                        href={`https://wa.me/${selectedEventOccurrence.event.bookingWhatsapp.replace(/[^0-9]/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-3.5 px-4 rounded-xl bg-green-600 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-green-650/20 hover:bg-green-700 active:scale-[0.98] transition-all"
                                    >
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.558 0 11.895-5.335 11.898-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                        CONTACTAR POR WHATSAPP
                                    </a>
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
                </div>
            )}
        </div>
    );
}
