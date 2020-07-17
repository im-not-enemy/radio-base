import TimeTable from './iTimetable'
import Radiko from '../TapeRecorder/iRadiko'
import Rajiru from '../TapeRecorder/iRajiru'
import moment from 'moment'
import systemLogger from '../../Adapter/Logger'

export default class TimetableUpdater {
    constructor(private timetable: TimeTable, private radiko: Radiko, private rajiru: Rajiru) { }
    public async run():Promise<void> {
        // 一週間の日付を確認
        // 足りない情報があるか？
        // あれば補完
        // radiko.jpの時刻表を見る
        // 必要な情報を抽出する
        // 時刻表に書き込む
        const newPrograms:Array<{[key:string]:any}> = []

        for (let i=-1; i<7; i++){
            let date = parseInt(moment(new Date()).add(i, 'd').format('YYYYMMDD'))
            if (await this.timetable.count(date,"radiko") === 0) {
                systemLogger.debug(`番組表ダウンロード[radiko] => ${date}`)
                const radikoProgramsRawInfo = await this.radiko.getProgramsRawInfoByDate(date)
                                              .catch((err)=>{
                                                  systemLogger.error(err.statusCode,err.options.uri)
                                              })

                if (!radikoProgramsRawInfo){
                    systemLogger.error("programsRawInfo is undefined (radiko)")
                    break;
                }
                radikoProgramsRawInfo.radiko.stations[0].station.forEach((station: any) => {
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
                            newProgram.info = program.info[0]
                            newProgram.desc = program.desc[0]
                            newProgram.performer = program.pfm[0]
                            newProgram.url = program.url[0]
                            newProgram.img = program.img[0]
                            newProgram.timer = program.$.ft.slice(-6)
                            newProgram.favorite = false
                            newProgram.downloaded = 0
                            newProgram.src = "radiko"
                            newPrograms.push(newProgram)
                        })
                    })
                })
            }

            if (await this.timetable.count(date,"rajiru") === 0) {
                const dateString = moment().add(i+1,'d').format('YYYY-MM-DD')
                systemLogger.debug(`番組表ダウンロード[rajiru] => ${dateString}`)
                const rajiruProgramsRawInfo = await this.rajiru.getProgramsRawInfoByDate(dateString)

                if (!rajiruProgramsRawInfo){
                    systemLogger.error("programsRawInfo is undefined (rajiru)")
                    break;
                }

                rajiruProgramsRawInfo.forEach((program:any)=>{
                    const startTime = moment(program.start_time)
                    const endTime = moment(program.end_time)
                    const timer = endTime.diff(startTime,'seconds')
                    const newProgram = {
                        id: parseInt(program.id),
                        title: program.title,
                        station: "JOAK-R2",
                        status: "DEFAULT",
                        date: parseInt(startTime.format('YYYYMMDD')),
                        dayOfWeek: startTime.day(),
                        startTime: parseInt(startTime.format('YYYYMMDDHHmmss')),
                        endTime: parseInt(endTime.format('YYYYMMDDHHmmss')),
                        info: program.subtitle,
                        desc: "",
                        performer: program.act,
                        url: "",
                        img: program.service.logo_m.url,
                        timer: timer,
                        favorite: false,
                        downloaded: 0,
                        src: "rajiru"
                    }
                    newPrograms.push(newProgram)
                })
            }
        }
        this.timetable.write(newPrograms)
    }
}