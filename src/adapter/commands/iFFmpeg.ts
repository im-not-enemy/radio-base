export default interface RecordingProgram {
    run(duration:number,headers:string,input:string,output:string):number
}