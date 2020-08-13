import moment from 'moment'
import iFFmpeg from '../../adapter/commands/iFFmpeg'
import iSite from '../../adapter/sites/iSite'
import systemLogger from '../../common/logger'
import iProgram from '../../entities/iProgaram'
import iTimetable from './iTimetable'

export default class Recording {
    constructor(private ffmpeg:iFFmpeg, private timetable:iTimetable, private site:iSite){}
    public async start(program:iProgram){
        systemLogger.debug(`録音開始 => ${JSON.stringify(program.title)}_${program.startTime}`)
        const now = moment()
        const end = moment(`${String(program.endTime).slice(0,8)}T${String(program.endTime).slice(8)}`)
        const duration = end.diff(now,"seconds")
        const input = await this.site.getPlaylist(program)
        const headers = await this.site.getHeaders()
        const output = `${program.station}_${program.title}_${program.startTime}`
        const pid = this.ffmpeg.run(duration,headers,input,output)
        this.timetable.recording(program.id,pid)
    }
    public stop(program:iProgram):void{
        systemLogger.debug(`録音停止 => ${JSON.stringify(program)}`)
        process.kill(program.recording.pid)
        this.timetable.recorded(program.id)
    }
}