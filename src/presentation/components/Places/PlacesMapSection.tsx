import { Place } from "@/domain/entities/Place";
import { PlacesMapClient } from "./PlacesMapClient";


interface Props{
    places: Place[]
}

export const PlacesMapSection = async({places}:Props) => {
    return (
        <section id='mapSection' className='min-h-screen py-[100px] text-center'>            
            <h2 className="text-4xl md:text-5xl font-semibold text-secondary mb-4">Nuestro mapa para familias</h2>
            <p className="mx-auto max-w-3xl text-lg md:text-xl mb-8">
                Explorá el mapa interactivo y encontrá cafés, restaurantes y espacios pensados para disfrutar con los peques. Todo en un solo lugar, fácil y divertido
            </p>
            <PlacesMapClient places={places} />
        </section>
    )
}
