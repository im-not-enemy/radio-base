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
    public removeBy_Id(_id:string):void{
        db.remove({_id:_id},{})
    }
    public async countByTitle(title:RegExp):Promise<number>{
        return await db.count({title:title}).execAsync()
    }
    public async countByHash(hash:string):Promise<number>{
        return await db.count({hash:hash}).execAsync()
    }
    public async countBy_Id(_id:string):Promise<number>{
        return await db.count({_id:_id}).execAsync()
    }
    public async countDuplicates(_id:string,hash:string){
        return await db.count({$not:{_id:_id},hash:hash}).execAsync()
    }
    public async findAll():Promise<{[key:string]:any}>{
        return await db.find({},{hash:0}).execAsync()
    }
    public update(query:{[key:string]:any},update:{[key:string]:any}):void {
        db.update(query,{$set:update})
    }
    public overwrite(groupId:number,newDoc:{[key:string]:any}):void{
        db.update({groupId:groupId},{$set:newDoc})
    }

}