import Timetable from '../TimeTableManagers/iTimetable'

export default class FavoriteService {
    private timetable:Timetable
    constructor(timetable:Timetable){
        this.timetable = timetable
    }
    public mark(id:number):void{
        this.timetable.overwrite(id,{favorite:true})
    }
    public unmark(id:number):void{
        this.timetable.overwrite(id,{favorite:false})
    }
}