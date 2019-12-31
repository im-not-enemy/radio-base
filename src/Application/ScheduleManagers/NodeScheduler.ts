import schedule from 'node-schedule'
import ScheduleNote from '../ScheduleManagers/iScheduleNote'
import iNodeScheduler from './iNodeScheduler'

export default class NodeScheduler implements iNodeScheduler{
    private activeJobs:Array<any> = []
    constructor(private scheduleNote:ScheduleNote){}

    public activate(rule:any,func:any):{[key:string]:any}{
        const job = schedule.scheduleJob(rule,()=>{func()})
        this.activeJobs.push(job)
        return { name: job.name, rule: rule}
    }
    public async deactivate(id:number):Promise<void>{
        const job = await this.scheduleNote.findById(id)
        this.activeJobs.forEach((el)=>{
            if (el.name === job[0].name) el.cancel()
        })
    }
    public persist(jobInfo:{[key:string]:any}){
        this.scheduleNote.write(jobInfo)
    }
}