export default interface iTapeRecorder {
    tuneTo(station:string):void
    setTimer(duration:number):void
    writeNameToTape(name:string):void
    pushStartButton():Promise<void>
    pushStopButton():boolean
}