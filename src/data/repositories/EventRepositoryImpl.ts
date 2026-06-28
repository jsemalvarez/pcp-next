import prisma from "@/data/prisma/db";
import { CalendarEvent } from "@/domain/entities/Event";
import { EventRepository } from "@/domain/repositories/EventRepository";

export class EventRepositoryImpl implements EventRepository {

    async getEvents(): Promise<CalendarEvent[]> {
        try {
            const occurrences = await prisma.eventOccurrence.findMany({
                include: {
                    event: true,
                    place: true,
                },
                orderBy: [
                    { date: "asc" },
                    { timeStart: "asc" },
                ],
            });

            // Proyección plana compatible con el CalendarGrid existente
            return occurrences.map((o) => ({
                id:           o.id,
                eventId:      o.eventId,
                title:        o.event.title,
                description:  o.event.description,
                photoId:      o.event.photoId,
                bgColor:      o.event.bgColor,
                ticketUrl:    o.event.ticketUrl,
                bookingWhatsapp: o.event.bookingWhatsapp,
                isFeatured:   o.event.isFeatured,
                priceType:    o.event.priceType,
                activityTypes: o.event.activityTypes,
                ageMin:       o.event.ageMin,
                ageMax:       o.event.ageMax,
                date:         o.date,
                timeStart:    o.timeStart,
                timeEnd:      o.timeEnd,
                placeId:      o.placeId,
            }));

        } catch (error) {
            console.error("[EventRepositoryImpl] Error fetching events:", error);
            throw new Error("Failed to fetch events");
        }
    }
}