import Timetable from './iTimetable'

export default class TimetableOverWriter {
    constructor(private timeTable:Timetable){}
    public run(id:number, newDoc:{[key:string]:any}):void {
        this.timeTable.overwrite(id,newDoc)
    }
}