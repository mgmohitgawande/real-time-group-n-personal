var models = require('../../model/model.js');

module.exports = function(req, res){
    
    if(req.session.user && req.session.user._id && req.session.user._id == req.body.user._id){
        models.user.findOne({
            "_id" : req.session.user._id
        }, function(err,doc){
            if(err){
                res.send(err); 
            }
            if(doc==null){
                res.send("User has not registered");
            }
            else{
                res.send({
                    status : 'success',
                    user : doc
                });
            }
            
        });
    }   else{
        res.status(401).send({
            status : false,
            message : 'not logged in'
        });
    }
}