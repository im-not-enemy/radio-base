import nedb from 'nedb'
import bluebird from 'bluebird'
bluebird.promisifyAll(nedb.prototype)

import iTimetable from '../Application/TimeTableManagers/iTimetable'

const db = new nedb({
    filename: './database/timetable.db',
    autoload: true
})

export default class Timetable implements iTimetable{
    public write(newDoc:{[key:string]:any}):void{
        db.insert(newDoc)
    }

    public erase():void{}

    public async find(query:{[key:string]:any},option:{[key:string]:any}):Promise<{[key:string]:any}>{
        return await db.findAsync(query,option)
    }

    public findByDate():void{}

    public async findById(id:number,option:{[key:string]:any}):Promise<{[key:string]:any}>{
        return await db.findAsync({id:id},option)
    }

    public async findByStatus(status:string):Promise<{[key:string]:any}>{
        return await db.findAsync({status:status},{id:1,_id:0})
    }

    public overwrite(id:number,newDoc:{[key:string]:any}):void{
        db.update({id:id},{$set:newDoc})
    }

    public async countByDate(date:number):Promise<number>{
        return await db.countAsync({date:date})
    }
    public eraseOldInfo(date:number):boolean{return true}
}