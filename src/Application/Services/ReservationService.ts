import Timetable from '../TimeTableManagers/iTimetable'
import TimeitableOverWriter from '../TimeTableManagers/TimetableOverWriter'
import ScheduleNote from '../ScheduleManagers/iScheduleNote'
import ProgramBuilder from '../Builders/ProgramBuilder'
import RecordingBot from '../Bots/RecordingBot'
import ReservationBot from '../Bots/ReservationBot'
import Radiko from '../../Adapter/Radiko'
import FFmpeg from '../../Adapter/FFmpeg'
import TapeRecorder from '../TapeRecorder/TapeRecorder'
import NodeScheduler from '../ScheduleManagers/NodeScheduler'
import systemLogger from '../../Adapter/Logger'

export default class ReservationService {
    private settings = require('../../../conf/settings.json')
    private programBuilder = new ProgramBuilder()
    private radiko = new Radiko('JP11')
    private ffmpeg = new FFmpeg(this.radiko, this.settings.outputDir, this.settings.logDir)
    private tapeRecorder = new TapeRecorder(this.ffmpeg) 
    private nodeScheduler:NodeScheduler
    private timetableOverWriter:TimeitableOverWriter

    constructor(private timetable:Timetable, private scheduleNote:ScheduleNote){
        this.nodeScheduler = new NodeScheduler(scheduleNote)
        this.timetableOverWriter = new TimeitableOverWriter(timetable)
    }

    public async register(id:number):Promise<{[key:string]:any}>{
        const source = await this.timetable.findById(id,{})
        const program = this.programBuilder.run(source[0])
        const recordingBot = new RecordingBot(program)
        const reservationBot = new ReservationBot(program,this.nodeScheduler,recordingBot)
        const result = reservationBot.register()
        if (result.succeed === true){
            this.timetableOverWriter.run(id,{status:'RESERVED'})
            systemLogger.debug(`予約録音完了 => id:${id}`)
        }
        return result
    }
    public async cancel(id:number):Promise<{[key:string]:any}>{
        const source = await this.timetable.findById(id,{})
        const program = this.programBuilder.run(source[0])
        const reservationBot = new ReservationBot(program,this.nodeScheduler)
        const result = reservationBot.cancel()
        if (result.succeed === true){
            this.timetableOverWriter.run(id,{status:'DEFAULT'})
            systemLogger.debug(`予約抹消完了 => id:${id}`)
        }
        return result
    }
}