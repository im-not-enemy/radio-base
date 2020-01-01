import {exec} from 'child_process'

export default class DirectoryMaker {
    public run(directories:Array<string>):void{
        const directoriesString = `${directories.toString()}`
        exec(`mkdir -p ${directoriesString.replace(',',' ')}`)
    }
}