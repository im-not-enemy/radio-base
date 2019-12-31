import Program from '../Program/iProgram'
import RecoringBot from './iRecordingBots'
import NodeScheduler from '../ScheduleManagers/iNodeScheduler'

export default class ReservationBot {
    constructor(private program:Program, private nodeScheduler:NodeScheduler, private recordingBot?:RecoringBot){}

    public register():{[key:string]:any}{
        if (!this.recordingBot) return {succeed:false,reason:'RecordingBot required.'}
        //開始可否判定
        const result = this.program.canStartReservation()
        if (result.succeed === false) return result
        //録音ジョブ登録
        const rule = this.program.toObjectStartTime()
        const jobInfo = this.nodeScheduler.activate(rule,this.recordingBot.start,true)
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