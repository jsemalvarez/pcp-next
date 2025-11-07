import { Place } from "../entities/Place";

export interface PlaceRepository {
  getAllPlacesOrderByName(): Promise<Place[]>;
}