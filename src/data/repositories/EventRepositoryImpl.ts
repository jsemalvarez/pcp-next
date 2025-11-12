import { FirebaseDB } from "@/config/firebase";
import { Event } from "@/domain/entities/Event";
import { EventRepository } from "@/domain/repositories/EventRepository";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

const COLLECTION_NAME = 'events';

export class EventRepositoryImpl implements EventRepository{

    async getEvents(): Promise<Event[]> {
        try {

            const eventsRef = collection(FirebaseDB, COLLECTION_NAME);
            const q = query(
                eventsRef, 
                orderBy("date", "asc"),
                orderBy("timeStart", "asc"),
                orderBy("timeEnd", "asc")
            );

            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => ({
                id: doc.id, // ID del documento
                ...doc.data(), // Datos
            })) as Event[]

        } catch (error) {
            console.error("[EventRepositoryImpl] Error fetching events:", error);
            console.log(error)
            throw new Error("Failed to fetch events");
        }
    }
}