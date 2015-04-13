var http = require('http');
var express = require('express');
var router = express.Router();
var Weather = require('../models/Weather');
var lib = require('../lib');

/* GET current weather listing. */
router.get('/:cityID', function(req, res) {
    var cityID = req.params.cityID;
    //We get the most recent weather data document by city ID parameter
    Weather.find({id: cityID}).sort({dateret: "descending"})
    .limit(1).populate('sys.country').exec(function(err, data) {
        if (err) return console.error(err);
        //Check if data is returned and is not empty
        if (data && (data.length > 0) ) {

            var dbWeather = data[0];
            var dbWeatherDate = new Date(dbWeather.dateret);
            var currentDate = new Date();
            var tenMinsInMilliseconds = 600000;
            //Compare the db time (in milliseconds) for the document 10 mins ahead
            //This is to prevent overloading OWM with requests
            if (currentDate.getTime()  < (dbWeatherDate.getTime() + tenMinsInMilliseconds) ) {
                console.log("\tWeather data for " +
                dbWeather.name  + " not older than 10 mins, obtaining from DB...");
                res.json(dbWeather);
            } else {
                console.log("\tWeather data for " +
                dbWeather.name  + " older than 10 mins, obtaining from API...");
                lib.getAndSaveWeather(cityID, function(err, weather) {   //ask library to access API
                    if (weather) {
                        res.json(weather);
                    } else if (err) {
                        console.error(err);
                        if (err.cod) {  //If OWM gives a specific HTTP status code
                            res.status(err.cod).json({ error: err });
                        } else {
                            res.status(500).json({ error: err });
                        }
                    }
                });
            }
        } else {
            //If no weather document for the city ID parameter is found, the API is accessed
            console.log("\tWeather data not in DB, obtaining from API...");
            lib.getAndSaveWeather(cityID, function(err, weather) {
                if (weather) {
                    res.json(weather);
                } else if (err) {
                    console.error(err);
                    if (err.cod) {  //If OWM gives a specific HTTP status code
                        res.status(err.cod).json({ error: err });
                    } else {
                        res.status(500).json({ error: err });
                    }
                }
            });
        }
    });
});

module.exports = router;
