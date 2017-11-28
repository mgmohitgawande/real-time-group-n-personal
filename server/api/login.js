var models = require('../../model/model.js');

module.exports = function(req, res){
    models.user.findOne({
        "handle" : req.body.handle, 
        "password" : req.body.password
    }, function(err, doc){
        if(err){
            res.status(500).send({
                status : 'fail',
                error : err
            });
        }
        if(doc==null){
            res.send({
                status : 'fail',
                message : 'user not registered'
            });
        }
        else{
            req.session.user = doc
            res.send({
                status : 'success',
                user : doc
            });
        }
        
});
}