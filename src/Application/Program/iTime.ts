export default interface iTime {
    isPast():boolean
    calclateDuration():number
    toObject():{[key:string]:number}
    toString():string
}