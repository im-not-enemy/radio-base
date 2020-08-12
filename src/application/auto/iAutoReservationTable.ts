export default interface iAutoReservationTable {
    isDuplicate(hash:string):Promise<boolean>
    register(document:{[key:string]:any}):void
    show(id?:number):Promise<{[key:string]:any}>
    remove(id:number):void
    update(id:number,document:{[key:string]:any}):void
}