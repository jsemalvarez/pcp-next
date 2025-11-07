import { FacebookIcon, InstagramIcon, WebIcon } from "@/presentation/icons";
import { Place } from "@/presentation/types/places";
import { ViewOnMapButton } from "../common/buttons/ViewOnMapButton";
import { VideoIcon } from "@/presentation/icons/VideoIcon";
import { WhatsAppButton } from "../common/buttons";





interface Props{
    place: Place
}

export const PlaceCard = ({place}:Props) => {


    const servicesToString = [
        place.hasGames && "Juegos",
        place.hasShow && "Show",
        place.hasFood && "Gastronomía",
        place.hasSupervision && "Profes a cargo"
      ].filter(Boolean).join(" / ");



    return (
        <div className="bg-gradient-to-b from-primary to-gray-100 shadow-lg shadow-cyan-500/50 p-[2px] flex justify-center items-center w-full max-w-sm h-[250px] rounded-lg shadow-md">
            <div className="bg-gradient-to-b from-secondary to-primary flex flex-col w-full h-full rounded-lg overflow-hidden">
                {/* <div className="h-1/3 w-full">
                    <img
                        src={place.photoUrl}
                        alt={place.name}
                        className="object-cover w-full h-full"
                    />
                </div> */}
  
                {/* Contenido scrollable */}
                <div className="flex-1 overflow-y-auto p-4 text-gray-200">
                    <h2 className="text-purple-800 text-2xl font-extrabold">{place.name}</h2>
                    <p className='font-bold -mt-1'>{place.schedules}</p>
                    <div className='-mt-1 text-sm'>
                        <p>{servicesToString}</p>

                    <p className="text-sm whitespace-pre-line mt-2">{place.description}</p>

                    </div>
                    {
                        place.phone && (
                            <>
                                <p className='mt-2 font-semibold'>
                                    <span className='text-gray-400'>Telefono: </span>
                                    {place.phone}
                                </p>
                            </>
                        )
                    }
                    {
                        place.whatsapp &&  (
                            <>
                                <p className='mt-2 font-semibold'>
                                    <span className='text-gray-400'>Whatsapp: </span>
                                    {place.whatsapp}
                                </p>
                                <WhatsAppButton whatsapp={ place.whatsapp } />
                            </>
                        )
                    }
                    {
                        place.address && (
                            <>
                                <p className='mt-2 font-semibold'>
                                    <span className='text-gray-400'>Direccion: </span>
                                    {place.address}
                                </p>
                                <ViewOnMapButton position={ place.position } />
                            </>
                        )
                    }

                    <div className='mt-2 flex justify-center items-center gap-6'>
                        {
                            place.web && (
                                <a href={place.web} target='_blank'>
                                    <WebIcon />
                                </a>
                            )                    
                        }
                        {
                            place.instagram && (
                                <a href={place.instagram} target='_blank'>
                                    <InstagramIcon />
                                </a>
                            )                    
                        }
                        {
                            place.facebook && (
                                <a href={place.facebook} target='_blank'>
                                    <FacebookIcon />
                                </a>
                            )                    
                        }
                        {
                            place.videoLink && (
                                <a href={place.videoLink} target='_blank'>
                                    <VideoIcon />
                                </a>
                            )                    
                        }
                    </div>

                </div>  
            </div>
        </div>
    )
}
