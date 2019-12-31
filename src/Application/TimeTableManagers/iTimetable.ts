export default interface iTimetable{
    write(newDoc:{[key:string]:any}):void //create
    erase():void //delete
    find(query:{[key:string]:any},option:{[key:string]:any}):{[key:string]:any} //read

    overwrite(id:number,newDoc:{[key:string]:any}):void
    countByDate(date:number):Promise<number>
    findById(id:number,option:{[key:string]:any}):Promise<{[key:string]:any}>
    findByStatus(status:string):Promise<{[key:string]:any}>
}