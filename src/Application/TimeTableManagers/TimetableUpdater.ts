import TimeTable from './iTimetable'
import Radiko from '../TapeRecorder/iRadiko'
import moment from 'moment'
import md5 from 'md5'
import systemLogger from '../../Adapter/Logger'

export default class TimetableUpdater {
    constructor(private timetable: TimeTable, private radiko: Radiko) { }
    public async run():Promise<void> {
        // 一週間の日付を確認
        // 足りない情報があるか？
        // あれば補完
        // radiko.jpの時刻表を見る
        // 必要な情報を抽出する
        // 時刻表に書き込む
        const newPrograms:Array<{[key:string]:any}> = []
        for (let i=0; i<7; i++){
            const date = parseInt(moment(new Date()).add(i, 'd').format('YYYYMMDD'))
            if (await this.timetable.countByDate(date) === 0) {
                systemLogger.debug(`番組表ダウンロード => ${date}`)
                const programsRawInfo = await this.radiko.getProgramsRawInfoByDate(date)
                programsRawInfo.radiko.stations[0].station.forEach((station: any) => {
                    station.progs.forEach((programs: any) => {
                        programs.prog.forEach((program: any) => {
                            let newProgram: { [key: string]: any } = {}
                            newProgram.id = parseInt(program.$.id)
                            newProgram.title = program.title[0]
                            newProgram.station = station.$.id
                            newProgram.status = 'DEFAULT'
                            newProgram.date = parseInt(programs.date[0])
                            newProgram.dayOfWeek = moment(newProgram.date, 'YYYYMMDD').day()
                            newProgram.startTime = parseInt(program.$.ft)
                            newProgram.endTime = parseInt(program.$.to)
                            newProgram.groupId = md5(`${newProgram.station}-${newProgram.title}-${String(newProgram.startTime).substr(-6, 6)}`)
                            newProgram.info = program.info[0]
                            newProgram.desc = program.desc[0]
                            newProgram.performer = program.pfm[0]
                            newProgram.url = program.url[0]
                            newProgram.img = program.img[0]
                            newPrograms.push(newProgram)
                        })
                    })
                })
            }
        }
        this.timetable.write(newPrograms)
        // 一週間以上更新されていない情報を削除
    }
}