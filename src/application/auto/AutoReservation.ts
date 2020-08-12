import md5 from 'md5'
import axios from 'axios'
import moment from 'moment'
import iTimetable from '../core/iTimetable'
import systemLogger from '../../common/logger'
import iAutoReservationTable from './iAutoReservationTable'

export default class AutoReservationService {
    constructor(private timetable:iTimetable, private autoReservationTable:iAutoReservationTable){}

    private checkBody(body:{[key:string]:any}){
        if (!body.daysOfWeek) return false
        if (typeof body.daysOfWeek !== "object") return false
        if (typeof body.title !== "string") return false
        if (typeof body.time !== "string") return false
        return true
    }

    private generateCondition(daysOfWeek:any){
        const condition = new Array()
        for (let i in daysOfWeek){
            condition.push({dayOfWeek: daysOfWeek[i]})
        }
        return condition
    }

    public async register(body:{[key:string]:any},dryrun?:boolean){
        if(!this.checkBody(body)) return {succeed:false,reason:"request body is illegal."}
        const hash = md5(body.title + body.time).slice(0,16)
        const id = moment().unix()

        if(await this.autoReservationTable.isDuplicate(hash)){
            return {succeed: false, reason: "duplicate rule was already registered."}
        }

        const today = parseInt(moment().format('YYYYMMDD'))
        const query = {
            $or: this.generateCondition(body.daysOfWeek),
            title: new RegExp(body.title),
            date: {$gte: today},
            "start.time": body.time
        };
        const programs = await this.timetable.find(query,{})

        if (!dryrun){
            this.autoReservationTable.register({
                id: id,
                title: body.title,
                time: body.time,
                daysOfWeek:body.daysOfWeek,
                hash: hash
            })
        }
        return {succeed:true,programs:programs} 
    }

    public async update(id:number,body:{[key:string]:any},dryrun?:boolean){
        if(!this.checkBody(body)) return {succeed: false,reason:"request body is illegal."}
        const hash = md5(body.title + body.time).slice(0,16)

        const today = parseInt(moment().format('YYYYMMDD'))
        const query = {
            $or: this.generateCondition(body.daysOfWeek),
            title: new RegExp(body.title),
            date: {$gte: today},
            "start.time": body.time
        };
        const programs = await this.timetable.find(query,{})

        if (!dryrun){
            this.autoReservationTable.update(id,{
                title: body.title,
                time: body.time,
                daysOfWeek:body.daysOfWeek,
                hash: hash
            })
        }
        return {succeed:true,programs:programs} 
    }

    public async run(){
        //自動録音設定をロード
        const settings = await this.autoReservationTable.show()
        for (let i in settings){
            const title = new RegExp(settings[i].title)
            const time = settings[i].time
            const condition = this.generateCondition(settings[i].daysOfWeek)
            const targets = await this.timetable.find({$and:[{title:title},{"start.time":time},{$or:condition},{status:'DEFAULT'}]},{id:1,_id:0})
            //予約録音サービス呼び出し
            for (let i in targets){
                axios.post(`http://localhost:3000/timetable/${targets[i].id}/reserve`).then((res)=>{console.log(res)})
                systemLogger.info(`自動予約: ${targets[i].id}`)
            }
        }   
    }

    public async cancel(id:number){
        this.autoReservationTable.remove(id)
    }

    public async show(id?:number){
        let result:{[key:string]:any}
        id 
        ? result = await this.autoReservationTable.show(id)
        : result = await this.autoReservationTable.show()
        return result
    }
}