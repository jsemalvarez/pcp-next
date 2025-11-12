import { Event } from "../entities/Event";

export interface EventRepository{
    getEvents():Promise<Event[]>
}