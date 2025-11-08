import { Place } from "@/domain/entities/Place";
import { PlacesMapClient } from "./PlacesMapClient";


interface Props{
    places: Place[]
}

export const PlacesMapSection = async({places}:Props) => {
    return (
        <div id='mapSection' className='min-h-screen py-[100px]'>            
            <h3 className="text-3xl text-center font-semibold">Mapa</h3>
            <PlacesMapClient places={places} />
        </div>
    )
}
