export default interface iFFmpeg {
    execute(station:string, duration:number, outputFileName:string):Promise<number>
}