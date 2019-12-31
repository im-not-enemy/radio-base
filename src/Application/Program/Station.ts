import iStation from './iStation'

export default class Station implements iStation{
    constructor(private station:string){}
    public toString():string{
        return this.station
    }
}