import { Event } from "@/domain/entities/Event";

interface Props {
  day: number;
  dateKey: string;
  events: Event[];
  setSelectedEvent: (event: Event | null) => void;
  handleCalendarDayAside: (event: Event[] | null) => void;
}

export const CalendarDay = ({ day, dateKey, events, setSelectedEvent, handleCalendarDayAside }: Props) => {
  const limitedEvents = events.slice(0, 2);
  const extraCount = events.length - limitedEvents.length;

  return (
    <div key={dateKey} className="h-[120px] bg-primary">
      <span className="text-secondary text-xs p-1 block">{day}</span>

      {limitedEvents.map((event) => (
        <button
          key={event.id}
          className={`${event.bgColor ? event.bgColor : 'bg-gray-500'} w-full cursor-pointer mb-1 px-1 truncate`}
          onClick={()=>setSelectedEvent(event)}
        >
          {event.title}
        </button>
      ))}

      {extraCount > 0 && (
        <button
          className="block mx-auto w-9/10 bg-gray-200 text-blue-500 text-center rounded-full cursor-pointer truncate"
          onClick={()=> handleCalendarDayAside(events)}
        >
          +{extraCount} más
        </button>
      )}
    </div>
  );
};
