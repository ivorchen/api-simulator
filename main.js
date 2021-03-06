var rws = require('./router/rws_router.js');
var rcs = require('./router/rcs_router.js');
var mongo = require('./router/mongodbConnection.js');
var fs = require('fs');
var winston = require('winston');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var url = 'mongodb://localhost:27017/api_simulator';
connection = mongoose.connect(url, function(err) {
    if (err) console.log(err);
});

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var casePost = new Schema({
    case_id: {type: String, required: true},
    startTime: {type: String, match: /\d\d\d\d-\d\d-\d\dT\d\d\:\d\d\:\d\d\.\d\d\d\+\d\d\d\d/},
    stopTime: {type: String, match: /\d\d\d\d-\d\d-\d\dT\d\d\:\d\d\:\d\d\.\d\d\d\+\d\d\d\d/},
    voice: [ObjectId],
    screen: [ObjectId]
});

var voicePost = new Schema({
    mediaID: {type: String},
    startTime: {type: String, match: /\d\d\d\d-\d\d-\d\dT\d\d\:\d\d\:\d\d\.\d\d\d\+\d\d\d\d/},
    stopTime: {type: String, match: /\d\d\d\d-\d\d-\d\dT\d\d\:\d\d\:\d\d\.\d\d\d\+\d\d\d\d/},
    mediaPath: {type: String, required: true, match: /.*\.mp3/},
    encryption: Boolean,
    duration: Number,
    Size: Number
});

var screenPost = new Schema({
    mediaID: {type: String},
    startTime: {type: String, match: /\d\d\d\d-\d\d-\d\dT\d\d\:\d\d\:\d\d\.\d\d\d\+\d\d\d\d/},
    stopTime: {type: String, match: /\d\d\d\d-\d\d-\d\dT\d\d\:\d\d\:\d\d\.\d\d\d\+\d\d\d\d/},
    mediaPath: {type: String, required: true, match: /.*\.mp4/},
    encryption: Boolean,
    duration: Number,
    Size: Number
});

var insertPost = new Schema({
    id: String,
    mediaFiles:[]
});

global.caseModel = connection.model('LoadTest', casePost);
global.voiceModel = connection.model('Voice', voicePost);
global.screenModel = connection.model('Screen', screenPost);
global.insertModel = connection.model('Insert', insertPost);
global.callRecording={"statusCode":0,"recording":{"callerPhoneNumber":"555001","dialedPhoneNumber":"10001","mediaFiles":[],"eventHistory":[],"callType":"Inbound","region":"region1"}};
global.screenRecording={"statusCode":0,"recording":{"mediaFiles":[],"eventHistory":[],
    "region":"region1"}};

var log_dir="./logs";
if(!fs.existsSync(log_dir)){
  fs.mkdirSync(log_dir);
}

const tsFormat = () => (new Date()).toLocaleTimeString();
global.logger = new winston.Logger({
    transports: [
        new (winston.transports.Console)({
            colorize: true,
            timestamp: tsFormat,
            level: 'debug'
        }),
        new (require('winston-daily-rotate-file'))({
            level: 'debug',
            datePattern: 'yyyy_MM_dd_mm_HH_',
            prepend: true,
            timestamp: tsFormat,
            filename: './logs/rws_all-logs.log'
        })
    ],
    exitOnError: false
}); 

var mongo_listener = mongo.listen(8083, function (err){
    if (err){
        console.error(err);
    }
    var rws_listener = rws.listen(8081, function (err){
    if (err){
       console.error(err);
    } 
    global.rws_port = rws_listener.address().port;
    });
    var rcs_listener = rcs.listen(8082, function (err){
        if (err){
           console.error(err);
        } 
    });
});