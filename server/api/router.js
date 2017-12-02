var express = require('express');

module.exports = function (io){
    var router = express.Router();

    router.post('/register', require('./register.js'))
    router.post('/login', require('./login.js'))
    router.post('/check_login', require('./check_login.js'))
    router.get('/getBitcoinPrice', require('./getBitcoinPrice.js'))


    router.use(require('../utility/auth-checker.js'))

    router.post('/logout', require('./logout.js'))
    router.post('/friend_request', require('./friend_request.js')(io))
    router.post('/friend_request_confirmed', require('./friend_request_confirmed.js')(io))
    router.post('/registerChatSessionForUser', require('./registerChatSessionForUser.js'))
    router.post('/getRecentChats', require('./getRecentChats.js'))
    
    return router
}