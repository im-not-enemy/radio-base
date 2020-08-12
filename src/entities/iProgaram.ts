export default interface iProgaram {
    id: number
    title: string
    station: string
    status: string
    date: number
    dayOfWeek: number
    startTime: number
    endTime: number
    info: string
    desc: string
    performer: string
    url: string
    img: string
    downloaded: number
    site: string
    recording: {[key:string]:number}
    canRegisterReservation():{[key:string]:any}
    canCancelReservation():{[key:string]:any}
    canStartRecording():{[key:string]:any}
}