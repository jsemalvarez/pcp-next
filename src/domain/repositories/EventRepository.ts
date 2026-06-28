import { CalendarEvent } from "../entities/Event";

export interface EventRepository {
    getEvents(): Promise<CalendarEvent[]>;
}