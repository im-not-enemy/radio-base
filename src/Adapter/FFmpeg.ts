import fs from 'fs'
import Radiko from '../Application/TapeRecorder/iRadiko'
import iFFmpeg from '../Application/TapeRecorder/iFFmpeg'

export default class FFmpeg implements iFFmpeg{
    constructor(private radiko:Radiko, private outputDir:string, private logDir:string){}

    public async execute(station:string, duration:number, outputFileName:string):Promise<number>{
        const output = `${this.outputDir}/${outputFileName}.aac`
        const log = `${this.logDir}/${outputFileName}.log`

        const {spawn} = require('child_process');
        const options = [
            '-t', duration,
            '-headers', `X-Radiko-AuthToken: ${await this.radiko.auth()}\r\n`,
            '-i', `http://f-radiko.smartstream.ne.jp/${station}/_definst_/simul-stream.stream/playlist.m3u8`,
            '-loglevel', 'info',
            '-vn', output
        ]
        const ffmpeg = spawn('ffmpeg',options,{
            detached: true, 
            stdio: ['ignore','ignore',fs.openSync(`${log}`, 'a')] 
        });
        ffmpeg.unref()
        return ffmpeg.pid
    }
}