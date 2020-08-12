export default interface iSite {
    getSiteId():string
    getToken():Promise<string>
    getStations():Promise<{[key:string]:any}>
    getPlaylist(program:any):Promise<string>
    getHeaders():Promise<string>
    getProgramsByDates(dates:Array<number>):Promise<{[key:string]:any}>
}