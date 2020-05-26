import ReservationService from './iReservationService'
import AutoRservationTable from './iAutoReservationTable'
import Timetable from '../TimeTableManagers/iTimetable'
import systemLogger from '../../Adapter/Logger'
import moment from 'moment'
import md5 from 'md5'

export default class AutoReservationService {
    constructor(private timetable:Timetable, private autoReservationTable:AutoRservationTable, private reservationService:ReservationService){}

    private checkBody(body:{[key:string]:any}){
        if (!body.daysOfWeek) return false
        if (typeof body.daysOfWeek !== "object") return false
        if (typeof body.title !== "string") return false
        if (typeof body.timer !== "string") return false
        if (body.timer.length !== 6) return false
        return true
    }
    private generateCondition(daysOfWeek:any){
        const condition = new Array()
        for (let i in daysOfWeek){
            condition.push({dayOfWeek: daysOfWeek[i]})
        }
        return condition
    }

    public async test(body:{[key:string]:any}){
        if(!this.checkBody(body)) return {succeed: false}

        const today = parseInt(moment().format('YYYYMMDD'))
        const query = {
            $or: this.generateCondition(body.daysOfWeek),
            title: new RegExp(body.title),
            date: {$gte: today},
            //status: "DEFAULT",
            timer: body.timer
        }
        const option = {
            id:1,title:1,
            date:1,dayOfWeek:1,
            status:1,station:1,
            startTime:1,endTime:1,
            performer:1,img:1,
            _id:0,favorite:1
        }
        return await this.timetable.find(query,option)
    }

    public async register(body:{[key:string]:any}){
        if(!this.checkBody(body)) return {succeed: false}
        const hash = md5(body.title + body.timer).slice(0,16)

        if(await this.autoReservationTable.countByHash(hash) > 0){
            return {succeed: false, reason: "duplicate rule was already registered."}
        }

        const today = parseInt(moment().format('YYYYMMDD'))
        const query = {
            $or: this.generateCondition(body.daysOfWeek),
            title: new RegExp(body.title),
            date: {$gte: today},
            status: "DEFAULT",
            timer: body.timer
        }
        const option = {
            id:1,title:1,
            date:1,dayOfWeek:1,
            status:1,station:1,
            startTime:1,endTime:1,
            _id:0
        }

        const programs = await this.timetable.find(query,option)

        //設定をDBに登録
        this.autoReservationTable.write({
            title: body.title,
            timer: body.timer,
            daysOfWeek:body.daysOfWeek,
            hash: hash
        })
        return {succeed: true}
    }

    public async update(_id:string,body:{[key:string]:any}){
        if(!this.checkBody(body)) return {succeed: false}
        const hash = md5(body.title + body.timer).slice(0,16)
        if(await this.autoReservationTable.countDuplicates(_id,hash) > 0){
            return {succeed: false, reason: "duplicate rule found."}
        }

        //旧設定有無確認
        if (await this.autoReservationTable.countBy_Id(_id) < 1) return {succeed: false, reason: "target not found."}

        //設定をDBに登録
        this.autoReservationTable.update({_id:_id},{title:body.title,timer:body.timer,daysOfWeek:body.daysOfWeek})
        return {succeed: true}
    }

    public async run(){
        //自動録音設定をロード
        const autoSettings = await this.autoReservationTable.findAll()
        for (let i in autoSettings){
            const title = new RegExp(autoSettings[i].title)
            const timer = new RegExp(autoSettings[i].timer)
            const condition = this.generateCondition(autoSettings[i].daysOfWeek)
            const targets = await this.timetable.find({$and:[{title:title},{timer:timer},{$or:condition},{status:'DEFAULT'}]},{id:1,_id:0})
            //予約録音サービス呼び出し
            for (let i in targets){
                this.reservationService.register(targets[i].id)
                systemLogger.info(`自動予約: ${targets[i].id}`)
            }
        }   
    }

    public async cancel(_id:string){
        if (typeof _id !== "string") return {succeed: false}
        this.autoReservationTable.removeBy_Id(_id)
    }

    public async showSetting(){
        return await this.autoReservationTable.findAll()
    }
}