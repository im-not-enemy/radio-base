import express from 'express';
import Timetable from './Adapter/Timetable'
import AutoReservationTable from './Adapter/AutoReservationTable'
const settings = require('../conf/settings.json')

import RequestQueryParser from './Application/Request/RequestQueryParser'
import RequestBodyParser from './Application/Request/RequestBodyParser'
import Radiko from './Adapter/Radiko'
import Time from './Application/Program/Time'
import TimetableOverWriter from './Application/TimeTableManagers/TimetableOverWriter'
import NodeScheduler from './Application/ScheduleManagers/NodeScheduler'
import ScheduleNote from './Adapter/ScheduleNote'
import ReservationService from './Application/Services/ReservationService'
import FavoriteService from './Application/Services/FavoriteService'
import AutoReservationService from './Application/Services/AutoReservationService'
import RecordingService from './Application/Services/RecordingService'
import TimetableUpdater from './Application/TimeTableManagers/TimetableUpdater'
import systemLogger from './Adapter/Logger'
import EnvironmentChecker from './Application/Server/EnvironmentChecker'
import DirectoryMaker from './Application/Server/DirectoryMaker'
import moment from 'moment'
import cors from 'cors'
import fs from 'fs'

const requestQueryParser = new RequestQueryParser()
const requestBodyParser = new RequestBodyParser()
const scheduleNote = new ScheduleNote()
const nodeScheduler = new NodeScheduler(scheduleNote)
const timetable = new Timetable()
const autoReservationTable = new AutoReservationTable()
const radiko = new Radiko('JP11')
const timetableOverWriter = new TimetableOverWriter(timetable)
const reservationService = new ReservationService(timetable,scheduleNote)
const recordingService = new RecordingService(timetable)
const favoriteService = new FavoriteService(timetable)
const autoReservationService = new AutoReservationService(timetable,autoReservationTable,reservationService)
const environmentChecker = new EnvironmentChecker()
const directoryMaker = new DirectoryMaker()

const preCheckResult = environmentChecker.run()
if (!preCheckResult.succeed) throw new Error(preCheckResult.reason)
directoryMaker.run(Object.values(settings.directories))

const app = express()
const port = 3000

app.use(express.json())
app.use(cors())

app.get('/',(req,res)=>res.send('Hello world!'))

app.get('/stations',async(req,res)=>{
    res.send(await radiko.getStationsRawInfo())
})

app.get('/timetable',async(req,res)=>{
    const now = moment(new Date()).format('YYYYMMDDHHmmss')
    const option = requestQueryParser.run(req.query)
    const result = await timetable.find({$not:{$and:[{endTime:{$lt:parseInt(now)}},{status:'DEFAULT'}]}},option)
    res.send(result)
})

app.get('/timetable/nowOnAir',async(req,res)=>{
    const now = moment(new Date()).format('YYYYMMDDHHmmss')
    const option = requestQueryParser.run(req.query)
    const result = await timetable.find({$and:[{startTime:{$lt:parseInt(now)}},{endTime:{$gt:parseInt(now)}}]},option)
    res.send(result)
})

app.post('/timetable/_search',async(req,res)=>{
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

app.post('/timetable/:id/_favorite',async(req,res)=>{
    favoriteService.mark(parseInt(req.params.id))
    res.sendStatus(200)
})

app.delete('/timetable/:id/_favorite',async(req,res)=>{
    favoriteService.unmark(parseInt(req.params.id))
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

app.post('/timetable/:id/_autoReservation',async(req,res)=>{
    await autoReservationService.register(parseInt(req.params.id),req.body)
    autoReservationService.run()
    res.sendStatus(200)
})
app.put('/timetable/:id/_autoReservation',async(req,res)=>{
    await autoReservationService.update(parseInt(req.params.id),req.body)
    autoReservationService.run()
    res.sendStatus(200)
})
app.get('/timetable/:id/_autoReservation',async(req,res)=>{
    const result = await autoReservationService.showSetting(parseInt(req.params.id))
    res.send(result)
})
app.delete('/timetable/:id/_autoReservation',async(req,res)=>{
    autoReservationService.cancel(parseInt(req.params.id))
    res.sendStatus(200)
})

app.get('/audio/:id/_download',async(req,res)=>{
    const data = await timetable.findById(parseInt(req.params.id),{station:1,title:1,startTime:1})
    const file = `${data[0].station}_${data[0].title}_${data[0].startTime}.aac`
    const fullPath = `${__dirname}/../${settings.directories.outputDir}/${file}`
    res.download(fullPath)
})

app.delete('/audio/:id',async(req,res)=>{
    const data = await timetable.findById(parseInt(req.params.id),{station:1,title:1,startTime:1})

    if (data.length === 0){
        res.sendStatus(404) 
    } else {
        const file = `${data[0].station}_${data[0].title}_${data[0].startTime}.aac`
        const fullPath = `${__dirname}/../${settings.directories.outputDir}/${file}`
        fs.unlink(fullPath,(err)=>{
            if (err){
                systemLogger.error(err?.message)
                res.sendStatus(500)
            } else {
                timetable.removeById(parseInt(req.params.id))
                res.sendStatus(200)
            }
        })
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
everySixAm()

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
            if (settings.notify.excute){
                const {exec} = require('child_process');
                exec(`${settings.notify.command} '${JSON.stringify(source[0])}'`)
            }
        }
    })
}
const everyHours = async():Promise<void> => {
    autoReservationService.run()
}
everyHours()

nodeScheduler.activate({hour:6,minute:0,second:0},everySixAm)
nodeScheduler.activate({second:0},everyMinutes)
nodeScheduler.activate({minute:0,second:0},everyMinutes)
