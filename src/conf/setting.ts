export default {
    "express": {
        "port": 3000
    },
    "logger": {
        "loglevel": "debug",
        "logfile": "logs/radio-base.log"
    },
    "ffmpeg": {
        "outputDir": "./output",
        "logDir": "./logs/ffmpeg",
        "loglevel": "info",
        "extension": "mp3"
    },
    "sites": [
        {
            "name": "radiko",
            "enable": true,
            "prefectureCode": "JP11"
        },
        {
            "name": "rajiru",
            "enable": true,
            "area": "130",
            "apiKey": "TxmrGTn8Ts1AYIVsfwO3ak5BAAN5ecqD"
        },
        {
            "name": "ottava",
            "enable": false,
        }
    ]
}