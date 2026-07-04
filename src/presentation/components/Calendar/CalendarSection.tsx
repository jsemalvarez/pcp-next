import { CalendarEvent } from "@/domain/entities/Event"
import { SubtitleSection } from "../common/SubtitleSection"
import { TitleSection } from "../common/TitleSection"
import { CalendarClient } from "./CalendarClient"
import { Place } from "@/domain/entities/Place"


interface Props{
    events: CalendarEvent[];
    places: Place[];
}

export const CalendarSection = ({events, places}:Props) => {
  return (
    <section 
      id='calendarSection' 
      className='min-h-screen py-[100px]'
    >
        <TitleSection>
            Agenda familiar del mes
        </TitleSection>
        <SubtitleSection>
            Enterate de los próximos eventos y actividades para toda la familia
        </SubtitleSection>
        <CalendarClient 
          events={events} 
          places={places}
        />
    </section>
  )
}
