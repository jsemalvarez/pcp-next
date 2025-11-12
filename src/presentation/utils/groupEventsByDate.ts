import { Event } from "@/domain/entities/Event";

export const groupEventsByDate = (events: Event[]) => {
    const eventsByDay: Record<string, Event[]> = {};

    events.forEach(event => {
        if (!eventsByDay[event.date]) {
          eventsByDay[event.date] = [];
        }
        eventsByDay[event.date].push(event);
      });

    return eventsByDay;
}