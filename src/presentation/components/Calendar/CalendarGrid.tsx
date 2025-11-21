
import { Event } from '@/domain/entities/Event';
import { groupEventsByDate } from '@/presentation/utils/groupEventsByDate';
import { Dayjs } from 'dayjs';

import { JSX } from "react";
import { CalendarDay } from './CalendarDay';

interface Props {
    events: Event[];
    currentDate: Dayjs;
    setSelectedEvent: (event: Event | null) => void;
}

export const CalendarGrid = ({ events, currentDate, setSelectedEvent }: Props) => {

  const eventsByDate = groupEventsByDate(events);

  const startOfMonth = currentDate.startOf("month");
  const endOfMonth = currentDate.endOf("month");
  const daysInMonth = endOfMonth.date();
  const startDay = (startOfMonth.day() + 6) % 7; // Hace que Lunes sea el primer día (0=Lunes)

  // Generamos los días del calendario (vacíos + reales)
  const days: JSX.Element[] = [];

  // 1️⃣ Días vacíos antes del inicio del mes
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-[120px]" />);
  }

  // 2️⃣ Días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = currentDate.date(day);
    const dateKey = dateObj.format("YYYY-MM-DD");
    const eventsDate = eventsByDate[dateKey] || [];

    days.push(
      <CalendarDay
        key={dateKey}
        day={day}
        dateKey={dateKey}
        events={eventsDate}
        setSelectedEvent={setSelectedEvent}
      />
    );
  }
  return(
    <div className="grid grid-cols-7 gap-[1px] bg-gray-300 border-t">
      {days}
    </div>
  )
};