var models = require('../../model/model.js');

module.exports = function(){
    models.user_sessions.remove({}, function(err, data){
        if(err){
            console.log('error in startup deleting old user_sessions', err)
        }
    })
}