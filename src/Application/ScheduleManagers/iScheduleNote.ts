export default interface iScheduleNote {
    write(newDoc:{[key:string]:any}):void
    readAll():Promise<{[key:string]:any}>
    erase(id:number):Promise<void>
    findById(id:number):Promise<{[key:string]:any}>
}