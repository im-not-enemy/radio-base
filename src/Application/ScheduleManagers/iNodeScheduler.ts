export default interface iNodeScheduler {
    activate(rule:any,func:any,persistente:boolean):{[key:string]:any}
    deactivate(id:number):{[key:string]:any}
    persist(jobInfo:{[key:string]:any}):void
}