var models = require('../../model/model.js');

module.exports = function(io){

    var users={};
    var keys={};
    var getOnlineUsers = function(){
        return new Promise(function(success, failure){
            models.user_sessions.aggregate([{
                $group : {
                    _id : {
                        user_id : '$user_id',
                        handle : '$handle'
                    },
                    // handle : '$handle',
                    socket_id : {
                        $push : '$socket_id'
                    }
                }
            }], function(err, onlineUserSessions){
                if(err){
                    failure(err)
                }   else{
                    success(onlineUserSessions)
                }
            })
        })
    }

    var getUserSessionsForUsers = function(userId){
        return new Promise(function(success, failure){
            models.user_sessions.aggregate([{ 
                $match : { user_id : userId } 
            }, {
                $group : {
                    _id : {
                        user_id : '$user_id',
                        handle : '$handle'
                    },
                    // handle : '$handle',
                    socket_id : {
                        $push : '$socket_id'
                    }
                }
            }], function(err, onlineUserSessions){
                if(err){
                    failure(err)
                }   else{
                    success(onlineUserSessions)
                }
            })
        })
    }

    var getFriends = function(user_id){
        return new Promise(function(success, failure){
            models.user.findOne({
                _id : user_id
            }, function(err, user){
                if(err){
                    failure(err)
                }   else{
                    var friends = {}
                    
                    friends.all_friends = user && user.friends && user.friends.length ? user.friends : []
                    friends.pending_friends = friends.all_friends.filter(friend => friend.status == "Pending")
                    friends.confirm_friends = friends.all_friends.filter(friend => friend.status == "Friend")
                    // friends.restricted_friends = friends.all_friends.filter(friend => friendstatus == "Friend")
                    
                    success(friends)
                }
            })
        })
    }

    var handleSocketDisconnection = function(socket){
        return function(){

            models.user_sessions.remove({
                socket_id : socket.id
            }, function(err, status){
                if(err){
                    console.log('errror, deleting user_session', err)
                }   else{
                    getOnlineUsers().then(function(users){
                        io.emit('users', users);
                    })
                    console.log('disconnected', users);
                }
            })
        }
    }

    io.use(function(socket, next){
        // console.log('%%%%%%%%%%%%%%%', socket.handshake.query)
        // if(socket.handshake.query && socket.handshake.query.user){
        //     console.log('socket.handshake.query', JSON.parse(socket.handshake.query.user))
            
        // }
        console.log('mmmmmmmm')
        next()
    })
    io.on('connection',function(socket){
        
        console.log("Connection : " + socket.id);
        io.to(socket.id).emit('handle', {socket_id : socket.id});
        
        
        socket.on('session_authenticated', function(data){
            console.log('chat session authenticated for', data)
            if(data && data.socket_id && data.user_id){
                models.user_sessions.find({
                    user_id : data.user_id,
                    socket_id : data.socket_id,
                    handle : data.handle
                }, function(err, doc){
                    if(err){
                        console.log('error in getting chat session after authentication')
                        res.json(err);
                    }
                    else {
                        Promise.all([
                            getOnlineUsers(),
                            getFriends(data.user_id)
                        ]).then(function(result){
                            console.log('promise.all result',result)

                            io.to(socket.id).emit('friend_list', result[1].confirm_friends);
                            io.to(socket.id).emit('pending_list', result[1].pending_friends);
                            console.log('hiiiiiiiiii', result[0])
                            io.emit('users', result[0]);
                        }, function(error){
                            console.log('promise.all getOnlineUsers(), getFriends() err', error)
                        })
                    }
                });
            }
        })
        
        socket.on('group message', function(msg){
            console.log('group message', msg);
            io.emit('group', msg);
        });
        
        socket.on('private message',function(msg){
            console.log('private message  :', msg.split("#*@")[0]);
            models.messages.create({
                "message" : msg.split("#*@")[1],
                "sender" : msg.split("#*@")[2],
                "reciever" : msg.split("#*@")[0],
                "date" : new Date()
            });
            getUserSessionsForUsers(msg.split("#*@")[0]).then(function(data){
                console.log('awdawd', data[0])
                if(data && data.length){
                    data[0].socket_id.forEach(element => {
                        io.to(element).emit('private message', msg);
                    });
                }
            }, function(error){
                console.log('getUserSessionsForUsers error', error)
            })
        });
        
        socket.on('disconnect', handleSocketDisconnection(socket));
    });
}