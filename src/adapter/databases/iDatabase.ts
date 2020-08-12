export default interface iDatabase {
    insert(document:{}):any
    count(document:{}):Promise<number>
    find(document:{},option:{}):Promise<{[key:string]:any}>
    remove(document:{}):any
    update(id:number,newDocument:{}):void
    increment(id:number,newDocument:{}):void
}