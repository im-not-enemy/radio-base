export default interface iRajiru {
    getProgramsRawInfoByDate(date:string):Promise<{[key:string]:any}>
}