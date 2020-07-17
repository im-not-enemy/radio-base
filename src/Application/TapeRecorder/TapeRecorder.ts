import FFmpeg from './iFFmpeg'
import iTapeRecorder from './iTapeRecorder'

export default class TapeRecorder implements iTapeRecorder{
    private station:string = ''
    private duration:number = 0
    private tape:string = ''
    private pid:number | undefined

    constructor(private ffmpeg:FFmpeg){}

    public tuneTo(station:string):void{
        //放送局名取得
        this.station = station
    }
    public setTimer(duration:number):void{
        //duration設定
        this.duration = duration
    }
    public writeNameToTape(name:string):void{
        //ファイル名登録
        this.tape = name
    }
    public async pushStartButton(target:string):Promise<void>{
        //ffmpeg実行
        this.pid = await this.ffmpeg.execute(this.station, this.duration, this.tape, target)
    }
    public pushStopButton():boolean{
        if (!this.pid) return false
        try {
            process.kill(this.pid,0)
            process.kill(this.pid)
            return true
        }catch(e){
            return false
        }
    }
}