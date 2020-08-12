import schedule from 'node-schedule'
import systemLogger from '../../common/logger'
import iTimer from './iTimer'
import moment from 'moment'

export default class NodeSchedule implements iTimer{
    private activeJobs:Array<any> = []

    private convert(time:number):{}{
        const strTime = String(time)
        const ojtTime = moment(`${strTime.slice(0,8)}T${strTime.slice(8)}`)
        const rule = {
            year: ojtTime.year(),
            month: ojtTime.month(),
            date: ojtTime.date(),
            hour: ojtTime.hour(),
            minute: ojtTime.minute(),
            second: ojtTime.second()
        }
        systemLogger.debug(`convert ${time} => ${JSON.stringify(rule)}`)
        return rule
    }

    public set(programId:number,time:number,func:any){
        const rule = this.convert(time)
        const job = schedule.scheduleJob(rule,()=>func())
        this.activeJobs.push({programId,job:job})
        systemLogger.debug(`activateJobs: ${JSON.stringify(this.activeJobs)}`)
    }
    public unset(programId:number){
        this.activeJobs.find((j)=>{
            if (j.programId === programId) j.job.cancel()
        })
        systemLogger.debug(`activateJobs: ${JSON.stringify(this.activeJobs)}`)
    }
    public setEveryMinute(func:any){
        const job = schedule.scheduleJob({second:0},()=>func())
        this.activeJobs.push({name:"everyMinute",job:job})
    }
    public setEveryHour(func:any){
        const job = schedule.scheduleJob({minute:0,second:0},()=>func())
        this.activeJobs.push({name:"everyHour",job:job})
    }
    public setEveryDay(func:any){
        const job = schedule.scheduleJob({hour:0,minute:0,second:0},()=>func())
        this.activeJobs.push({name:"everyDay",job:job})
    }
}