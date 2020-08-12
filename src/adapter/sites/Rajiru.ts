import iSite from './iSite'
import axios from 'axios'
import settings from '../../conf/setting'
import moment from 'moment'
import systemLogger from '../../common/logger'
import bluebird from 'bluebird'
import xml2js from 'xml2js'
bluebird.promisifyAll(xml2js)

export default class Rajiru implements iSite {
    private siteId:string = "rajiru"
    private area = settings.sites[1].area
    private apiKey = settings.sites[1].apiKey
    private channels = ["r1","r2","r3"]

    public getSiteId():string{
        return this.siteId
    }
    public async getToken():Promise<string>{
        return ""
    }
    public async getPlaylist(program:any):Promise<string>{
        const res = await axios.get('https://www.nhk.or.jp/radio/config/config_web.xml')
        const xml = res.data
        const js = await xml2js.parseStringPromise(xml)
        const japanHls = js.radiru_config.stream_url[0].data
        const tokyoHls = japanHls.find((hls:any) => hls.areakey[0] === this.area)
        if (program.station === "JOAK-R1") return tokyoHls.r1hls[0]
        if (program.station === "JOAK-R2") return tokyoHls.r2hls[0]
        if (program.station === "JOAK-R3") return tokyoHls.fmhls[0]
        throw Error("playlist not found.")
    }
    public async getHeaders():Promise<string>{
        return `"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36"\r\n`
    }
    public async getStations():Promise<{[key:string]:any}>{
        return [
            {
                id: "JOAK-R1",
                name: "NHKラジオ第1",
                logo: "https://www.nhk.or.jp/common/img/media/r1-200x100.png",
                site: this.siteId
            },
            {
                id: "JOAK-R2",
                name: "NHKラジオ第2",
                logo: "https://www.nhk.or.jp/common/img/media/r2-200x100.png",
                site: this.siteId
            },
            {
                id: "JOAK-R3",
                name: "NHKラジオFM",
                logo: "https://www.nhk.or.jp/common/img/media/fm-200x100.png",
                site: this.siteId
            },

        ]
    }
    public async getProgramsByDates(dates:Array<number>):Promise<{[key:string]:any}>{
        const newPrograms = new Array()
        for (let i=0; i<dates.length; i++){
            const date = moment(dates[i].toString()).format('YYYY-MM-DD')
            let url:string
            let res:{[key:string]:any}
            for (let j=0; j<this.channels.length; j++){
                url = `https://api.nhk.or.jp/v2/pg/list/${this.area}/${this.channels[j]}/${date}.json?key=${this.apiKey}`
                try {
                    res = await axios.get(url)
                    systemLogger.debug(`番組表取得成功 => ${dates[i]}:${this.channels[j]}`)
                }
                catch (e) {
                    systemLogger.error(`番組表取得失敗 => ${dates[i]}:${this.channels[j]}`)
                    //systemLogger.error(e)
                    break;
                }
                res.data.list[`${this.channels[j]}`].forEach((program:any)=>{
                    const startTime = moment(program.start_time)
                    const endTime = moment(program.end_time)
                    const newProgram = {
                        id: parseInt(program.id),
                        title: program.title,
                        station: `JOAK-${this.channels[j].toUpperCase()}`,
                        status: "DEFAULT",
                        date: parseInt(startTime.format('YYYYMMDD')),
                        dayOfWeek: startTime.day(),
                        startTime: parseInt(startTime.format('YYYYMMDDHHmmss')),
                        endTime: parseInt(endTime.format('YYYYMMDDHHmmss')),
                        start: {
                            date: String(startTime.format('YYYYMMDD')),
                            time: String(startTime.format('HHmmss'))
                        },
                        end: {
                            date: String(endTime.format('YYYYMMDD')),
                            time: String(endTime.format('HHmmss'))
                        },
                        info: program.subtitle,
                        desc: "",
                        performer: program.act,
                        url: "",
                        img: program.service.logo_m.url,
                        downloaded: 0,
                        site: "rajiru",
                        recording: {
                            pid: undefined
                        }
                    }
                    newPrograms.push(newProgram)
                })
            }
        }
        return newPrograms
    }
}