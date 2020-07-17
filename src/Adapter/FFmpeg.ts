import fs from 'fs'
import Radiko from '../Application/TapeRecorder/iRadiko'
import Rajiru from '../Application/TapeRecorder/iRajiru'
import iFFmpeg from '../Application/TapeRecorder/iFFmpeg'
import systemLogger from './Logger'
import axios from 'axios'
import bluebird from 'bluebird'
import xml2js from 'xml2js'
bluebird.promisifyAll(xml2js)

export default class FFmpeg implements iFFmpeg{
    constructor(private radiko:Radiko, private rajiru:Rajiru, private outputDir:string, private logDir:string){}

    public async execute(station:string, duration:number, outputFileName:string, target:string):Promise<number>{
        const output = `${this.outputDir}/${outputFileName}.mp3`
        const log = `${this.logDir}/${outputFileName}.log`

        const {spawn} = require('child_process');
        let options
        if (target === "radiko"){
            options = [
                '-t', duration,
                '-headers', `X-Radiko-AuthToken: ${await this.radiko.auth()}\r\n`,
                '-i', `http://f-radiko.smartstream.ne.jp/${station}/_definst_/simul-stream.stream/playlist.m3u8`,
                '-loglevel', 'info',
                '-vn', output
            ]
        } else if (target === "rajiru"){
            const res = await axios.get('https://www.nhk.or.jp/radio/config/config_web.xml')
            const xml = res.data
            const js = await xml2js.parseStringPromise(xml)
            const japanHls = js.radiru_config.stream_url[0].data
            const tokyoHls = japanHls.find((hls:any) => hls.area[0] === 'tokyo')
            const playlist = tokyoHls.r2hls[0]
            console.log(`DEGUB playlist: ${playlist}`)
            options = [
                '-t', duration,
                '-i', playlist,
                '-loglevel', 'info',
                '-vn', output
            ]
        }
        systemLogger.trace(`ffmpeg実行準備 => options:${options}`)
        const ffmpeg = spawn('ffmpeg',options,{
            detached: true, 
            stdio: ['ignore','ignore',fs.openSync(`${log}`, 'a')] 
        });
        ffmpeg.unref()
        systemLogger.trace(`ffmpeg実行完了 => ffmpeg:${JSON.stringify(ffmpeg)}`)
        return ffmpeg.pid
    }
}
