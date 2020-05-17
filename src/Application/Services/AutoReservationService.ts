import ReservationService from './iReservationService'
import AutoRservationTable from './iAutoReservationTable'
import Timetable from '../TimeTableManagers/iTimetable'
import systemLogger from '../../Adapter/Logger'

export default class AutoReservationService {
    constructor(private timetable:Timetable, private autoReservationTable:AutoRservationTable, private reservationService:ReservationService){}

    private checkBody(body:{[key:string]:any}){
        if (!body.daysOfWeek) return false
        if (typeof body.daysOfWeek !== "object") return false
        return true
    }
    private generateCondition(daysOfWeek:any){
        const condition = new Array()
        for (let i in daysOfWeek){
            condition.push({dayOfWeek: daysOfWeek[i]})
        }
        return condition
    }

    public async register(id:number,body:{[key:string]:any}){
        if(!this.checkBody(body)) return {succeed: false}

        //groupID取得
        const program = await this.timetable.findById(id,{title:1,groupId:1,_id:0})
        const groupId = program[0].groupId
        const title = program[0].title

        //旧設定有無確認
        const oldSetting = await this.autoReservationTable.findByGroupId(groupId,{_id:0})
        if (oldSetting.length !== 0) {
            return {succeed: false}
        }

        //設定をDBに登録
        this.autoReservationTable.write({groupId:groupId,title:title,daysOfWeek:body.daysOfWeek})
    }

    public async update(id:number,body:{[key:string]:any}){
        if(!this.checkBody(body)) return {succeed: false}

        //groupID取得
        const program = await this.timetable.findById(id,{title:1,groupId:1,_id:0})
        const groupId = program[0].groupId
        const title = program[0].title

        //旧設定有無確認
        const oldSetting = await this.autoReservationTable.findByGroupId(groupId,{_id:0})
        if (oldSetting.length === 0) {
            return {succeed: false}
        }

        //設定をDBに登録
        this.autoReservationTable.update({groupId:groupId},{title:title,daysOfWeek:body.daysOfWeek})
    }

    public async run(){
        //自動録音設定をロード
        const autoSettings = await this.autoReservationTable.findAll()
        for (let i in autoSettings){
            const groupId = autoSettings[i].groupId
            const condition = this.generateCondition(autoSettings[i].daysOfWeek)
            const targets = await this.timetable.find({$and:[{groupId:groupId},{$or:condition},{status:'DEFAULT'}]},{id:1,_id:0})
            //予約録音サービス呼び出し
            for (let i in targets){
                this.reservationService.register(targets[i].id)
                systemLogger.info(`自動予約: ${targets[i].id}`)
            }
        }   
    }

    public async cancel(id:number){
        const program = await this.timetable.findById(id,{title:1,groupId:1,_id:0})
        this.autoReservationTable.removeByGroupId(program[0].groupId)
    }

    public async showSetting(id:number){
        const program = await this.timetable.findById(id,{title:1,groupId:1,_id:0})
        return await this.autoReservationTable.findByGroupId(program[0].groupId,{_id:0})
    }
}