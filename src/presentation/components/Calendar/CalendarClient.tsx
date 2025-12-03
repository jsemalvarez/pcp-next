'use client';

import { useMemo, useState } from "react";

import dayjs from "dayjs";
import 'dayjs/locale/es'; // importa el idioma
import { Event } from "@/domain/entities/Event";
import { ChevronRightIcon, ChevronLeftIcon } from "../common/icons";
import { FeaturedEvents } from "./FeaturedEvents";
import { CalendarGrid } from "./CalendarGrid";
import { FilterEventByTag } from "./FilterEventByTag";
import { AGE_RANGES, EVENT_PRICES, EVENT_TYPES } from "@/presentation/constants/event-filters";
import { EventDetail } from "./EventDetail";
import { Place } from "@/domain/entities/Place";
import { CalendarDayAside } from "./CalendarDayAside";
dayjs.locale('es'); // lo setea como predeterminado

interface Props{
    events: Event[];
    places: Place[]
}

export const CalendarClient = ({events, places}:Props) => {

    const [currentDate, setCurrentDate] = useState(dayjs());
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAgeRanges, setSelectedAgeRanges] = useState<string[]>([]);
    const [selectedPriceEvent, setSelectedPriceEvent] = useState<string[]>([]);
    const [selectedEventType, setSelectedEventType] = useState<string[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<null | Event>(null);
    const [calendarDayEvents, setCalendarDayEvents] = useState<Event[] | null>(null);

    const filteredEvents = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        // return events.filter((event) =>
        // event.title.toLowerCase().includes(term)
        return events.filter((event) => {
            const matchesSearchTitle = term.length <= 1 || event.title.toLowerCase().includes(term);
            const matchesSearchDescription = term.length <= 1 || event.description.toLowerCase().includes(term);
            const matchesSearchArtists = term.length <= 1 || event.artists?.toLowerCase().includes(term);
            const matchesSearch = matchesSearchTitle || matchesSearchDescription || matchesSearchArtists;
            const matchesAge = selectedAgeRanges.length === 0 || event.ageRanges?.some((range) => selectedAgeRanges.includes(range));
            const matchesEventType = selectedEventType.length === 0 || event.activityTypes?.some((activityType) => selectedEventType.includes(activityType));
            const matchesPriceEvent = selectedPriceEvent.length === 0 || selectedPriceEvent.includes(event.priceType);            
        return matchesSearch 
            && matchesAge 
            && matchesPriceEvent 
            && matchesEventType;
        });        
    }, [searchTerm, events, selectedAgeRanges, selectedPriceEvent, selectedEventType]);

    const handleFilterEvents = (term: string) => {
        setSearchTerm(term);
    }

    const handlePrevMonth = () => setCurrentDate(currentDate.subtract(1, "month"));
    const handleNextMonth = () => setCurrentDate(currentDate.add(1, "month"));

    const handleFindPlaceById = (placeId:string): Place | undefined => {
        return places.find( place => place.id == placeId);
    }


    return (
        <>

            <FeaturedEvents
                events={filteredEvents}
                setSelectedEvent={setSelectedEvent}
            />

            <div className="w-full md:w-8/10 max-w-[1200px] mx-auto border-cian border-2 shadow-lg shadow-primary rounded bg-primary">
                <div className="flex justify-between items-center px-4 py-2">
                    <button className="cursor-pointer" onClick={handlePrevMonth}>
                        <ChevronLeftIcon />
                    </button>
                    <h2 className="font-bold text-secondary">
                        {currentDate.format("MMMM YYYY")}
                    </h2>
                    <button className="cursor-pointer" onClick={handleNextMonth}>
                        <ChevronRightIcon />
                    </button>
                </div>

                <div className="grid grid-cols-7 text-center text-sm">
                    {
                        ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => {
                            const isWeekend = day === "Sáb" || day === "Dom";
                            return (
                                <div
                                    key={day}
                                    className={`${isWeekend ? "text-gray-200" : "text-secondary"}`}
                                >{day}</div>
                            )
                        })
                    }
                </div>

                <CalendarGrid
                    events={filteredEvents}
                    currentDate={currentDate}
                    setSelectedEvent={setSelectedEvent}
                    handleCalendarDayAside={setCalendarDayEvents}
                />
            </div>

            <div className="flex flex-col justify-center items-center gap-1 mt-6">
                <input
                    type="text"
                    placeholder="Buscar evento..."
                    value={searchTerm}
                    onChange={(e) => handleFilterEvents(e.target.value)}
                    className="w-full max-w-md mx-6 bg-primary p-2 border-cian border-2 shadow-lg shadow-primary p-2 rounded-lg focus:outline-hidden"
                />

                <FilterEventByTag
                    labelTag='Edad recomendada:'
                    elementsTag={ AGE_RANGES }
                    selectedTag={selectedAgeRanges}
                    setSelectedTag={setSelectedAgeRanges}
                />
                <FilterEventByTag
                    labelTag='Tipo de entrada:'
                    elementsTag={ EVENT_PRICES }
                    selectedTag={selectedPriceEvent}
                    setSelectedTag={setSelectedPriceEvent}
                />
                <FilterEventByTag
                    labelTag='Tipo de actividad:'
                    elementsTag={ EVENT_TYPES }
                    selectedTag={selectedEventType}
                    setSelectedTag={setSelectedEventType}
                />
            </div>

            <CalendarDayAside
                calendarDayEvents={calendarDayEvents}
                handleOpenEventDetail={setSelectedEvent}
                handleCalendarDayAside={setCalendarDayEvents}
            />
            <EventDetail 
                eventDetail={selectedEvent}
                setSelectedEvent={setSelectedEvent}
                handleFindPlaceById={handleFindPlaceById}
            />
        </>
    );
}
