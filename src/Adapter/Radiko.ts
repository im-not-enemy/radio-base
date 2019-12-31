import request from 'request-promise'
import bluebird from 'bluebird'
import xml2js from 'xml2js'
bluebird.promisifyAll(xml2js)

import iRadiko from '../Application/TapeRecorder/iRadiko'

export default class Radiko implements iRadiko{
    private prefectureCode: string
    private token: {[key:string]:string} ={}
    
    constructor (prefectureCode:string){
        this.prefectureCode = prefectureCode
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

    public async auth():Promise<string>{
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
        const response02 = await request(options);
        if (response02.statusCode !== 200) throw new Error('Authentication failure') 
        return this.token.xRadikoAuthtoken
    }

    public async getStationsRawInfo():Promise<{[key:string]:any}>{
        const url = `http://radiko.jp/v3/station/list/${this.prefectureCode}.xml` 
        const stationsXml = await request(url)
        const stationsJson = await xml2js.parseStringPromise(stationsXml)
        return stationsJson
    }

    public async getProgramsRawInfoByDate(date:number):Promise<{[key:string]:any}>{
        const url = `http://radiko.jp/v3/program/date/${date}/${this.prefectureCode}.xml`
        const programsXml = await request(url)
        const programsJson = await xml2js.parseStringPromise(programsXml)
        return programsJson
    }
}