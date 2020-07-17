export default interface iFFmpeg {
    execute(station:string, duration:number, outputFileName:string, target:string):Promise<number>
}