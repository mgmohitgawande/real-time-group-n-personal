var request = require('request')

var models = require('../../model/model.js');

module.exports = function(req, res){
    request('https://api.coindesk.com/v1/bpi/currentprice/INR.json', function(error, response, body){
        res.status(200).send(body)
    })
}