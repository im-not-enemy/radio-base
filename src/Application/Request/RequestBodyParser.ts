export default class RequestBodyParser {
    public run(body:{[key:string]:any}):{[key:string]:any}{
        const newBody:{[key:string]:any}={}
        Object.keys(body).forEach((key)=>{
            if (key === 'date' || 'startTime' || 'endTime' || 'dayOfWeek'){
                newBody[key] = body[key]
            } else {
                newBody[key] = new RegExp(body[key])
            }
        })
        console.log(newBody)
        return newBody
    }
}