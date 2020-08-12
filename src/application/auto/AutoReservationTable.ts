import iDatabase from '../../adapter/databases/iDatabase'

export default class AutoReservationTable{
    constructor(private nedb:iDatabase){}

    public async isDuplicate(hash:string):Promise<boolean>{
        if (await this.nedb.count({hash:hash}) > 0) return true
        return false
    }

    public register(document:{[key:string]:any}):void{
        this.nedb.insert(document)
    }

    public async show(id?:number):Promise<{[key:string]:any}>{
        let result:{[key:string]:any}
        (id)
        ? result = await this.nedb.find({id:id},{})
        : result = await this.nedb.find({},{})
        return result
    }
    
    public remove(id:number){
        this.nedb.remove({id:id})
    }

    public update(id:number,document:{[key:string]:any}){
        this.nedb.update(id,document)
    }
}