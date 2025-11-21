import { Event } from "@/domain/entities/Event";
import { ViewOnMapButton, WhatsAppButton } from "../common/buttons";
import { CloudinaryImage } from "../common/CloudinaryImage";
import { CalendarIcon, FacebookIcon, InstagramIcon, LocationIcon, WebIcon } from "../common/icons";
import { VideoIcon } from "../common/icons/VideoIcon";
import { XMarkIcon } from "../common/icons/XMarkIcon";
import { ClockIcon } from "../common/icons/ClockIcon";
import { Place } from "@/domain/entities/Place";

interface Props{
    eventDetail: Event | null;
    setSelectedEvent: (event: Event | null) => void;
    handleFindPlaceById: (placeId:string) => Place | undefined;
}
export const EventDetail = ({eventDetail, setSelectedEvent, handleFindPlaceById}:Props) => {
   
    if(eventDetail == null){
        return
    }

    const place = handleFindPlaceById(eventDetail.placeId);
  
    const isEventDetailOpen = eventDetail != null;
    const isTempPlace = eventDetail?.placeId == 'tempPlace';

    const handleCloseEventDetail = () => {
        setSelectedEvent(null)
    }

    return ( 
        <aside 
            className={`${ isEventDetailOpen? 'flex' : 'hidden'} top-0 w-[360px] h-full flex-col fixed right-0 border-l-4 border-secondary bg-gray-100 text-primary z-1700 transition-all`}
        >
            <div className="flex justify-between items-center px-6 py-1">
                <h2 className="font-medium text-xl"></h2>
                <span
                    className='cursor-pointer text-gray-600 hover:text-red-500 text-lg font-bold' 
                    onClick={ () => handleCloseEventDetail() }
                ><XMarkIcon style='transition-all duration-300 hover:text-red-600' /></span>
            </div>

            <figure>
                <CloudinaryImage
                    imageName={ place?.photoUrl }
                    alt={ place?.name } 
                    className="mx-auto w-[150px] h-[150px] rounded-full" 
                />
            </figure>


            <div className="p-6 space-y-3 flex-1 overflow-y-auto">
                <h3 className="text-2xl font-bold text-primary capitalize">{eventDetail.title}</h3>
                
                <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                        <CalendarIcon />
                        {/* <span className="font-medium">{ dayjs(eventDetail.date).format('D [de] MMMM') }</span>  */}
                    </div>
                    <div className="flex items-center gap-2">
                        <ClockIcon />
                        <span className="font-medium">{eventDetail.timeStart} hs</span> 
                    </div>
                </div>

                {eventDetail.description && (
                    <p className="mt-4 text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                        {eventDetail.description}
                    </p>
                )}

                {eventDetail.artists && (
                    <p className="mt-4 font-semibold text-gray-800 leading-relaxed">
                        {eventDetail.artists}
                    </p>
                )}

                {
                    place && (
                        <>
                            <h3 className="mt-6 text-2xl font-bold text-primary capitalize flex items-center border-t border-gray-400"><LocationIcon /> {place.name}</h3>
                            {
                                place.phone && (
                                    <>
                                        <p className='mt-2 font-semibold text-gray-700'>
                                            <span className='text-gray-500'>Telefono: </span>
                                            {place.phone}
                                        </p>
                                    </>
                                )
                            }
                            {
                                place.whatsapp &&  (
                                    <>
                                        <p className='mt-2 font-semibold text-gray-700'>
                                            <span className='text-gray-500'>Whatsapp: </span>
                                            {place.whatsapp}
                                        </p>
                                        <WhatsAppButton whatsapp={ place.whatsapp } />
                                    </>
                                )
                            }
                            {
                                place.address && (
                                    <>
                                        <p className='mt-2 font-semibold text-gray-700'>
                                            <span className='text-gray-500'>Direccion: </span>
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
                        </>
                    )
                }



                {
                    isTempPlace && (
                        <>
                            <h3 className="mt-6 text-2xl font-bold text-primary capitalize flex items-center border-t border-gray-400">
                                <LocationIcon /> { eventDetail.tempPlaceName }
                            </h3>
                            {
                                eventDetail.tempPlacePhone && (
                                    <>
                                        <p className='mt-2 font-semibold text-gray-700'>
                                            <span className='text-gray-500'>Telefono: </span>
                                            {eventDetail.tempPlacePhone}
                                        </p>
                                    </>
                                )
                            }
                            {
                                eventDetail.tempPlaceWhatsapp &&  (
                                    <>
                                        <p className='mt-2 font-semibold text-gray-700'>
                                            <span className='text-gray-500'>Whatsapp: </span>
                                            { eventDetail.tempPlaceWhatsapp }
                                        </p>
                                        <WhatsAppButton whatsapp={ eventDetail.tempPlaceWhatsapp } />
                                    </>
                                )
                            }
                            {
                                eventDetail.tempPlaceAddress && (
                                    <>
                                        <p className='mt-2 font-semibold text-gray-700'>
                                            <span className='text-gray-500'>Direccion: </span>
                                            {eventDetail.tempPlaceAddress}
                                        </p>
                                        <ViewOnMapButton position={ eventDetail.tempPlacePosition } />
                                    </>
                                )
                            }

                        </>
                    )
                }

            </div>

        </aside>
    )
}
