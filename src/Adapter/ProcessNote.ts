import nedb from 'nedb'
import bluebird from 'bluebird'
bluebird.promisifyAll(nedb.prototype)

const db = new nedb({
    filename: './databse/process.db',
    autoload: true
})

export default class ProcessNote {
    public write(newDoc:{[key:string]:any}):void{
        db.insert(newDoc)
    }
    public async erase(id:number):Promise<void>{
        db.remove({id:id})
    }
    /*
    public async readAll():Promise<{[key:string]:any}>{
        return await db.findAsync({})
    }
    public async findById(id:number):Promise<{[key:string]:any}>{
        return await db.findAsync({id:id})
    }
    */
}