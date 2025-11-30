import dayjs from "dayjs"

export const fortmatDate = (date: string) => {
    return dayjs(date).format('D [de] MMMM')
}