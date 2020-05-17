import iAutoReservationTable from '../Application/Services/iAutoReservationTable'
import nedb from 'nedb'
import bluebird from 'bluebird'
const db = new nedb({filename: './database/autoReservationTable.db', autoload: true})
const Cursor = db.find({}).constructor
// https://github.com/louischatriot/nedb/issues/276#issuecomment-225511866
bluebird.promisifyAll(nedb.prototype)
bluebird.promisifyAll(Cursor.prototype)

export default class AutoReservationTable implements iAutoReservationTable {
    public write(newDoc:{[key:string]:any}):void{
        db.insert(newDoc)
    }
    public removeByGroupId(groupId:number):void{
        db.remove({groupId:groupId},{})
    }
    public async findByGroupId(groupId:number,option:{[key:string]:any}):Promise<{[key:string]:any}>{
        return await db.find({groupId:groupId},option).sort({id:1}).execAsync()
    }
    public async findAll():Promise<{[key:string]:any}>{
        return await db.find({},{}).execAsync()
    }
    public update(query:{[key:string]:any},update:{[key:string]:any}):void {
        db.update(query,{$set:update})
    }
    public overwrite(groupId:number,newDoc:{[key:string]:any}):void{
        db.update({groupId:groupId},{$set:newDoc})
    }

}