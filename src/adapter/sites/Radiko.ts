import request from 'request-promise'
import bluebird from 'bluebird'
import xml2js from 'xml2js'
bluebird.promisifyAll(xml2js)
import moment from 'moment'
import settings from '../../conf/setting'
import iSite from './iSite'
import systemLogger from '../../common/logger'

export default class Radiko implements iSite {
    private prefectureCode = settings.sites[0].prefectureCode
    private token: {[key:string]:string} ={}
    private siteId:string = "radiko"

    public getSiteId():string {
        return this.siteId
    }
    public async getPlaylist(program:any):Promise<string>{
        return `http://f-radiko.smartstream.ne.jp/${program.station}/_definst_/simul-stream.stream/playlist.m3u8`
    }
    public async getHeaders():Promise<string>{
        return `X-Radiko-AuthToken: ${await this.getToken()}\r\n`
    }
    private async setToken():Promise<void>{
        const options = {
            url: 'https://radiko.jp/v2/api/auth1',
            headers: {
                'X-Radiko-App' : 'pc_html5',
                'X-Radiko-App-Version' : '0.0.1',
                'X-Radiko-User' : 'dummy_user',
                'X-Radiko-Device' : 'pc',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36'
            },
            resolveWithFullResponse: true
        }
        const response = await request(options);
        const xRadikoAuthtoken = response.headers['x-radiko-authtoken'];
        const xRadikoKeylength = response.headers['x-radiko-keylength'];
        const xRadikoKeyoffset = response.headers['x-radiko-keyoffset'];
        const partialKey = String('bcd151073c03b352e1ef2fd66c32209da9ca0afa').substr(xRadikoKeyoffset,xRadikoKeylength);
        const partialKeyBase64 = Buffer.from(partialKey).toString('base64');
        this.token = {xRadikoAuthtoken: xRadikoAuthtoken, partialKeyBase64: partialKeyBase64}
    }

    public async getToken():Promise<string>{
        await this.setToken()
        const options = {
            url : 'https://radiko.jp/v2/api/auth2',
            headers : {
                'X-Radiko-AuthToken' : this.token.xRadikoAuthtoken,
                'X-Radiko-PartialKey' : this.token.partialKeyBase64,
                'X-Radiko-User' : 'dummy_user',
                'X-Radiko-Device' : 'pc',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36'
            },
            resolveWithFullResponse: true
        };
        const response = await request(options);
        if (response.statusCode !== 200) throw new Error('Authentication failure') 
        return this.token.xRadikoAuthtoken
    }
    public async getStations():Promise<{[key:string]:any}>{
        const url = `http://radiko.jp/v3/station/list/${this.prefectureCode}.xml` 

        const stationsXml = await request(url)
        const stationsJson = await xml2js.parseStringPromise(stationsXml)
        const origin = stationsJson.stations.station
        const stations = Array()
        for (let i=0; i<origin.length; i++){
            stations.push({
                id: origin[i].id[0],
                name: origin[i].name[0],
                logo: origin[i].logo[0]._,
                site: this.siteId
            })
        }
        return stations
    }

    public async getProgramsByDates(dates:Array<number>):Promise<{[key:string]:any}>{
        const newPrograms:Array<{[key:string]:any}> = []

        for (let i=0; i<dates.length; i++){
            const url = `http://radiko.jp/v3/program/date/${dates[i]}/${this.prefectureCode}.xml`
            let programsXml
            try {
                programsXml = await request(url)
                systemLogger.debug(`番組表取得成功 => ${dates[i]}`)
            }
            catch (e) {
                systemLogger.error(`番組表取得失敗 => ${dates[i]}`)
                //systemLogger.error(e)
                break;
            }
            const programsJson = await xml2js.parseStringPromise(programsXml)

            programsJson.radiko.stations[0].station.forEach((station: any) => {
                station.progs.forEach((programs: any) => {
                    programs.prog.forEach((program: any) => {
                        let newProgram: { [key: string]: any}  = {}
                        newProgram.id = parseInt(program.$.id)
                        newProgram.title = program.title[0]
                        newProgram.station = station.$.id
                        newProgram.status = 'DEFAULT'
                        newProgram.date = parseInt(programs.date[0])
                        newProgram.dayOfWeek = moment(newProgram.date, 'YYYYMMDD').day()
                        newProgram.startTime = parseInt(program.$.ft)
                        newProgram.endTime = parseInt(program.$.to)
                        newProgram.start = {
                            date: String(program.$.ft.slice(0,8)),
                            time: String(program.$.ft.slice(8,14))
                        },
                        newProgram.end = {
                            date: String(program.$.to.slice(0,8)),
                            time: String(program.$.to.slice(8,14))
                        }
                        newProgram.info = program.info[0]
                        newProgram.desc = program.desc[0]
                        newProgram.performer = program.pfm[0]
                        newProgram.url = program.url[0]
                        newProgram.img = program.img[0]
                        newProgram.downloaded = 0
                        newProgram.site = this.siteId
                        newProgram.recording = {pid: undefined}
                        newPrograms.push(newProgram)
                    })
                })
            })
        }
        return newPrograms
    }
}