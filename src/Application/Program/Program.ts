import Id from './iId'
import Station from './iStation'
import Title from './iTitle'
import Status from './iStatus'
import Time from './iTime'
import iProgram from './iProgram'

export default class Program implements iProgram{
    constructor(private id:Id, private station:Station, private title:Title, private status:Status, private startTime:Time, private endTime:Time){}

    public canStartRecording():{[key:string]:any}{
        if (this.status.isRecording()) return {succeed:false, reason:'This program is already recording.'}
        if (this.status.isRecorded()) return {succeed:false, reason:'This program is already recorded.'}
        if (!this.startTime.isPast()) return {succeed:false, reason:'This program has not been started yet.'}
        if (this.endTime.isPast()) return {succeed:false, reason:'This program is already end.'}
        return {succeed:true}
    }
    public canStartReservation():{[key:string]:any}{
        if (this.status.isRecording()) return {succeed:false, reason:'This program is already recording.'}
        if (this.status.isRecorded()) return {succeed:false, reason:'This program is already recorded.'}
        if (this.status.isReserved()) return {succeed:false, reason:'This program is already reserved.'}
        if (this.startTime.isPast()) return {succeed:false, reason:'This program is already started.'}
        if (this.endTime.isPast()) return {succeed:false, reason:'This program is already end.'}
        return {succeed:true}
    }
    public canCancelReservation():{[key:string]:any}{
        if (!this.status.isReserved()) return {succeed:false, reason:'This program is not reserved yet.'}
        return {succeed:true}
    }
    public calculateDuration():number{
        return this.endTime.calclateDuration()
    }
    public toStringStation():string{
        return this.station.toString()
    }
    public toStringTitle():string{
        return this.title.toString()
    }
    public toStringStartTime():string{
        return this.startTime.toString()
    }
    public toObjectStartTime():{[key:string]:any}{
        return this.startTime.toObject()
    }
    public toStringId():string{
        return this.id.toString()
    }
}