import { CalendarEvent } from "@/domain/entities/Event";
import dayjs from "dayjs";

export const groupEventsByDate = (events: CalendarEvent[]): Record<string, CalendarEvent[]> => {
    const eventsByDay: Record<string, CalendarEvent[]> = {};

    events.forEach(event => {
        // date is now a Date object — normalize to 'YYYY-MM-DD' key
        const dateKey = dayjs(event.date).format('YYYY-MM-DD');
        if (!eventsByDay[dateKey]) {
            eventsByDay[dateKey] = [];
        }
        eventsByDay[dateKey].push(event);
    });

    return eventsByDay;
};