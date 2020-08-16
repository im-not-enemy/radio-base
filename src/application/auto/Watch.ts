import iWatchTable from './iWatchTable'
import iTimetable from '../core/iTimetable'
import systemLogger from '../../common/logger'

import Line from '../../adapter/notifier/Line'

export default class Watch {
    constructor(private watchTable:iWatchTable, private timetable:iTimetable){}

    public register(word:string){
        this.watchTable.register(word)
    }
    public update(id:number,word:string){
        this.watchTable.update(id,word)
    }
    public cancel(id:number){
        this.watchTable.cancel(id)
    }
    public async show(){
        return await this.watchTable.show()
    }
    private createCondition(words:Array<string>){
        const condition = new Array()
        words.forEach(word => {
            condition.push(
                {title: new RegExp(word,'i')},
                {info: new RegExp(word,'i')},
                {desc: new RegExp(word,'i')},
                {performer: new RegExp(word,'i')},
            )
        });
        return condition
    }
    public async dryrun(){
        return this.run(true)
    }
    public async run(dryrun?:boolean){
        const res = await this.watchTable.show()
        let words = new Array()
        res.forEach((el:{[key:string]:any}) => {
            words.push(el.word)
        });
        const condition = this.createCondition(words)
        const programs = await this.timetable.find({$or:condition,status:'DEFAULT'},{})
        if (!dryrun) new Line().notifyRecommend(programs)
        return programs
    }
}