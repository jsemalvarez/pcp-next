import { FacebookIcon, InstagramIcon, WebIcon } from "@/presentation/components/common/icons";
import { Place } from "@/domain/entities/Place";

import { VideoIcon } from "@/presentation/components/common/icons/VideoIcon";
import { WhatsAppButton, ViewOnMapButton } from "../common/buttons";


import { useFavorites } from "@/presentation/contexts/FavoritesContext";
import { Heart } from "lucide-react";

interface Props{
    place: Place
}

export const PlaceCard = ({place}:Props) => {
    const { isFavoritePlace, toggleFavoritePlace } = useFavorites();
    const isFav = isFavoritePlace(place.id);

    const servicesToString = [
        place.hasGames && "Juegos",
        place.hasShow && "Show",
        place.hasFood && "Gastronomía",
        place.hasSupervision && "Profes a cargo"
      ].filter(Boolean).join(" / ");



    return (
        <div className="bg-gradient-to-b from-primary to-gray-100 shadow-lg shadow-cyan-500/50 p-[2px] flex justify-center items-center w-full max-w-sm h-[250px] rounded-lg shadow-md">
            <div className="bg-secondary flex flex-col w-full h-full rounded-lg overflow-hidden relative">
                {/* Botón de favoritos (corazón) */}
                <button
                    onClick={() => toggleFavoritePlace(place.id)}
                    className="absolute top-3 right-3 z-10 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-sm transition-all duration-200 active:scale-90"
                    aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
                >
                    <Heart size={18} className={isFav ? "fill-rose-500 text-rose-500" : "text-white"} />
                </button>

                {/* <div className="h-1/3 w-full">
                    <img
                        src={place.photoUrl}
                        alt={place.name}
                        className="object-cover w-full h-full"
                    />
                </div> */}
  
                {/* Contenido scrollable */}
                <div className="flex-1 overflow-y-auto p-4 text-gray-200">
                    <h2 className="text-primary text-2xl font-extrabold text-center pr-8">{place.name}</h2>
                    <p className='font-bold -mt-1'>{place.schedules}</p>
                    <div className='-mt-1 text-sm'>
                        <p>{servicesToString}</p>

                    <p className="text-gray-800 text-sm whitespace-pre-line mt-2">{place.description}</p>

                    </div>
                    {
                        place.phone && (
                            <>
                                <p className='mt-2 font-semibold'>
                                    <span className='text-primary'>Telefono: </span>
                                    {place.phone}
                                </p>
                            </>
                        )
                    }
                    {
                        place.whatsapp &&  (
                            <>
                                <p className='mt-2 font-semibold'>
                                    <span className='text-primary'>Whatsapp: </span>
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
                                    <span className='text-primary'>Direccion: </span>
                                    {place.address}
                                </p>
                                <ViewOnMapButton position={{ lat: place.lat, lng: place.lng }} />
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
