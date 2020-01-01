import {execSync} from 'child_process'

export default class EnvironmentChecker {
    public run():{[key:string]:any}{
        if (this.isExsists('ffmpeg') === false) return {succeed:false,reason:'ffmpeg is required.'}
        if (!this.isExsists('timedatectl')) return {succeed:false,reason:'timedatectl is required.'}
        if (!this.timezoneIs('Asia/Tokyo')) return {succeed:false,reason:'Timezone needs to be Asia/Tokyo'}
        return {succeed:true}
    }
    private isExsists(command:string):boolean{
        const exists = execSync(`which ${command} > /dev/null ; echo $?| tr -d \\\\n`,{encoding:'utf-8'})
        if (parseInt(exists) === 0) return true
        return false
    }
    private timezoneIs(timezone:string):boolean{
        const currentTimezone = execSync('timedatectl | awk \'/Time zone/{print $3}\' | tr -d \\\\n',{encoding:'utf-8'})
        if (currentTimezone === timezone) return true
        return false
    }
}