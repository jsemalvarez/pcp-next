import { PlaceRepositoryImpl } from "@/data/repositories/PlaceRepositoryImpl";
import { GetPlacesUseCase } from "../usescases/GetPlacesUseCase";


export const getPlacesFactory = () => {
  const repository = new PlaceRepositoryImpl();
  return new GetPlacesUseCase(repository);
};