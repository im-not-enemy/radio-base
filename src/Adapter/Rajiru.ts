import axios from 'axios'
import iRajiru from '../Application/TapeRecorder/iRajiru'

export default class Rajiru implements iRajiru{
    private apiKey = 'TxmrGTn8Ts1AYIVsfwO3ak5BAAN5ecqD'

    public async getProgramsRawInfoByDate(date:string):Promise<{[key:string]:any}> {
        const res = await axios.get(`https://api.nhk.or.jp/v2/pg/list/130/r2/${date}.json?key=${this.apiKey}`)
        return res.data.list.r2
    }
}