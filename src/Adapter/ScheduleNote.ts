import nedb from 'nedb'
import bluebird from 'bluebird'
bluebird.promisifyAll(nedb.prototype)

import iScheduleNote from '../Application/ScheduleManagers/iScheduleNote'

const db = new nedb({
    filename: './database/schedule.db',
    autoload: true
})

export default class ScheduleNote implements iScheduleNote {
    public write(newDoc:{[key:string]:any}):void{
        db.insert(newDoc)
    }
    public async erase(id:number):Promise<void>{
        db.remove({id:id})
    }
    public async readAll():Promise<{[key:string]:any}>{
        return await db.findAsync({})
    }
    public async findById(id:number):Promise<{[key:string]:any}>{
        return await db.findAsync({id:id})
    }
}