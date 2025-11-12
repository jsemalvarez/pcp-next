import { Event } from "../entities/Event";
import { EventRepository } from "../repositories/EventRepository";

export class GetEventsUseCase{
    constructor(private repository: EventRepository){}

    async execute(): Promise<Event[]> {
        return this.repository.getEvents()
    }
}