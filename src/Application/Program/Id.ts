import iId from './iId'

export default class Id implements iId{
    constructor(private id:number){}
    public toString():string{
        return String(this.id)
    }
}