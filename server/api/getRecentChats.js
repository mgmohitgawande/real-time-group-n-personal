var models = require('../../model/model.js');


var getMessagesForUser = function(userId){
    return new Promise(function(success, failure){
        models.messages.aggregate([{
            $match : {
                $or : [
                    {sender : userId},
                    {reciever : userId},
                ]
            }
        }, {
            $project : {
                friend_id : {
                    $cond : {
                        if: {
                            $eq : ['$sender', userId]
                        }, 
                        then: '$reciever', 
                        else : '$sender'
                    }
                },
                msg : '$message',
                sender : '$sender',
                reciever : '$reciever',
                date : '$date'
            }
        }, {
            $group : {
                _id : {
                    friend_id : '$friend_id'
                },
                messages : {
                    $push : {
                        msg : '$msg',
                        sender : '$sender',
                        reciever : '$reciever',
                        date : '$date'
                    }
                }
            }
        }], function(err, docs){
            if(err){
                console.log('awdjhaiwdhiawh')
                failure(err)
            }   else{
                success(docs)
            }
        })
    })
}
module.exports = function(req, res){
    getMessagesForUser(req.body.user._id).then(function(data){
        res.status(200).send(data)
    }, function(err){
        console.log('errrrooorrrr', err)
        res.status(500).send({
            message : 'error'
        })
    })
}