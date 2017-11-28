var models = require('../../model/model.js');

module.exports = function(req, res){
    if(req.body.socket_id && req.body.socket_id.length){
        models.user_sessions.remove({
            $or : [
                {"socket_id" : req.body.socket_id},
                {"session_id" : req.session.id}
            ]
        }, function(err){
            if(err){
                json.status(500).send({
                    message : 'mongo error'
                })
            }   else{
                models.user_sessions.create({
                    "socket_id" : req.body.socket_id,
                    "user_id" : req.body.user._id,
                    "handle" : req.body.user.handle,
                    "session_id" : req.session.id,
                    "date" : new Date()
                }, function(err, session){
                    if(err){
                        res.status(500).send({
                            message : 'mongo error'
                        })
                    }   else{
                        res.status(200).send({
                            message : 'chat session created',
                            chat_session : session
                        })
                    }
                })
            }
        })
    }   else{
        res.status(400).send({
            message : 'req do not contain socket id'
        })
    }
}