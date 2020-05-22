import Timetable from './iTimetable'
import moment from 'moment'
import systemLogger from '../../Adapter/Logger'

export default class TimetableReducer {
    private timetable:Timetable
    constructor(timetable:Timetable){
        this.timetable = timetable
    }
    public run(){
        const border = parseInt(moment().add(-7,'days').format('YYYYMMDD'))
        systemLogger.info(`delete info older than ${border}`)
        this.timetable.eraseOldInfo(border)
    }
}