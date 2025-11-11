import { Place } from "@/domain/entities/Place";
import { PlacesSearchClient } from "./PlacesSearchClient"
import { TitleSection } from "../common/TitleSection";
import { SubtitleSection } from "../common/SubtitleSection";



interface Props{
    places: Place[]
}

export const PlacesSearchSection = async({places}:Props) => {
    return (
        <div id='searchSection' className='min-h-screen py-[100px] text-center'>            
            <TitleSection>
                Buscá tu próximo paseo en familia
            </TitleSection>
            <SubtitleSection>
                Inspirate con nuevos lugares y actividades pensadas para los peques.
                <br/>
                Elegí el plan perfecto para tu próxima salida.
            </SubtitleSection>
            <PlacesSearchClient places={places} />
        </div>
    )
}
