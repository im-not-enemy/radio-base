import iTimetable from '../Application/TimeTableManagers/iTimetable'
import nedb from 'nedb'
import bluebird from 'bluebird'
const db = new nedb({filename: './database/timetable.db', autoload: true})
const Cursor = db.find({}).constructor
// https://github.com/louischatriot/nedb/issues/276#issuecomment-225511866
bluebird.promisifyAll(nedb.prototype)
bluebird.promisifyAll(Cursor.prototype)

export default class Timetable implements iTimetable{
    public write(newDoc:{[key:string]:any}):void{
        db.insert(newDoc)
    }

    public erase():void{}

    public async find(query:{[key:string]:any},option:{[key:string]:any}):Promise<{[key:string]:any}>{
        return await db.find(query,option).sort({id:1}).execAsync()
    }

    public findByDate():void{}

    public async findById(id:number,option:{[key:string]:any}):Promise<{[key:string]:any}>{
        return await db.find({id:id},option).execAsync()
    }

    public async findByStatus(status:string):Promise<{[key:string]:any}>{
        return await db.find({status:status},{id:1,_id:0}).sort({id:1}).execAsync()
    }

    public overwrite(id:number,newDoc:{[key:string]:any}):void{
        db.update({id:id},{$set:newDoc})
    }

    public async countByDate(date:number):Promise<number>{
        return await db.count({date:date}).execAsync()
    }
    public eraseOldInfo(date:number):boolean{return true}
}