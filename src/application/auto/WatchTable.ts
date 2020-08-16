import iWatchTable from './iWatchTable'
import iDatabases from '../../adapter/databases/iDatabase'
import moment from 'moment'

export default class WatchTable implements iWatchTable {
    constructor(private database:iDatabases){}

    public register(word:string):void{
        const id = moment().unix()
        this.database.insert({id:id,word:word})
    }
    public update(id:number,word:string):void{
        this.database.update(id,{word:word})
    }
    public cancel(id:number):void{
        this.database.remove({id:id})
    }
    public async show():Promise<{[key:string]:any}>{
        return await this.database.find({},{})
    }
}