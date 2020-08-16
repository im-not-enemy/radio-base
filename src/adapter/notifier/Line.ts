import settings from '../../conf/setting'
import axios from 'axios'
import qs from 'querystring'
import Content from './Content'
const line = require('@line/bot-sdk')


export default class Line {
    private token:string = settings.notifier.line.token

    private notify(message:string){
        const data = qs.stringify({message: message})
        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${this.token}`
            }
        }
        axios.post('https://notify-api.line.me/api/notify',data,config).then().catch((e)=>console.log(e.message))
    }

    public notifyRecommend(programs:any){
        const client = new line.Client({channelAccessToken: settings.notifier.line.token});
        const content = new Content()
        const message = {
            "type": "flex",
            "altText": "おすすめ",
            "contents": content.createCarousel(programs)
        }
        client.pushMessage(settings.notifier.line.destination, message).catch((err:any) => {console.log(err)});
    }
    public async notifyReorded(program:{[key:string]:any}){
        const client = new line.Client({channelAccessToken: settings.notifier.line.token});
        const content = new Content()
        const message = {
            "type": "flex",
            "altText": "録音完了",
            "contents": content.createFullBubble(program)
        }
        client.pushMessage(settings.notifier.line.destination, message).catch((err:any) => {console.log(err)});
    }
}