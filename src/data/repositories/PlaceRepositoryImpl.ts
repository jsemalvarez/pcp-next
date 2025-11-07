import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { FirebaseDB } from "@/config/firebase";

import { Place } from "../../domain/entities/Place";
import { PlaceRepository } from "../../domain/repositories/PlaceRepository";

const COLLECTION_NAME = 'places';

export class PlaceRepositoryImpl implements PlaceRepository {

    async getAllPlacesOrderByName(): Promise<Place[]> {
        try {
            const placesRef = collection(FirebaseDB, COLLECTION_NAME);
            const q = query(placesRef, orderBy("name", "asc"));
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as Place)
            );
        } catch (error) {
            console.error("[PlaceRepositoryImpl] Error fetching places:", error);
            throw new Error("Failed to fetch places");
        }
    }
}