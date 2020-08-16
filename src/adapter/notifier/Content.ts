import settings from '../../conf/setting'
import moment from 'moment'

export default class Content {
    constructor(){}
    private createMiniBubble(program:{[key:string]:any}){
        const startTime = moment(`${String(program.startTime).slice(0,8)}T${String(program.startTime).slice(8,14)}`)
        const endTime = moment(`${String(program.endTime).slice(0,8)}T${String(program.endTime).slice(8,14)}`)
        if (program.performer === "") program.performer = "-"
        return {
            "type": "bubble",
            "size": "micro",
            "hero": {
                "type": "image",
                "url": program.img,
                "size": "full",
                "aspectMode": "cover",
                "aspectRatio": "320:213"
            },
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "text",
                        "text": program.title,
                        "weight": "bold",
                        "size": "sm",
                        "wrap": true
                    },
                    {
                        "type": "separator"
                    },
                    {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                            {
                                "type": "box",
                                "layout": "baseline",
                                "spacing": "sm",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": "Station",
                                        "wrap": true,
                                        "color": "#aaaaaa",
                                        "size": "xxs",
                                        "flex": 3
                                    },
                                    {
                                        "type": "text",
                                        "text": program.station,
                                        "wrap": true,
                                        "color": "#666666",
                                        "size": "xxs",
                                        "flex": 7
                                    }
                                ]
                            },
                            {
                                "type": "box",
                                "layout": "baseline",
                                "spacing": "sm",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": "Date",
                                        "wrap": true,
                                        "color": "#aaaaaa",
                                        "size": "xxs",
                                        "flex": 3
                                    },
                                    {
                                        "type": "text",
                                        "text": startTime.format('YYYY/MM/DD (ddd)'),
                                        "wrap": true,
                                        "color": "#666666",
                                        "size": "xxs",
                                        "flex": 7
                                    }
                                ]
                            },
                            {
                                "type": "box",
                                "layout": "baseline",
                                "spacing": "sm",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": "Time",
                                        "wrap": true,
                                        "color": "#aaaaaa",
                                        "size": "xxs",
                                        "flex": 3
                                    },
                                    {
                                        "type": "text",
                                        "text": `${startTime.format('HH')}:${startTime.format('mm')} - ${endTime.format('HH')}:${endTime.format('mm')}`,
                                        "wrap": true,
                                        "color": "#666666",
                                        "size": "xxs",
                                        "flex": 7
                                    }
                                ]
                            },
                            {
                                "type": "box",
                                "layout": "baseline",
                                "spacing": "sm",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": "Pfm",
                                        "wrap": true,
                                        "color": "#aaaaaa",
                                        "size": "xxs",
                                        "flex": 3
                                    },
                                    { 
                                        "type": "text",
                                        "text": program.performer,
                                        "wrap": true,
                                        "color": "#666666",
                                        "size": "xxs",
                                        "flex": 7
                                    }
                                ]
                            },
                            {
                                "type": "box",
                                "layout": "baseline",
                                "spacing": "sm",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": "Site",
                                        "wrap": true,
                                        "color": "#aaaaaa",
                                        "size": "xxs",
                                        "flex": 3
                                    },
                                    {
                                        "type": "text",
                                        "text": program.site,
                                        "wrap": true,
                                        "color": "#666666",
                                        "size": "xxs",
                                        "flex": 7
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "type": "button",
                        "action": {
                            "type": "uri",
                            "label": "RESERVE",
                            "uri": `${settings.express.host}:${settings.express.port}/timetable/${program.id}/reserve`
                        },
                        "style": "link",
                        "height": "sm",
                        "position": "relative"
                    }
                ],
                "spacing": "sm",
                "paddingAll": "13px"
            }
        } 
    }

    public createCarousel(programs:{[key:string]:any}){
        const contents = new Array()
        programs.forEach((program:any) => {
            contents.push(this.createMiniBubble(program))
        })
        return {
            "type": "carousel",
            "contents": contents
        }
    }

    public createFullBubble(program:{[key:string]:any}){
        const startTime = moment(`${String(program.startTime).slice(0,8)}T${String(program.startTime).slice(8,14)}`)
        const endTime = moment(`${String(program.endTime).slice(0,8)}T${String(program.endTime).slice(8,14)}`)
        if (program.performer === "") program.performer = "-"
        return {
            "type": "bubble",
            "hero": {
                "type": "image",
                "url": program.img,
                "size": "full",
                "aspectRatio": "20:13",
                "aspectMode": "cover"
            },
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "text",
                        "text": program.title,
                        "weight": "bold",
                        "size": "xl"
                    },
                    {
                        "type": "separator"
                    },
                    {
                        "type": "box",
                        "layout": "vertical",
                        "margin": "lg",
                        "spacing": "sm",
                        "contents": [
                            {
                                "type": "box",
                                "layout": "baseline",
                                "spacing": "sm",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": "Staion",
                                        "color": "#aaaaaa",
                                        "size": "sm",
                                        "flex": 1
                                    },
                                    {
                                        "type": "text",
                                        "text": program.station,
                                        "wrap": true,
                                        "color": "#666666",
                                        "size": "sm",
                                        "flex": 5
                                    }
                                ]
                            },
                            {
                                "type": "box",
                                "layout": "baseline",
                                "spacing": "sm",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": "Date",
                                        "color": "#aaaaaa",
                                        "size": "sm",
                                        "flex": 1
                                    },
                                    {
                                        "type": "text",
                                        "text": startTime.format('YYYY/MM/DD (ddd)'),
                                        "wrap": true,
                                        "color": "#666666",
                                        "size": "sm",
                                        "flex": 5
                                    }
                                ]
                            },
                            {
                                "type": "box",
                                "layout": "baseline",
                                "spacing": "sm",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": "Time",
                                        "color": "#aaaaaa",
                                        "size": "sm",
                                        "flex": 1
                                    },
                                    {
                                        "type": "text",
                                        "text": `${startTime.format('HH')}:${startTime.format('mm')} - ${endTime.format('HH')}:${endTime.format('mm')}`,
                                        "wrap": true,
                                        "color": "#666666",
                                        "size": "sm",
                                        "flex": 5
                                    }
                                ]
                            },
                            {
                                "type": "box",
                                "layout": "baseline",
                                "spacing": "sm",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": "Pfm",
                                        "color": "#aaaaaa",
                                        "size": "sm",
                                        "flex": 1
                                    },
                                    {
                                        "type": "text",
                                        "text": program.performer,
                                        "wrap": true,
                                        "color": "#666666",
                                        "size": "sm",
                                        "flex": 5
                                    }
                                ]
                            },
                            {
                                "type": "box",
                                "layout": "baseline",
                                "spacing": "sm",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": "Site",
                                        "color": "#aaaaaa",
                                        "size": "sm",
                                        "flex": 1
                                    },
                                    {
                                        "type": "text",
                                        "text": program.site,
                                        "wrap": true,
                                        "color": "#666666",
                                        "size": "sm",
                                        "flex": 5
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            "footer": {
                "type": "box",
                "layout": "vertical",
                "spacing": "sm",
                "contents": [
                    {
                        "type": "button",
                        "style": "link",
                        "height": "sm",
                        "action": {
                            "type": "uri",
                            "label": "DOWNLOAD",
                            "uri": `${settings.express.host}:${settings.express.port}/audio/${program.id}`
                        }
                    }
                ],
                "flex": 0
            }
        }  
    }
}