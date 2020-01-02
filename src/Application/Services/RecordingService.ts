import Timetable from '../TimeTableManagers/iTimetable'
import ProgramBuilder from '../Builders/ProgramBuilder'
import RecordingBot from '../Bots/RecordingBot'
import TimetableOverWriter from '../TimeTableManagers/TimetableOverWriter'
import systemLogger from '../../Adapter/Logger'

export default class RecordingService {
    private programBuilder = new ProgramBuilder()
    private timetableOverWriter:TimetableOverWriter
    private waitingRoom:Array<any> = []

    constructor(private timetable:Timetable){
        this.timetableOverWriter = new TimetableOverWriter(timetable)
    }

    public async start(id:number):Promise<{[key:string]:any}>{
        systemLogger.info(`録音準備開始 => id:${id}`)
        const source = await this.timetable.findById(id,{})
        const program = this.programBuilder.run(source[0])
        const recordingBot = new RecordingBot(program)
        const result = await recordingBot.start()
        if (result.succeed === true){
            this.timetableOverWriter.run(id,{status:'RECORDING'})
            systemLogger.info(`録音準備完了。録音開始 => id:${id}`)
            this.waitingRoom.push({id: id,recordingBot: recordingBot})
        }
        if (result.succeed === false){
            systemLogger.error(`録音失敗 => id:${id}, reason:${result.reason}`)
        }
        return result
    }

    public async stop(id:number){
        systemLogger.info(`録音停止処理開始 => id:${id}`)
        this.waitingRoom.forEach((el)=>{
            if(el.id === id){
                el.recordingBot.stop()
                this.timetableOverWriter.run(id,{status:'RECORDED'})
                systemLogger.info(`録音停止処理完了 => id:${id}`)
            } 
        })
    }
}