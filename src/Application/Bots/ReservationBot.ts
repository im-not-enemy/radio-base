import Program from '../Program/iProgram'
import NodeScheduler from '../ScheduleManagers/iNodeScheduler'
import Timetable from '../TimeTableManagers/iTimetable'
import RecordingService from '../Services/RecordingService'

export default class ReservationBot {
    constructor(private program:Program, private nodeScheduler:NodeScheduler,private timetable:Timetable){}
    
    public register():{[key:string]:any}{
        const requestRecording = async() => {
            const id = parseInt(this.program.toStringId())
            const recordingService = new RecordingService(this.timetable)
            const delay = 15000
            new Promise((res,err) => setTimeout(()=>{recordingService.start(id)},delay))
        }
        //開始可否判定
        const result = this.program.canStartReservation()
        if (result.succeed === false) return result
        //録音ジョブ登録
        const rule = this.program.toObjectStartTime()
        const jobInfo = this.nodeScheduler.activate(rule,requestRecording,true)
        jobInfo.id = parseInt(this.program.toStringId())
        //録音ジョブ永続化
        this.nodeScheduler.persist(jobInfo)
        return result
    }

    public cancel():{[key:string]:any}{
        //開始可否判定
        const result = this.program.canCancelReservation()
        if (result.succeed === false) return result
        //録音ジョブキャンセル
        this.nodeScheduler.deactivate(parseInt(this.program.toStringId()))
        return result
    }
}