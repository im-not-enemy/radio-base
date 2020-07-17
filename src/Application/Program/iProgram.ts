export default interface iProgram {
    canStartRecording():{[key:string]:any}
    canStartReservation():{[key:string]:any}
    canCancelReservation():{[key:string]:any}
    calculateDuration():number
    toStringStation():string
    toStringTitle():string
    toStringStartTime():string
    toObjectStartTime():{[key:string]:any}
    toStringId():string
    toStringSrc():string
}