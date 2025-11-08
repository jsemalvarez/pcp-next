import { Place } from "@/domain/entities/Place";
import { PlacesSearchClient } from "./PlacesSearchClient"



interface Props{
    places: Place[]
}

export const PlacesSearchSection = async({places}:Props) => {
    return (
        <div id='searchSection' className='min-h-screen py-[100px] text-center'>            
            <h2 className="text-4xl md:text-5xl font-semibold text-secondary mb-4">Buscá tu próximo paseo en familia</h2>
            <p className="mx-auto max-w-3xl text-lg md:text-xl mb-8">
                Inspirate con nuevos lugares y actividades pensadas para los peques. Elegí el plan perfecto para tu próxima salida.
            </p>
            <PlacesSearchClient places={places} />
        </div>
    )
}
