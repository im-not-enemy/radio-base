import fs from 'fs'
import systemLogger from '../../common/logger'
import settings from '../../conf/setting'
import iRecordingProgram from './iFFmpeg'

export default class FFmpeg implements iRecordingProgram{
    private loglevel = settings.ffmpeg.loglevel
    private outputDir = settings.ffmpeg.outputDir
    private logDir = settings.ffmpeg.logDir
    private extension = settings.ffmpeg.extension

    public run(duration:number,headers:string,input:string,output:string):number{
        const {spawn} = require('child_process');
        const options = [
            '-t', duration,
            '-headers', headers,
            '-i', input,
            '-loglevel', this.loglevel,
            '-vn', `${this.outputDir}/${output}.${this.extension}`
        ]
        systemLogger.debug(`ffmpeg実行準備 => options:${options}`)
        const ffmpeg = spawn('ffmpeg',options,{
            detached: true, 
            stdio: ['ignore','ignore',fs.openSync(`${this.logDir}/${output}.log`, 'a')] 
        });
        ffmpeg.unref()
        systemLogger.debug(`ffmpeg実行完了 => ffmpeg:${JSON.stringify(ffmpeg)}`)
        return ffmpeg.pid
    }
}