var models = require('../../model/model.js');
module.exports = (function(){
    return function(io){
        var updateUserToAssociateFriend = function(user_id, friend_id){
            return new Promise(function(success, failure){
                models.user.update({
                    "_id" : user_id, 
                    "friends._id" : friend_id
                }, {
                    '$set' : {"friends.$.status" : "Friend"}
                }, function(err, doc){
                    if(err){
                        console.log('errrrr', err)
                        failure(err)
                    }   else{
                        console.log('update resp', doc)
                        success(doc)
                    }
                })
            })
        }

        var updateUserToCancelFriendReq = function(user_id, friend_id){
            return new Promise(function(success, failure){
                models.user.update({
                    "_id" : user_id
                }, {
                    '$pull' : {
                        'friends' : {
                            "_id" : friend_id,
                        }
                    }
                }, function(err, doc){
                    if(err){
                        failure(err)
                    }   else{
                        success(doc)
                    }
                })
            })
        }

        var get_user_detail = function(user_id, friend_id){
            return new Promise(function(success, failure){
                models.user.find({
                    _id : user_id,
                    'friends._id' : friend_id,
                    'friends.status' : 'Waiting',
                }, function(err, doc){
                    if(err){
                        failure(err)
                    }   else{
                        if(doc.length){
                            success(doc)
                        }   else{
                            failure({
                                message : 'User ' + user_id + 'dont have active friend req from user ' + friend_id
                            })
                        }
                    }
                })
            })
        }
        
        return function(req,res){
            console.log("friend request confirmed : ", req.body);
            get_user_detail(req.body.user._id, req.body.friend_id).then(function(){
                if(req.body.confirm == "Yes"){
                    
                    Promise.all([
                        updateUserToAssociateFriend(req.body.user._id, req.body.friend_id),
                        updateUserToAssociateFriend(req.body.friend_id, req.body.user._id)
                    ]).then(function(result){
                        io.to(users[req.body.friend_handle]).emit('friend', req.body.user.handle);
                        io.to(users[req.body.user.handle]).emit('friend', req.body.friend_handle);
                        console.log('yeeessss confirm updated users', result)
                        res.status(200).send({
                            message : 'made friends'
                        })
                    }, function(err){
                        console.log('yeeessss errrrrorrrr users', err)
                        res.status(500).send({
                            error : err,
                            message : 1
                        })
                    })
                }
                else{
                    Promise.all([
                        updateUserToCancelFriendReq(req.body.user._id, req.body.friend_id),
                        updateUserToCancelFriendReq(req.body.friend_id, req.body.user._id)
                    ]).then(function(result){
                        console.log('nooooo confirm updated users', result)
                        res.status(200).send({
                            message : 'friends req cancled'
                        })
                    }, function(err){
                        res.status(500).send({
                            error : err,
                            message : 2
                        })
                    })
                }
            }, function(err){
                res.status(500).send({
                    error : err,
                    message : 'error getting requesting user'
                })
            })
        }
    }
}())