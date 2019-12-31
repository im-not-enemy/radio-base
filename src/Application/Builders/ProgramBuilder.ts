import Id from '../Program/Id'
import Station from '../Program/Station'
import Title from '../Program/Title'
import Time from '../Program/Time'
import Status from '../Program/Status';
import Program from '../Program/Program'

export default class ProgramBuilder {
    public run(source:{[key:string]:any}):Program{
        const id = new Id(source.id)
        const station = new Station(source.station)
        const title = new Title(source.title)
        const status = new Status(source.status)
        const startTime = new Time(source.startTime)
        const endTime = new Time(source.endTime)
        return new Program(id, station, title, status, startTime, endTime)
    }
}