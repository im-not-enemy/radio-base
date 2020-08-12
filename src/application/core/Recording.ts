import moment from 'moment'
import iFFmpeg from '../../adapter/commands/iFFmpeg'
import Radiko from '../../adapter/sites/Radiko'
import Rajiru from '../../adapter/sites/Rajiru'
import iSite from '../../adapter/sites/iSite'
import systemLogger from '../../common/logger'
import iProgram from '../../entities/iProgaram'
import iTimetable from './iTimetable'

export default class Recording {
    private ffmpeg: iFFmpeg
    private site: iSite | undefined
    private timetable: iTimetable
    
    constructor(ffmpeg:iFFmpeg,timetable:iTimetable){
        this.ffmpeg = ffmpeg
        this.timetable = timetable
    }
    private setSite(site:string){
        if (site === "radiko"){
            this.site = new Radiko
        } else if (site === "rajiru"){
            this.site = new Rajiru
        }
    }
    public async start(program:iProgram){
        this.setSite(program.site)
        if(this.site === undefined) throw Error("site is undefined.")
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