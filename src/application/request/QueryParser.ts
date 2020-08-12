export default class QueryParser {
    public run(query:{[key:string]:any}):{[key:string]:any}{
        const nedbOption:{[key:string]:any} = {'_id':0}
        if (query.fields) {
            const fields:Array<string> = query.fields.split(',')
            fields.forEach((el)=>{nedbOption[el]=1})
        }
        return nedbOption
    }
}