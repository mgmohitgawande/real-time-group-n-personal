var express=require('express');
var app=express();
var http=require('http').Server(app);
var io = require('socket.io')(http);
var ip = require('ip');
var bodyParser = require('body-parser');
var path = require('path');

var cookieParser = require('cookie-parser');
var session = require('express-session');


var port = process.env.PORT || 8080;

app.use(cookieParser());
app.use(session({secret: "Shh, its a secret!"}));


app.use(function(req, res, next){
    // console.log('session, session', req.session)
    next()
})

app.use(function(req, res, next){
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Method","'GET, POST, OPTIONS, PUT, PATCH, DELETE'");
    next();
})
app.use(express.static('./'));

app.use(express.static('./'));
app.use( bodyParser.json() );

app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/',function(req,res){
    // console.log('serving application')
    res.sendFile(path.resolve(__dirname+"/views/index.html"));
});

app.use('/api', require("./server/api/router.js")(io));
require('./server/sockets/chat_socket.js')(io)


http.listen(port, function(){
    console.log("Node Running On port :", port);
})