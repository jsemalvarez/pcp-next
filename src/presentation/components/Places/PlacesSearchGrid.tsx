import { Place } from "@/presentation/types/places"
import { PlaceCard } from "./PlaceCard"

interface Props{
    places: Place[]
}

export const PlacesSearchGrid = ({places}:Props) => {
    return (
        <div className='mx-auto flex flex-wrap justify-center gap-4 p-4 max-w-[1300px]'>
            {
                places.map( place => ( 
                    <PlaceCard key={place.id} place={place} />
                ))
            }

        </div>
    )
}
