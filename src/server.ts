import express from 'express';
import Timetable from './Adapter/Timetable'
const settings = require('../conf/settings.json')

import RequestQueryParser from './Application/Request/RequestQueryParser'
import RequestBodyParser from './Application/Request/RequestBodyParser'
import Radiko from './Adapter/Radiko'
import Time from './Application/Program/Time'
import TimetableOverWriter from './Application/TimeTableManagers/TimetableOverWriter'
import NodeScheduler from './Application/ScheduleManagers/NodeScheduler'
import ScheduleNote from './Adapter/ScheduleNote'
import ReservationService from './Application/Services/ReservationService'
import RecordingService from './Application/Services/RecordingService'
import TimetableUpdater from './Application/TimeTableManagers/TimetableUpdater'
import systemLogger from './Adapter/Logger'

const requestQueryParser = new RequestQueryParser()
const requestBodyParser = new RequestBodyParser()
const scheduleNote = new ScheduleNote()
const nodeScheduler = new NodeScheduler(scheduleNote)
const timetable = new Timetable()
const radiko = new Radiko('JP11')
const timetableOverWriter = new TimetableOverWriter(timetable)
const reservationService = new ReservationService(timetable,scheduleNote)
const recordingService = new RecordingService(timetable)

const app = express()
const port = 3000

app.use(express.json())

app.get('/',(req,res)=>res.send('Hello world!'))

app.get('/timetable/_search',async(req,res)=>{
    const query = requestBodyParser.run(req.body)
    const option = requestQueryParser.run(req.query)
    const result = await timetable.find(query,option)
    res.send(result)
})

app.get('/timetable/:id',async(req,res)=>{
    const option = requestQueryParser.run(req.query)
    const result = await timetable.findById(parseInt(req.params.id),option)
    result.length === 0
    ? res.sendStatus(404) 
    : res.send(result)
})

app.post('/timetable/:id/_recording',async(req,res)=>{
    const result = await recordingService.start(parseInt(req.params.id))
    if(result.succeed === true){
        res.sendStatus(200)
    } else {
        res.status(422).send(result.reason)
    }
})

app.delete('/timetable/:id/_recording',async(req,res)=>{
    recordingService.stop(parseInt(req.params.id))
    res.sendStatus(200)
})

app.post('/timetable/:id/_reservation',async(req,res)=>{
    const result = await reservationService.register(parseInt(req.params.id))
    if (result.succeed === true){
        res.sendStatus(200)
    } else {
        res.status(422).send(result.reason)
    }
})

app.delete('/timetable/:id/_reservation',async(req,res)=>{
    const result = await reservationService.cancel(parseInt(req.params.id))
    if (result.succeed === true){
        res.sendStatus(200)
    } else {
        res.status(422).send(result.reason)
    }
})

app.listen(port, () => systemLogger.info(`サーバー起動 => port:${port}`))


//////// 起動処理 ////////
const start = async():Promise<void> => {
    systemLogger.info('起動処理開始')
    const inactiveJobs = await scheduleNote.readAll()
    inactiveJobs.forEach(async(el:any)=>{
        systemLogger.debug(`予約済み番組検出。予約ジョブ再読み込み => id:${el.id}`)
        scheduleNote.erase(el.id)
        await reservationService.cancel(el.id)
        await reservationService.register(el.id)
    })
}
start()

//////// 定刻処理 ////////
const everySixAm = () => {
    systemLogger.info(`定刻処理開始。番組表更新`)
    const timetableUpdater = new TimetableUpdater(timetable, radiko)
    timetableUpdater.run()
}
const everyMinutes = async():Promise<void> => {
    //DB検索: 録音中番組があるか > 録音中番組の放送終了時間は過ぎているか > ステータスをRECORDEDに変更
    const recordingPrograms = await timetable.findByStatus('RECORDING')
    recordingPrograms.forEach(async(el:{id:number})=>{
        systemLogger.debug(`録音中番組検出 => id:${el.id}`)
        const source = await timetable.findById(el.id,{})
        const endTime = new Time(source[0].endTime)
        if (endTime.isPast()) {
            systemLogger.debug(`録音完了番組検出 => id:${el.id} => newStatus:RECORDED`)
            timetableOverWriter.run(el.id,{status:'RECORDED'})
        }
    })
}

nodeScheduler.activate({hour:6},everySixAm)
nodeScheduler.activate({second:0},everyMinutes)
