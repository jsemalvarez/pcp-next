import { Place } from "@/domain/entities/Place";
import { PlacesSearchClient } from "./PlacesSearchClient"



interface Props{
    places: Place[]
}

export const PlacesSearchSection = async({places}:Props) => {
    return (
        <div id='searchSection' className='min-h-screen py-[100px]'>            
            <h3 className="text-3xl text-center font-semibold mb-2">Lugares</h3>
            <PlacesSearchClient places={places} />
        </div>
    )
}
