var models = require('../../model/model.js');
module.exports = (function(){
    return function(io){
        var findUser = function(user_id, friend_id){
            return new Promise(function(success, failure){
                models.user.findOne({
                    "_id" : user_id,
                    "friends._id" : friend_id
                }, function(err,doc){
                    if(err){
                        failure(err)
                    }   else{
                        success(doc)
                    }
                })
            })
        }

        var updateRequestingUser = function(req){
            return new Promise(function(success, failure){
                models.user.update({
                    _id : req.body.user._id
                }, {
                    $push:{
                        friends : {
                            name : req.body.friend_handle,
                            _id : req.body.friend_id,
                            status : "Pending"
                        }
                    }
                }, {
                    upsert:true
                }, function(err, user){
                    if(err){
                        failure(err)
                    }   else{
                        success(user)
                    }
                })
            })
        }
        var updateFriendUser = function(req){
            return new Promise(function(success, failure){
                models.user.update({
                    _id : req.body.friend_id
                }, {
                    $push:{
                        friends : {
                            name : req.body.user.handle,
                            _id : req.body.user._id,
                            status : "Waiting"
                        }
                    }
                }, {
                    upsert:true
                }, function(err, user){
                    if(err){
                        failure(err)
                    }   else{
                        success(user)
                    }
                })
            })
        }
        return function(req,res){
            Promise.all([
                findUser(req.body.user._id, req.body.friend_id),
                findUser(req.body.friend_id, req.body.user._id),
            ]).then(function(results){
                console.log('already friend', results)
                var updateUsers = []
                if(!results[0]){
                    updateUsers.push(updateRequestingUser(req))
                }
                if(!results[1]){
                    updateUsers.push(updateFriendUser(req))
                }
                return Promise.all(updateUsers)
            }, function(err){
                throw err
            })
            .then(function(results){
                console.log('modified users', results)
                models.user_sessions.find({
                    user_id : req.body.friend_id
                }, function(err, friendConnections){
                    friendConnections.forEach(function(friendConnection){
                        console.log('friend_connection', friendConnection)
                        io.to(friendConnection.socket_id).emit('message', {
                            friend_id : req.body.user._id,
                            friend_handle : req.body.user.handle
                        });
                    })
                })
                res.status(200).send({
                    message : 'request sent successfully'
                })
            }, function(error){
                console.log('friend req err', error)
                res.status(500).send({
                    message : 'error'
                })
            })
        }
    }
}())