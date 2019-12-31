export default interface iRadiko {
    auth():Promise<string>
    getStationsRawInfo():Promise<{[key:string]:any}>
    getProgramsRawInfoByDate(date:number):Promise<{[key:string]:any}>
}