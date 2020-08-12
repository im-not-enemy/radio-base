import iDatabase from '../../adapter/databases/iDatabase'
import iTimetable from './iTimetable'
import iSite from '../../adapter/sites/iSite'
import moment from 'moment'
import systemLogger from '../../common/logger'

export default class Timetable implements iTimetable{
    private nedb:iDatabase
    private sites:Array<iSite>
    constructor(nedb:iDatabase, sites:Array<iSite>){
        this.nedb = nedb
        this.sites = sites
    }
    public reload(){
        this.sites.forEach(async(site)=>{
            const dates = new Array()
            for (let i=-1; i<7; i++){
                const date = parseInt(moment(new Date()).add(i, 'd').format('YYYYMMDD'))
                if (await this.nedb.count({date:date,site:site.getSiteId()}) === 0) dates.push(date)
            }
            this.nedb.insert(await site.getProgramsByDates(dates))
        })
    }
    public async find(document:{},option:{}){
        return await this.nedb.find(document,option)
    }
    public async findById(id:number,option:{}){
        return await this.nedb.find({id:id},option)
    }

    public async findByDate(date:number,option:{}){
        return await this.nedb.find({date:date},option)
    }

    public async findNowOnAir(option:{}){
        const now = parseInt(moment().format('YYYYMMDDHHmmss'))
        return await this.nedb.find({startTime:{$lte:now},endTime:{$gte:now}},option)
    }
    
    public recording(id:number,pid:number){
        this.nedb.update(id,{status:"RECORDING",recording:{pid:pid}})
    }
    public recorded(id:number){
        this.nedb.update(id,{status:"RECORDED",reording:{pid:"-"}})
    }
    public reserved(id:number){
        this.nedb.update(id,{status:"RESERVED"})
    }
    public canceled(id:number){
        this.nedb.update(id,{status:"DEFAULT"})
    }
    public async downloaded(id:number){
        this.nedb.increment(id,{downloaded:1})
    }
    public async deleted(id:number){
        this.nedb.remove({id:id})
    }
}