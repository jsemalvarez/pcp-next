import { Event } from "@/domain/entities/Event"
import { SubtitleSection } from "../common/SubtitleSection"
import { TitleSection } from "../common/TitleSection"
import { CalendarClient } from "./CalendarClient"


interface Props{
    events: Event[]
}

export const CalendarSection = ({events}:Props) => {
  return (
    <section id='calendarSection' className='min-h-screen py-[100px] text-center'>
        <TitleSection>
            Agenda familiar del mes
        </TitleSection>
        <SubtitleSection>
            Enterate de los próximos eventos y actividades para toda la familia
        </SubtitleSection>
        <CalendarClient events={events} />
    </section>
  )
}
