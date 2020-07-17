export default interface iTapeRecorder {
    tuneTo(station:string):void
    setTimer(duration:number):void
    writeNameToTape(name:string):void
    pushStartButton(target:string):Promise<void>
    pushStopButton():boolean
}