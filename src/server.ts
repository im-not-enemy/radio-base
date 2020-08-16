import express from 'express';
import systemLogger from './common/logger'
import moment from 'moment'
import settings from './conf/setting'
import NeDB from './adapter/databases/NeDB'
import Timetable from './application/core/Timetable'
import Stations from './application/core/Stations'
import AutoReservationTable from './application/auto/AutoReservationTable'
import WatchTable from './application/auto/WatchTable'
import Radiko from './adapter/sites/Radiko'
import Rajiru from './adapter/sites/Rajiru'
import QueryParser from './application/request/QueryParser'
import BodyParser from './application/request/BodyParser'
import Recording from './application/core/Recording'
import Reservation from './application/core/Reservation'
import AutoReservation from './application/auto/AutoReservation'
import Watch from './application/auto/Watch'
import FFmpeg from './adapter/commands/FFmpeg'
import NodeSchedule from './adapter/schedule/NodeSchedule'
import Program from './entities/Program'
import Line from './adapter/notifier/Line'
import cors from 'cors'

const sites = new Array()
settings.sites.find((s)=>{
    if (s.enable === true){
        switch (s.name){
            case 'radiko': sites.push(new Radiko()); break
            case 'rajiru': sites.push(new Rajiru()); break
        }
    }
})
const timetable = new Timetable(new NeDB('timetable'), sites)
const stations = new Stations(new NeDB('stations'), sites)
const autoReservationTable = new AutoReservationTable(new NeDB('autoReservation'))
const watchTable = new WatchTable(new NeDB('watch'))
const nodeSchedule = new NodeSchedule();

/* -------------- 起動 -------------- */
(async()=>{
    const reservedPrograms = await timetable.find({status:"RESERVED"},{})
    systemLogger.debug(`予約済み番組: ${JSON.stringify(reservedPrograms)}`)
    reservedPrograms.forEach((program:{[key:string]:any}) => {
        const reaservatioin = new Reservation(nodeSchedule,timetable)
        reaservatioin.register(new Program(program))
    });
})()
timetable.reload()
stations.reload()

/* -------------- 定刻 -------------- */
nodeSchedule.setEveryDay(()=>{
    const watch = new Watch(watchTable,timetable)
    watch.run()
})

nodeSchedule.setEveryMinute(async()=>{
    const now = parseInt(moment().format('YYYYMMDDHHmmss'))
    const recordingPrograms = await timetable.find({status:"RECORDING"},{id:1,title:1,station:1,status:1,startTime:1,endTime:1,recording:1,_id:0})
    systemLogger.debug(`録音中番組: ${JSON.stringify(recordingPrograms)}`)
    recordingPrograms.forEach((program:{[key:string]:any}) => {
        if (program.endTime < now){
            timetable.recorded(program.id)
            systemLogger.debug(`録音完了: ${JSON.stringify(program)}`)
            new Line().notifyReorded(program)
        }
    });
})

nodeSchedule.setEveryHour(async()=>{
    const auto = new AutoReservation(timetable,autoReservationTable)
    auto.run()
})

/* -------------- Express -------------- */
const app = express()
const port = settings.express.port
const queryParser = new QueryParser()
const bodyParser = new BodyParser()

app.use(express.json())
app.use(cors())
app.listen(port, () => systemLogger.debug(`サーバー起動 => port:${port}`))

