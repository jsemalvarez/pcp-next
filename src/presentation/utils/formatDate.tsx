import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"

dayjs.extend(utc)

// Las fechas de los eventos se guardan a medianoche UTC: se leen en UTC para que
// no se corran un día atrás en la hora de Argentina (UTC-3).
export const fortmatDate = (date: string | Date) => {
    return dayjs.utc(date).format('D [de] MMMM')
}
