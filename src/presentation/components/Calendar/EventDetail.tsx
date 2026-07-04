import { CalendarEvent } from "@/domain/entities/Event";
import { ViewOnMapButton, WhatsAppButton } from "../common/buttons";
import { CloudinaryImage } from "../common/CloudinaryImage";
import { CalendarIcon, FacebookIcon, InstagramIcon, LocationIcon, WebIcon } from "../common/icons";
import { VideoIcon } from "../common/icons/VideoIcon";
import { XMarkIcon } from "../common/icons/XMarkIcon";
import { ClockIcon } from "../common/icons/ClockIcon";
import { Place } from "@/domain/entities/Place";
import { fortmatDate } from "@/presentation/utils/formatDate";

import { useFavorites } from "@/presentation/contexts/FavoritesContext";
import { Heart, Ticket } from "lucide-react";

const PRICE_TYPE_LABELS: Record<string, string> = {
    FREE_ENTRY: "Gratuito",
    PAID_TICKET: "Arancelado",
    DONATION_BASED: "A la Gorra",
    WITH_CONSUMPTION: "Con Consumición",
};

interface Props {
    eventDetail: CalendarEvent | null;
    setSelectedEvent: (event: CalendarEvent | null) => void;
    handleFindPlaceById: (placeId: string) => Place | undefined;
}

export const EventDetail = ({ eventDetail, setSelectedEvent, handleFindPlaceById }: Props) => {
    const { isFavoriteEvent, toggleFavoriteEvent } = useFavorites();

    if (eventDetail == null) {
        return;
    }

    const place = handleFindPlaceById(eventDetail.placeId);
    const isEventDetailOpen = eventDetail != null;
    const isFav = isFavoriteEvent(eventDetail.id);

    const handleCloseEventDetail = () => {
        setSelectedEvent(null);
    };

    return (
        <aside
            className={`${isEventDetailOpen ? 'flex' : 'hidden'} top-0 w-[360px] h-full flex-col fixed right-0 border-l-4 border-secondary bg-gray-100 text-primary z-1700 transition-all`}
        >
            <div className="flex justify-between items-center px-6 py-1">
                <button
                    onClick={() => toggleFavoriteEvent(eventDetail.id)}
                    className="p-2 text-gray-600 hover:text-rose-500 transition-colors active:scale-95 md:hidden"
                    aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
                >
                    <Heart size={20} className={isFav ? "fill-rose-500 text-rose-500" : "text-gray-600"} />
                </button>
                <span
                    className='cursor-pointer text-gray-600 hover:text-red-500 text-lg font-bold'
                    onClick={() => handleCloseEventDetail()}
                ><XMarkIcon style='transition-all duration-300 hover:text-red-600' /></span>
            </div>

            <figure>
                <CloudinaryImage
                    imageName={place?.photoUrl ?? undefined}
                    alt={place?.name ?? undefined}
                    className="mx-auto w-[150px] h-[150px] rounded-full"
                />
            </figure>

            <div className="p-6 space-y-3 flex-1 overflow-y-auto no-scrollbar">
                <h3 className="text-2xl font-bold text-primary capitalize">{eventDetail.title}</h3>

                <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                        <CalendarIcon />
                        <span className="font-medium">
                            {fortmatDate(eventDetail.date instanceof Date
                                ? eventDetail.date.toISOString()
                                : String(eventDetail.date)
                            )}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ClockIcon />
                        <span className="font-medium">{eventDetail.timeStart} hs</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                        <div className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-full w-max">
                            👦 Edad: {
                                eventDetail.ageMin === 0.5 ? 'Desde 6 meses' : `Desde los ${eventDetail.ageMin} años`
                            } {
                                eventDetail.ageMax 
                                  ? `hasta los ${eventDetail.ageMax} años` 
                                  : 'en adelante'
                            }
                        </div>
                        <div className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:text-emerald-450 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full w-max flex items-center gap-1">
                            <Ticket size={12} />
                            {PRICE_TYPE_LABELS[eventDetail.priceType] || eventDetail.priceType}
                        </div>
                    </div>
                </div>

                {eventDetail.description && (
                    <p className="mt-4 text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                        {eventDetail.description}
                    </p>
                )}

                {/* Botones para Entradas y Reservas */}
                {(eventDetail.ticketUrl || eventDetail.bookingWhatsapp || (eventDetail.priceType === 'PAID_TICKET' && (place?.whatsapp || place?.phone))) && (
                    <div className="flex flex-col gap-2 pt-3 border-t border-gray-200 mt-4">
                        {eventDetail.ticketUrl && (
                            <a
                                href={eventDetail.ticketUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-2.5 bg-brand-primary text-white font-black rounded-xl hover:bg-brand-primary/90 transition-all text-sm shadow-md text-center"
                            >
                                🎟️ Comprar Entradas
                            </a>
                        )}
                        {eventDetail.bookingWhatsapp ? (
                            <a
                                href={`https://wa.me/${eventDetail.bookingWhatsapp.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 text-white font-black rounded-xl hover:bg-green-600 transition-all text-sm shadow-md text-center"
                            >
                                💬 Reservar por WhatsApp
                            </a>
                        ) : (
                            eventDetail.priceType === 'PAID_TICKET' && (
                                <>
                                    {!eventDetail.ticketUrl && place?.whatsapp && (
                                        <a
                                            href={`https://wa.me/${place.whatsapp.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 text-white font-black rounded-xl hover:bg-green-600 transition-all text-sm shadow-md text-center"
                                        >
                                            💬 Reservar por WhatsApp
                                        </a>
                                    )}
                                    {!eventDetail.ticketUrl && !place?.whatsapp && place?.phone && (
                                        <a
                                            href={`tel:${place.phone}`}
                                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-brand-primary text-white font-black rounded-xl hover:bg-brand-primary/90 transition-all text-sm shadow-md text-center"
                                        >
                                            📞 Reservar por Teléfono
                                        </a>
                                    )}
                                </>
                            )
                        )}
                    </div>
                )}

                {place && (
                    <>
                        <h3 className="mt-6 text-2xl font-bold text-primary capitalize flex items-center border-t border-gray-400">
                            <LocationIcon /> {place.name}
                        </h3>
                        {place.phone && (
                            <p className='mt-2 font-semibold text-gray-700'>
                                <span className='text-gray-500'>Telefono: </span>
                                {place.phone}
                            </p>
                        )}
                        {place.whatsapp && (
                            <>
                                <p className='mt-2 font-semibold text-gray-700'>
                                    <span className='text-gray-500'>Whatsapp: </span>
                                    {place.whatsapp}
                                </p>
                                <WhatsAppButton whatsapp={place.whatsapp} />
                            </>
                        )}
                        {place.address && (
                            <>
                                <p className='mt-2 font-semibold text-gray-700'>
                                    <span className='text-gray-500'>Direccion: </span>
                                    {place.address}
                                </p>
                                <ViewOnMapButton position={{ lat: place.lat, lng: place.lng }} />
                            </>
                        )}
                        <div className='mt-2 flex justify-center items-center gap-6'>
                            {place.web && (
                                <a href={place.web} target='_blank'><WebIcon /></a>
                            )}
                            {place.instagram && (
                                <a href={place.instagram} target='_blank'><InstagramIcon /></a>
                            )}
                            {place.facebook && (
                                <a href={place.facebook} target='_blank'><FacebookIcon /></a>
                            )}
                            {place.videoLink && (
                                <a href={place.videoLink} target='_blank'><VideoIcon /></a>
                            )}
                        </div>
                    </>
                )}
            </div>
        </aside>
    );
};
