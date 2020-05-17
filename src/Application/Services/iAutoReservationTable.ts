export default interface iAutoReservationTable{
    write(newDoc:{[key:string]:any}):void //create
    removeByGroupId(groupId:number):void
    findByGroupId(groupId:number,option:{[key:string]:any}):Promise<{[key:string]:any}>
    overwrite(groupId:number,newDoc:{[key:string]:any}):void
    findAll():Promise<{[key:string]:any}>
    update(query:{[key:string]:any},update:{[key:string]:any}):void
}