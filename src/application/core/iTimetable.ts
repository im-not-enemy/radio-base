export default interface iTimetable {
    reload():void
    find(document:{},option:{}):{[key:string]:any}
    findById(id:number,option:{}):{[key:string]:any}
    findByDate(date:number,option:{}):{[key:string]:any}
    findNowOnAir(option:{}):{[key:string]:any}
    recording(id:number,pid:number):void
    recorded(id:number):void
    reserved(id:number):void
    canceled(id:number):void
    downloaded(id:number):void
}