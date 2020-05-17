import iReservationService from './iReservationService'
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

export default class ReservationService implements iReservationService{
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
        systemLogger.info(`予約録音登録処理開始 => id:${id}`)
        const source = await this.timetable.findById(id,{})
        const program = this.programBuilder.run(source[0])
        const reservationBot = new ReservationBot(program,this.nodeScheduler,this.timetable)
        const result = reservationBot.register()
        if (result.succeed === true){
            this.timetableOverWriter.run(id,{status:'RESERVED'})
            systemLogger.info(`予約録音登録処理完了 => id:${id}`)
        }
        if (result.succeed === false){
            systemLogger.error(`予約録音登録処理失敗 => id:${id}, reason:${result.reason}`)
        }
        return result
    }
    public async cancel(id:number):Promise<{[key:string]:any}>{
        systemLogger.info(`予約録音取消処理開始 => id:${id}`)
        const source = await this.timetable.findById(id,{})
        const program = this.programBuilder.run(source[0])
        const reservationBot = new ReservationBot(program,this.nodeScheduler,this.timetable)
        const result = reservationBot.cancel()
        if (result.succeed === true){
            this.timetableOverWriter.run(id,{status:'DEFAULT'})
            systemLogger.info(`予約録音取消処理完了 => id:${id}`)
        }
        if (result.succeed === false){
            systemLogger.error(`予約録音取消処理失敗 => id:${id}, reason:${result.reason}`)
        }
        return result
    }
}