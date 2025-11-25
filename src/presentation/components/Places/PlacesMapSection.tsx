import { Place } from "@/domain/entities/Place";
import { PlacesMapClient } from "./PlacesMapClient";
import { TitleSection } from "../common/TitleSection";
import { SubtitleSection } from "../common/SubtitleSection";


interface Props{
    places: Place[]
}

export const PlacesMapSection = async({places}:Props) => {
    return (
        <section 
            id='mapSection' 
            className='min-h-screen py-[100px] text-center'
        > 
            <TitleSection>
                Nuestro mapa para familias
            </TitleSection>
            <SubtitleSection>
                Explorá el mapa interactivo y encontrá cafés, restaurantes y espacios pensados para disfrutar con los peques. Todo en un solo lugar, fácil y divertido
            </SubtitleSection>
            <PlacesMapClient places={places} />
        </section>
    )
}
