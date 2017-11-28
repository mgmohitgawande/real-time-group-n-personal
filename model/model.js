var config = require('../config.json')

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

mongoose.connect(config.mongo_url + '/chat');

mongoose.connection.on('open', function (ref) {
    console.log('Connected to mongo server.');
});
mongoose.connection.on('error', function (err) {
    console.log('Could not connect to mongo server!');
    console.log(err);
});

// mongoose.connect(config.mongo_url);

module.exports.user = mongoose.model('User',new Schema({
    name            : String,
    handle          : String,
    password        : String,
    phone           : String,
    email           : String,
    friends         : []
},{strict: false}));

module.exports.online = mongoose.model('Online', new Schema({
    handle          : String,
    connection_id   : String
}));

module.exports.messages = mongoose.model('Messages', new Schema({
    message         : String,
    sender          : String,
    reciever        : String,
    date            : Date
}));

module.exports.user_sessions = mongoose.model('UserSessions', new Schema({
    session_id      : String,
    user_id         : String,
    socket_id       : String,
    handle          : String,
    date            : Date
},{strict: false}));

module.exports.objectId = function(id){
    return mongoose.Types.ObjectId(id)
}