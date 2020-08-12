import iDatabase from './iDatabase'
import nedb from 'nedb'
import bluebird from 'bluebird'

export default class NeDB implements iDatabase {
    private db:any
    constructor(name:string){
        this.db = new nedb({filename: `./database/${name}.db`, autoload: true})
        const Cursor = this.db.find({}).constructor
        // https://github.com/louischatriot/nedb/issues/276#issuecomment-225511866
        bluebird.promisifyAll(nedb.prototype)
        bluebird.promisifyAll(Cursor.prototype)
    }
    public insert(document:{}){
        this.db.insert(document)
    }
    public async count(document:{}):Promise<number>{
        return await this.db.count(document).execAsync()
    }
    public async find(document:{},option:{}):Promise<{[key:string]:any}>{
        return await this.db.find(document,option).sort({id:1}).execAsync()
    }
    public remove(document:{}){
        this.db.remove(document,{multi:true})
    }
    public update(id:number,newDocument:{}){
        this.db.update({id:id},{$set:newDocument})
    }
    public increment(id:number,newDocument:{}){
        this.db.update({id:id},{$inc:newDocument})
    }
}