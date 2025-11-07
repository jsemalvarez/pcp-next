import { Place } from "../entities/Place";
import { PlaceRepository } from "../repositories/PlaceRepository";

export class GetPlacesUseCase {
  constructor(private repository: PlaceRepository) {}

  async execute(): Promise<Place[]> {
    return this.repository.getAllPlacesOrderByName();
  }
}