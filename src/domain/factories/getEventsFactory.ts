import { EventRepositoryImpl } from "@/data/repositories/EventRepositoryImpl"
import { GetEventsUseCase } from "../usescases/GetEventsUseCase";


export const getEventsFactory = () => {
    const repository = new EventRepositoryImpl();
    return new GetEventsUseCase(repository);
}