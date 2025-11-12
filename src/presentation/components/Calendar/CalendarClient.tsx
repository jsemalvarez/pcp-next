'use client';

import { useMemo, useState } from "react";

import dayjs from "dayjs";
import 'dayjs/locale/es'; // importa el idioma
import { Event } from "@/domain/entities/Event";
import { ChevronRightIcon, ChevronLeftIcon } from "../common/icons";
import { FeaturedEvents } from "./FeaturedEvents";
import { CalendarGrid } from "./CalendarGrid";
dayjs.locale('es'); // lo setea como predeterminado

interface Props{
    events: Event[];
}

export const CalendarClient = ({events}:Props) => {

    const [currentDate, setCurrentDate] = useState(dayjs());
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEvents = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return events.filter((event) =>
        event.title.toLowerCase().includes(term)
        );
    }, [searchTerm, events]);

    const handleFilterEvents = (term: string) => {
        setSearchTerm(term);
    }

    const handlePrevMonth = () => setCurrentDate(currentDate.subtract(1, "month"));
    const handleNextMonth = () => setCurrentDate(currentDate.add(1, "month"));


    return (
        <>
            <div className="flex justify-center mb-6">
                <input
                    type="text"
                    placeholder="Buscar evento..."
                    value={searchTerm}
                    onChange={(e) => handleFilterEvents(e.target.value)}
                    className="w-full max-w-md mx-6 bg-primary p-2 border-cian border-2 shadow-lg shadow-primary p-2 rounded-lg focus:outline-hidden"
                />
            </div>

            <FeaturedEvents
                events={filteredEvents}
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
                />
            </div>
        </>
    );
}