app.get('/',(req,res)=>{
    res.send('Hello world!')
})
app.get('/stations',async(req,res)=>{
    const result = await stations.get()
    result.length === 0
    ? res.sendStatus(404) 
    : res.send(result)
})
app.get('/timetable',async(req,res)=>{
    const option = queryParser.run(req.query)
    const result = await timetable.findByDate(parseInt(moment().format('YYYYMMDD')),option)
    result.length === 0
    ? res.sendStatus(404) 
    : res.send(result)
})
app.get('/timetable/nowOnAir',async(req,res)=>{
    const option = queryParser.run(req.query)
    const result = await timetable.findNowOnAir(option)
    result.length === 0
    ? res.sendStatus(404) 
    : res.send(result)
})
app.post('/timetable/_search',async(req,res)=>{
    const body = bodyParser.run(req.body)
    const option = queryParser.run(req.query)
    const result = await timetable.find(body,option)
    result.length === 0
    ? res.sendStatus(404) 
    : res.send(result)
})
app.get('/timetable/:id',async(req,res)=>{
    const option = queryParser.run(req.query)
    const result = await timetable.findById(parseInt(req.params.id),option)
    result.length === 0
    ? res.sendStatus(404) 
    : res.send(result)
})
app.post('/timetable/:id/record',async(req,res)=>{
    const id = parseInt(req.params.id)
    const src = await timetable.findById(id,{})
    const program = new Program(src[0])
    const canStart = program.canStartRecording()
    if (canStart.result){
        const site = sites.find((site) => {if (site.siteId === program.site){return site}})
        const recording = new Recording(new FFmpeg(),timetable,site)
        recording.start(program)
        res.sendStatus(200)
    }else{
        res.status(409).send(canStart.reason)
    }
})
app.delete('/timetable/:id/record',async(req,res)=>{
    const id = parseInt(req.params.id)
    const src = await timetable.findById(id,{})
    const program = new Program(src[0])
    const canStop = program.canStopRecording()
    if (canStop.result){
        const site = sites.find((site) => {if (site.siteId === program.site){return site}})
        const recording = new Recording(new FFmpeg(),timetable,site)
        recording.stop(program)
        res.sendStatus(200)
    }else{
        res.status(409).send(canStop.reason)
    }
})
app.post('/timetable/:id/reserve',async(req,res)=>{
    const id = parseInt(req.params.id)
    const src = await timetable.findById(id,{})
    const program = new Program(src[0])
    const canRegister = program.canRegisterReservation()
    timetable.reserved(program.id)
    if (canRegister.result){
        const reaservatioin = new Reservation(nodeSchedule,timetable)
        reaservatioin.register(program)
        res.sendStatus(200)
    }else{
        res.status(409).send(canRegister.reason)
    }
})
app.delete('/timetable/:id/reserve',async(req,res)=>{
    const id = parseInt(req.params.id)
    const src = await timetable.findById(id,{})
    const program = new Program(src[0])
    const canCancel= program.canCancelReservation()
    if (canCancel.result){
        const reaservatioin = new Reservation(nodeSchedule,timetable)
        reaservatioin.cancel(program)
        res.sendStatus(200)
    }else{
        res.status(409).send(canCancel.reason)
    }
})
app.post('/auto/reserve',async(req,res)=>{
    const auto = new AutoReservation(timetable,autoReservationTable)

    let result
    if (req.query.hasOwnProperty('dryrun')){
        result = await auto.register(req.body,true)
    } else {
        result = await auto.register(req.body,false)
        auto.run()
    }

    if (result.succeed){
        res.send(result.programs)
    }else{
        res.status(409).send(result.reason)
    }
    auto.run()
})
app.put('/auto/reserve/:id',async(req,res)=>{
    const auto = new AutoReservation(timetable,autoReservationTable)

    let result
    if (req.query.hasOwnProperty('dryrun')){
        result = await auto.update(parseInt(req.params.id),req.body,true)
    } else {
        result = await auto.update(parseInt(req.params.id),req.body,false)
        auto.run()
    }

    if (result.succeed){
        res.send(result.programs)
    }else{
        res.status(409).send(result.reason)
    }
})
app.get('/auto/reserve',async(req,res)=>{
    const auto = new AutoReservation(timetable,autoReservationTable)
    res.send(await auto.show())
})
app.get('/auto/reserve/:id',async(req,res)=>{
    const auto = new AutoReservation(timetable,autoReservationTable)
    res.send(await auto.show(parseInt(req.params.id)))
})
app.delete('/auto/reserve/:id',async(req,res)=>{
    const auto = new AutoReservation(timetable,autoReservationTable)
    auto.cancel(parseInt(req.params.id))
    res.sendStatus(200)
})
app.get('/auto/watch',async(req,res)=>{
    const watch = new Watch(watchTable,timetable)
    res.send(await watch.dryrun())
})
app.get('/auto/watch/word',async(req,res)=>{
    const watch = new Watch(watchTable,timetable)
    res.send(await watch.show())
})
app.post('/auto/watch/word',async(req,res)=>{
    const watch = new Watch(watchTable,timetable)
    watch.register(req.query.word)
    res.send(200)
})
app.delete('/auto/watch/word/:id',async(req,res)=>{
    const watch = new Watch(watchTable,timetable)
    watch.cancel(parseInt(req.params.id))
    res.send(200)
})
app.put('/auto/watch/word/:id',async(req,res)=>{
    const watch = new Watch(watchTable,timetable)
    watch.update(parseInt(req.params.id),req.query.word)
    res.send(200)
})
app.get('/audio/:id/download',async(req,res)=>{
    const data = await timetable.findById(parseInt(req.params.id),{station:1,title:1,startTime:1})
    const file = `${data[0].station}_${data[0].title}_${data[0].startTime}.mp3`
    const fullPath = `${__dirname}/../${settings.ffmpeg.outputDir}/${file}`
    timetable.downloaded(parseInt(req.params.id))
    res.download(fullPath)
})
app.delete('/audio/:id',async(req,res)=>{
    timetable.deleted(parseInt(req.params.id))
    res.sendStatus(200)
})