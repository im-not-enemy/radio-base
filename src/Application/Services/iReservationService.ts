export default interface iReservationService {
    register(id:number):Promise<{[key:string]:any}>
    cancel(id:number):Promise<{[key:string]:any}>
}