export default interface iTimer{
    set(programId:number,time:number,func:any):void
    unset(programId:number):void
}