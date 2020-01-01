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
        const source = await this.timetable.findById(id,{})
        const program = this.programBuilder.run(source[0])
        const recordingBot = new RecordingBot(program)
        const result = await recordingBot.start()
        if (result.succeed === true){
            systemLogger.debug(`録音処理開始 => id:${id}`)
            this.timetableOverWriter.run(id,{status:'RECORDING'})
        }
        this.waitingRoom.push({id: id,recordingBot: recordingBot})
        return result
    }

    public async stop(id:number){
        this.waitingRoom.forEach((el)=>{
            systemLogger.debug(`録音停止 => id:${id}`)
            if(el.id === id) el.recordingBot.stop()
            this.timetableOverWriter.run(id,{status:'DEFAULT'})
        })
    }
}