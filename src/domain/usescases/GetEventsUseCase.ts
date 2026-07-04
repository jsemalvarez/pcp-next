import { CalendarEvent } from "../entities/Event";
import { EventRepository } from "../repositories/EventRepository";

export class GetEventsUseCase {
    constructor(private repository: EventRepository) {}

    async execute(): Promise<CalendarEvent[]> {
        return this.repository.getEvents();
    }
}