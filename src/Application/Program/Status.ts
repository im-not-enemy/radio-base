import iStatus from './iStatus'

export default class Status implements iStatus{
    private statusList:Array<string> = ['DEFAULT','RECORDING','RECORDED','RESERVED','ERROR']
    constructor(private status:string){
        if (!this.statusList.includes(status)) throw new Error() 
    }
    public isDefault():boolean{
        return this.status === 'DEFAULT'
    }
    public isRecording():boolean{
        return this.status === 'RECORDING'
    }
    public isRecorded():boolean{
        return this.status === 'RECORDED'
    }
    public isReserved():boolean{
        return this.status === 'RESERVED'
    }
    public isError():boolean{
        return this.status === 'ERROR'
    }
}