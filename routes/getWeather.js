var http = require('http');
var express = require('express');
var router = express.Router();
var logger = require('../logger');
var Weather = require('../models/Weather');
var lib = require('../lib');

/* GET current weather listing. */
router.get('/:cityID', function(req, res) {
    var cityID = req.params.cityID;
    //First we check if the cityId entered is a number...
    if (cityID == parseInt(req.params.cityID)) {
        //...then we get the most recent weather data document by city ID
        Weather.find({id: cityID}).sort({dateret: "descending"})
        .limit(1).populate('sys.country').exec(function(err, data) {
            if (err) {
                logger.error(err);
                res.status(500).json({ error: "Database error occurred" });
            } else {
                //Check if data is returned and is not empty
                if (data && (data.length > 0) ) {

                    var dbWeather = data[0];
                    var dbWeatherDate = new Date(dbWeather.dateret);
                    var currentDate = new Date();
                    var tenMinsInMilliseconds = 600000;
                    //Compare the db time (in milliseconds) for the document 10 mins ahead
                    //This is to prevent overloading OWM with requests
                    if (currentDate.getTime()  < (dbWeatherDate.getTime() + tenMinsInMilliseconds) ) {
                        logger.debug("Weather data for " +
                        dbWeather.name  + " not older than 10 mins, obtaining from DB...");
                        res.json(dbWeather);
                    } else {
                        logger.debug("Weather data for " +
                        dbWeather.name  + " older than 10 mins, obtaining from API...");
                        lib.getAndSaveWeather(cityID, function(err, weather) {   //ask library to access API
                            if (weather) {
                                res.json(weather);
                            } else if (err) {
                                logger.error(err);
                                if (err.cod) {  //If OWM gives a specific HTTP status code
                                    res.status(err.cod).json({ error: err });
                                } else {
                                    res.status(500).json({ error: err });
                                }
                            }
                        });
                    }
                } else {
                    lib.doesCityExist(cityID, function(cityerr, doesCityExist) {
                        if (cityerr) return logger.error(cityerr);
                        if (doesCityExist) {
                            //If no weather document for the city ID parameter
                            // is found, the API is accessed
                            logger.debug("Weather data for id " + cityID +
                            " not in DB, obtaining from API...");
                            lib.getAndSaveWeather(cityID, function(err, weather) {
                                if (weather) {
                                    res.json(weather);
                                } else if (err) {
                                    logger.error(err);
                                    if (err.cod) {  //If OWM gives a specific HTTP status code
                                        res.status(err.cod).json({ error: err });
                                    } else {
                                        res.status(500).json({ error: err });
                                    }
                                }
                            });
                        } else {
                            //If no weather document for the city ID parameter is found,
                            //we check if the city exists in the database
                            logger.warn("The city with ID " + cityID + " does not exist in DB");
                            res.status(404).json({ error: "The city with ID " +
                            cityID + " does not exist in DB" });
                        }
                    });
                }
            }
        });
    } else {
        var cityIDerr = "The city ID: " + cityID + " is not a number";
        logger.warn(cityIDerr);
        res.status(404).json({ error: cityIDerr });
    }
});

module.exports = router;
