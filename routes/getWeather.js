var http = require('http');
var express = require('express');
var router = express.Router();

/* GET current weather listing. */
router.get('/:cityID', function(req, res) {
    var cityID = req.params.cityID;
    http.get("http://api.openweathermap.org/data/2.5/weather?id=" + cityID, function(getRes) {
        console.log("Got response: " + getRes.statusCode + " collecting city data...");
        var body = "";
        getRes.on('data', function(data) {
            body += data.toString();    //accumulate text buffer as string
        });
        getRes.on('end', function () {     //action after data transmission
            var currentWeather = JSON.parse(body);
            res.json(currentWeather);
        });
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    });
});

module.exports = router;
