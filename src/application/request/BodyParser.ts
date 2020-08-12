export default class BodyParser {
    public run(body:{[key:string]:any}):{[key:string]:any}{
        const newBody:{[key:string]:any}={}
        Object.keys(body).forEach((key)=>{
            if (key === 'date' || key === 'startTime' || key === 'endTime' || key === 'dayOfWeek'){
                newBody[key] = body[key]
            } else {
                newBody[key] = new RegExp(body[key])
            }
        })
        return newBody
    }
}