export default class RequestBodyParser {
    public run(body:{[key:string]:any}):{[key:string]:any}{
        const newBody:{[key:string]:any}={}
        Object.keys(body).forEach((key)=>{
            newBody[key] = new RegExp(body[key])
        })
        return newBody
    }
}