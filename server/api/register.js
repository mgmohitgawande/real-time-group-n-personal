var models = require('../../model/model.js');
module.exports = function(req, res){
    var user={
        "name":req.body.name,
        "handle":req.body.handle,
        "password":req.body.password,
        "phone":req.body.phone,
        "email":req.body.email,
    };
    console.log(user);
    
    models.user.findOne({"handle":req.body.handle},function(err,doc){
        if(err){
            res.json(err); 
        }
        if(doc == null){
            models.user.create(user, function(err, doc){
                if(err) 
                    res.json(err);
                else {
                    res.send("success");
                }
            });
        }else{
            res.send("User already found");
        }
    })
    
}