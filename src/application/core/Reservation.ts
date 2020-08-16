import iTimer from '../../adapter/schedule/iTimer'
import axios from 'axios'
import systemLogger from '../../common/logger'
import iProgram from '../../entities/iProgaram'
import iTimetable from './iTimetable'
import settings from '../../conf/setting'

export default class Recording {
    private timer: iTimer
    private timetable: iTimetable

    constructor(timer:iTimer,timetable:iTimetable){
        this.timer = timer
        this.timetable = timetable
    }
    public register(program:iProgram){
        systemLogger.debug(`録音予約 => ${JSON.stringify(program.title)}_${program.startTime}`)
        const func = () => {axios.post(`${settings.express.host}:${settings.express.port}/timetable/${program.id}/record`)}
        this.timer.set(program.id,program.startTime,func)
        this.timetable.reserved(program.id)
    }
    public async cancel(program:iProgram){
        systemLogger.debug(`予約取消 => ${JSON.stringify(program)}_${program.startTime}`)
        this.timer.unset(program.id)
        this.timetable.canceled(program.id)
    }
    public show(){}
}