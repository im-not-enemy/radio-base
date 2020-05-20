const token = ''

const axios = require('axios')
const qs = require('querystring')
const program = JSON.parse(process.argv[2])

const createMessage = (program) => {
    return `
    [録音完了]
    放送局: ${program.station}
    タイトル: ${program.title}
    放送日: ${program.date}
    開始時間: ${program.date}
    終了時間: ${program.date}
    ダウンロード: http://192.168.0.7:3000/audio/${program.id}/_download
    `
}

const option = {
    url: 'https://notify-api.line.me/api/notify',
    method: 'post',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`
    },
    data:qs.stringify({
        message: createMessage(program)
    })
}

axios.request(option).then((res,err)=>{
    if (err) console.log(err)
})