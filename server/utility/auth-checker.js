var models = require('../../model/model.js');
module.exports = function(req, res, next){
    if(req.session.user && req.session.user._id && req.session.user._id == req.body.user._id){
        models.user.findOne({
            "_id" : req.session.user._id
        }, function(err,doc){
            if(err){
                res.status(500).send(err); 
            }
            if(doc==null){
                res.status(401).send("User has not registered");
            }
            else{
                next()
            }
            
        });
    }   else{
        res.status(401).send({
            status : false,
            message : 'not logged in'
        });
    }
}