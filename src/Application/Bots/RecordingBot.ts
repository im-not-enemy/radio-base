import Program from '../Program/iProgram'
import Radiko from '../../Adapter/Radiko'
import FFmpeg from '../../Adapter/FFmpeg'
import TapeRecorder from '../TapeRecorder/TapeRecorder'

export default class RecordingBot {
    private settings = require('../../../conf/settings.json').directories
    private radiko = new Radiko('JP11')
    private ffmpeg = new FFmpeg(this.radiko, this.settings.outputDir, this.settings.logDir)
    private tapeRecorder = new TapeRecorder(this.ffmpeg) 

    constructor(private program:Program){}

    public async start():Promise<{[key:string]:any}>{
        const delay = 15
        const result = this.program.canStartRecording()
        if (result.succeed === false) return result
        this.tapeRecorder.tuneTo(this.program.toStringStation())
        this.tapeRecorder.setTimer(this.program.calculateDuration()+delay)
        this.tapeRecorder.writeNameToTape(`${this.program.toStringStation()}_${this.program.toStringTitle()}_${this.program.toStringStartTime()}`)
        await this.tapeRecorder.pushStartButton()
        return result
    }
    public stop():void{
        this.tapeRecorder.pushStopButton()
    }
}