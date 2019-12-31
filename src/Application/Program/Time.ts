import moment from 'moment'
import iTime from './iTime'

export default class Time implements iTime{
    private now:number = parseInt(moment(new Date()).format('YYYYMMDDHHmmss'))
    constructor(private time:number){}
    public isPast():boolean{
        return (this.now > this.time)
    }
    public calclateDuration():number{
        return (this.time - this.now)
    }
    public toObject():{[key:string]:string}{
        return {
            year: String(this.time).substr(0,4),
            month: String(this.time).substr(4,2),
            day: String(this.time).substr(6,2),
            hour: String(this.time).substr(8,2),
            minute: String(this.time).substr(10,2),
            second: String(this.time).substr(12,2)
        }
    }
    public toString():string{
        return String(this.time)
    }
}