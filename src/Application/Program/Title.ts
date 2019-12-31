import iTitle from './iTitle'

export default class Title implements iTitle {
    constructor(private title:string){}
    public toString():string {
        return this.title
    }
}