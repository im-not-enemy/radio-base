export default interface iAutoReservationTable{
    write(newDoc:{[key:string]:any}):void //create
    removeBy_Id(_id:string):void
    countByTitle(title:RegExp):Promise<number>
    countByHash(hash:string):Promise<number>
    countBy_Id(_id:string):Promise<number>
    overwrite(groupId:number,newDoc:{[key:string]:any}):void
    findAll():Promise<{[key:string]:any}>
    countDuplicates(_id:string,hash:string):Promise<number>
    update(query:{[key:string]:any},update:{[key:string]:any}):void
}