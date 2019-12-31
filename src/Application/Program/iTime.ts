export default interface iTime {
    isPast():boolean
    calclateDuration():number
    toObject():{[key:string]:string}
    toString():string
}