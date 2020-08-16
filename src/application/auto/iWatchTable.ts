export default interface iWatchTable {
    register(word:string):void
    update(id:number,word:string):void
    cancel(id:number):void
    show():Promise<{[key:string]:any}>
}