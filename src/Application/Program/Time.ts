import moment from 'moment'
import iTime from './iTime'

export default class Time implements iTime{
    private now:number = parseInt(moment(new Date()).format('YYYYMMDDHHmmss'))
    constructor(private time:number){}
    public isPast():boolean{
        return (this.now >= this.time)
    }
    public calclateDuration():number{
        return (this.time - this.now)
    }
    public toObject():{[key:string]:number}{
        const formatedTime = moment(`${String(this.time).substr(0,8)}T${String(this.time).substr(8,6)}`)
        const obj:{[key:string]:number} = {
            year: formatedTime.year(),
            month: formatedTime.month(),
            date: formatedTime.date(),
            hour: formatedTime.hour(),
            minute: formatedTime.minute(),
            second: formatedTime.second()
        }
        return obj
    }
    public toString():string{
        return String(this.time)
    }
}