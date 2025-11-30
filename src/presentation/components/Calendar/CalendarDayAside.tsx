import { Event } from "@/domain/entities/Event"
import { ClockIcon } from "../common/icons/ClockIcon"
import { XMarkIcon } from "../common/icons/XMarkIcon"
import { fortmatDate } from "@/presentation/utils/formatDate";

interface Props{
    calendarDayEvents: Event[] | null;
    handleOpenEventDetail: (event:Event | null) => void;
    handleCalendarDayAside: (event:Event[] | null) => void
}

export const CalendarDayAside = ({calendarDayEvents, handleOpenEventDetail, handleCalendarDayAside}:Props) => {

    const isCalendarDayAsideOpen = calendarDayEvents !== null;
    const handleCloseCalendarDayAside = () => {
        handleCalendarDayAside(null)
    }

    if(calendarDayEvents == null){
        return
    }
    
    return ( 
        <aside 
            className={`${ isCalendarDayAsideOpen? 'flex' : 'hidden'} top-0 w-[360px] h-full flex-col fixed right-0 border-l-4 border-secondary bg-gray-200 text-primary z-1600  overflow-y-auto`}
        >
            <div className="flex justify-between items-center p-6">
                <h2 className="font-extrabold text-xl">
                    Eventos:  { fortmatDate(calendarDayEvents[0]?.date) }
                </h2>
                <span
                    className='cursor-pointer text-gray-600 hover:text-red-500 text-lg font-bold' 
                    onClick={ () => handleCloseCalendarDayAside() }
                    ><XMarkIcon style='transition-all duration-300 hover:text-red-600' /></span>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {
                    calendarDayEvents.map( event => (
                        <div
                            key={event.id}
                            className="bg-primary border border-gray-200 rounded-xl p-4 shadow-xl hover:shadow-md transition"
                        >
                            <h3 className="font-semibold text-lg text-secondary mb-1">
                                {event.title}
                            </h3>
                            <div className="mt-2 text-sm text-gray-100 flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <ClockIcon />
                                    <span>{event.timeStart} - {event.timeEnd}</span>
                                </div>
                                {/* TODO: no se esta obteniendo datos del lugar en este punto */}
                                {/* <div className="flex items-center gap-2">
                                    <LocationIcon />
                                    <span>{event.location}</span>
                                </div> */}
                            </div>

                            <button
                                className="w-full mt-2 text-secondary border vorder-secondary rounded-full cursor-pointer"
                                onClick={() => handleOpenEventDetail(event)}
                                >
                                +info
                            </button>
                        </div>
                    ))
                }
            </div>
        </aside>
    )
}
