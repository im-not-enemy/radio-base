import moment from 'moment'
import iProgram from './iProgaram'

export default class Program implements iProgram{
    public id: number
    public title: string
    public station: string
    public status: string
    public date: number
    public dayOfWeek: number
    public startTime: number
    public endTime: number
    public info: string
    public desc: string
    public performer: string
    public url: string
    public img: string
    public downloaded: number
    public site: string
    public recording: {}

    constructor(src:{[key:string]:any}){
        this.id = src.id
        this.title = src.title
        this.station = src.station
        this.status = src.status
        this.date = src.date
        this.dayOfWeek = src.dayOfWeek
        this.startTime = src.startTime
        this.endTime = src.endTime
        this.info = src.info
        this.desc = src.desc
        this.performer = src.performer
        this.url = src.url
        this.img = src.img
        this.downloaded = src.downloaded
        this.site = src.site
        this.recording = src.recording
    }
    public canStartRecording():{[key:string]:any}{
        const now = parseInt(moment().format('YYYYMMDDHHmmss'))
        if (this.startTime > now){
            return {
                result: false,
                reason: "this program is not started yet."
            }
        }
        else if (this.endTime <= now){
            return {
                result: false,
                reason: "this program was already broadcasted."
            }
        }
        else if (this.status === "RECORDED"){
            return {
                result: false,
                reason: "this program was already recorded."
            }
        }
        else if (this.status === "RECORDING"){
            return {
                result: false,
                reason: "this program is already recording."
            }
        }
        else {
            return {
                result: true
            }
        }
    }
    public canStopRecording():{[key:string]:any}{
        if (this.status !== "RECORDING"){
            return {
                result: false,
                reason: "this program is not recording."
            }
        }
        else {
            return {
                result: true
            }
        }
    }
    public canRegisterReservation():{[key:string]:any}{
        const now = parseInt(moment().format('YYYYMMDDHHmmss'))
        if (this.startTime < now){
            return {
                result: false,
                reason: "this program is already started."
            }
        }
        else if (this.endTime <= now){
            return {
                result: false,
                reason: "this program was already broadcasted."
            }
        }
        else if (this.status === "RECORDED"){
            return {
                result: false,
                reason: "this program was already recorded."
            }
        }
        else if (this.status === "RECORDING"){
            return {
                result: false,
                reason: "this program is already recording."
            }
        }
        else if (this.status === "RESERVED"){
            return {
                result: false,
                reason: "this program is already reserved."
            }
        }
        else {
            return {
                result: true
            }
        }
    }

    public canCancelReservation():{[key:string]:any}{
        const now = parseInt(moment().format('YYYYMMDDHHmmss'))
        if (this.status !== "RESERVED"){
            return {
                result: false,
                reason: "this program is not reserved."
            }
        }
        else {
            return {
                result: true
            }
        }
    }
}