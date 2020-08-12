import iDatabase from '../../adapter/databases/iDatabase'
import iSite from '../../adapter/sites/iSite'

export default class Timetable {
    private nedb:iDatabase
    private sites:Array<iSite>
    constructor(nedb:iDatabase, sites:Array<iSite>){
        this.nedb = nedb
        this.sites = sites
    }
    public reload(){
        this.sites.forEach(async(site)=>{
            this.nedb.remove({})
            this.nedb.insert(await site.getStations())
        })
    }
    public async get(){
        return await this.nedb.find({},{})
    }
}