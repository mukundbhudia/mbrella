//Library functions for mbrella

var logger = require('./logger');
var http = require('http');
var City = require('./models/City');
var Country = require('./models/Country');
var Weather = require('./models/Weather');

/*
    Accesses Open Weather Map API for a given city ID to get the current weather.
    Once data is successfully accessed, its parsed as JSON and saved to the DB to
    the weather collection as part of the Weather model.
*/
var getAndSaveWeather = function(cityID, callback) {
    http.get("http://api.openweathermap.org/data/2.5/weather?id=" + cityID, function(getRes) {
        logger.info("...got response: " + getRes.statusCode + " collecting weather data...");
        //Build up the data from the HTTP GET request using the body variable (as it is streamed)
        var body = "";
        getRes.on('data', function(data) {
            body += data.toString();    //accumulate text buffer as string
        });
        getRes.on('end', function () {     //action after data transmission
            var currentWeather = null;
            try {   //Try and catch as http get data could be malformed
                currentWeather = JSON.parse(body);
            } catch (error) {
                currentWeather = null;
                logger.error(error);
            }
            if (currentWeather) {
                if (currentWeather.cod === 200) {   //This is when OWM reports HTTP ok
                    //We want to send the weather JSON data with pre-populated country data
                    var weatherToSaveCountry = currentWeather.sys.country;
                    var foundCountryData = null;
                    //Find the country doc givin the code
                    Country.findOne({ countryCode: weatherToSaveCountry }, function(err, country) {
                        foundCountryData = country;
                        //We replace the country code given by OWM with our country...
                        //...id so it can be easily populated in the future
                        currentWeather.sys.country = country._id;
                        weatherToSave = new Weather(currentWeather);
                        //Perfrom save to db
                        weatherToSave.save(function(err, data) {
                            currentWeather = data;
                            //Instead of another db query with populate, we just...
                            //...add in the country data we already obtained
                            currentWeather.sys.country = foundCountryData;
                            if (err) return logger.error(err);
                            logger.info("Weather data for " + currentWeather.name +
                            " with ID: " + currentWeather.id + " saved.");
                            //Return the weather to callback function
                            callback && callback(null, currentWeather);
                        });
                    });

                } else {
                    //Another HTTP code is given so we output the OWM JSON as an error
                    callback && callback(currentWeather, null);
                }
            } else {
                callback && callback("Weather data for city ID: " + cityID +
                " not in JSON form. \n \n" + body + "\n", null);
            }
        });
    }).on('error', function(e) {
        callback && callback("HTTP error accessing OWM API: " + e.message, null);
    });
};


/*
    We hold information about the countries that Open Weather Map has data for.
    checkCountryData checks what country data we have and populates it if nessacery.
    After country data population it calls city data to be populated. This is so the
    correct country can be assigned to the corresponding city.
*/
var checkCountryData = function() {
    var countryCodeFile = "./data/slim-2.json";      //The name of the 2 char country code JSON file
    fs = require('fs');
    fs.readFile(countryCodeFile, 'utf8', function (err, data) {

        if (err && (err.errno == 34)) {         //34 is file not found error
            return logger.error("country file '" + countryCodeFile + "' not found.");

        } else if (err && (err.errno != 34)) {  //Another file error has occured
            return logger.error(err);

        } else {
            var countryCodesFromFile = null;
            try {
                var countryCodesFromFile = JSON.parse(data);   //Attempt to Parse as JSON
            } catch (error) {
                logger.error(error);
                return logger.error("country file '" + countryCodeFile + "' found but is not in JSON form");
            }
            logger.info("Country file '" + countryCodeFile + "' found and loaded. Attempting DB checks...");
            //Check how many cities are in the db
            City.find().count(function (err, count) {
                if (err) return logger.error(err);
                logger.debug(count + " cities in database.");
            });
            //Check how many countries are in the db
            Country.find().count(function (err, count) {
                if (err) return logger.error(err);
                logger.debug(count + " countries in database.");
                if (count === 0) {  //If there are no countries in the db we populate them
                    populateCountryData(countryCodesFromFile, function(countriesToAdd){
                        //Once country data is in correct form it is bulk inserted
                        Country.collection.insert(countriesToAdd, function(err, doc) {
                            if (err) return logger.error(err);
                            logger.info(countriesToAdd.length + " countries saved to database.");
                            //We then purge City data to re-populated using the new country data
                            City.remove({}, function(err){
                                if (err) return logger.error(err);
                                logger.info("City collection dropped to be re-populated.")
                                populateCityData(doc, countryCodesFromFile);
                            });
                        });
                    });
                } else {    //If there are countries in the DB we use them to populate city data
                    logger.info("Countries found in database, skipping countries retrival");
                    Country.find({}, function(err, data) {
                        if (err) return logger.error(err);
                        populateCityData(data, countryCodesFromFile);
                    });
                }

            });
        }
    });
}

/*
    This function forms country data ready to be inserted to the DB. Essentially
    it strips out the 3 digit numercal code suppled from the slim-2.json file
    which is redundant for this app.
*/
var populateCountryData = function(countryCodes, callback) {
    if (countryCodes) {
        var countriesToAdd = [];
        //Go through all the country codes supplied by the data file
        for (i = 0; i < countryCodes.length; i++) {
            var countryToAdd = {    //take the values we need
                countryCode : countryCodes[i]["alpha-2"],
                countryName : countryCodes[i].name,
                __v : 0
            };
            countriesToAdd.push(countryToAdd);
        }
        //Adding Kosovo which is not part of ISO 3166 standard alpha-2 codes
        //https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
        var kosovo = {
            countryCode : 'XK', //user assigned country code
            countryName : 'Kosovo',
            __v : 0
        };
        countriesToAdd.push(kosovo);
        //Return collated country codes as a callback
        callback && callback(countriesToAdd);
    } else {
        logger.error("No country codes supplied.");
    }
};

/*
    Accesses Open Weather Map URL to obtain a city text file.
    Goes through each line to extract the city info, converts to JSON.
    Then bulk insterts to db. Only does so if there are no cities already
    in the db.
*/
var populateCityData = function(countryCodes, countryCodesFromFile) {

    City.find().count(function (err, count) {
        if (err) return logger.error(err);
        //Determine the number of cities in the db, only access URL if none in db
        if (count === 0) {
            //Access the URL and process the data
            logger.info("Accessing OWM cities text file...");
            http.get("http://openweathermap.org/help/city_list.txt", function(res) {
                logger.info("..got response: " + res.statusCode + " collecting city data...");
                var body = "";
                res.on('data', function(data) {
                    body += data.toString();    //accumulate text buffer as string
                });
                res.on('end', function () {     //action after data transmission
                    var cityArray = body.split("\n");   //each line in text file is a city
                    //ignoring the header line and blank line at end of file
                    var totalCitiesInArray = cityArray.length - 2;
                    logger.info('...finished collecting city data. ' + (totalCitiesInArray) + " cities found.");
                    //The string array is passed to be formed as an array of JSON objects
                    formCityData(cityArray, countryCodes, function(cities) {
                        logger.debug(cities.length + " cities formed with country codes.");
                        //Batch insert the array of JSON objects
                        City.collection.insert(cities, function(err, doc) {
                            if (err) return logger.error(err);
                            logger.info(cities.length + " cities saved to database.");
                            //Once all data is saved we can check if any country codes are missing
                            compareCountryCodes(countryCodesFromFile);
                        });
                    });
                });
            }).on('error', function(e) {
                logger.error("Got error: " + e.message);
            });

        } else {
            logger.info("Cities found in database, skipping city retrival");
        }
    });
};

/*
    Uses OWM city text file as an array of strings goes through each line to
    extract the city info. For each line the corresponding country code is
    matched with the countries collection and the country id is saved for the
    correct city as a JSON object. An array of these JSON objects is sent as
    a callback.
*/
var formCityData = function(cityArray, countryCodes, callback) {
    if (cityArray && countryCodes) {
        var cities = [];
        // NOTE: for loop starts 1 item ahead to ignore the header line and...
        //...ends one item before to ignore blank space in text file
        for (i = 1; i < (cityArray.length - 1); i++) {
            var cityLine = cityArray[i].split("\t");    // split up each line...
            var codeToFind = cityLine[4];
            var foundCode = false;
            var j = 0;
            //We next go through the DB country codes until we find one or run out of items
            while ((j < countryCodes.length) && !foundCode) {
                if (codeToFind === countryCodes[j].countryCode) {
                    foundCode = true;
                    var cityToSave = {                          // ...to form JSON
                        cityID: parseInt(cityLine[0]),
                        cityName: cityLine[1],
                        latitude: parseFloat(cityLine[2]),
                        longtitude: parseFloat(cityLine[3]),
                        country: countryCodes[j]._id,       //save country ID for each city
                        __v : 0
                    };
                    cities.push(cityToSave);
                }
                j++;
            }
            if (!foundCode) {   //The case where a city has an unrecognised country code
                logger.warn("\tCity " + cityLine[1] +
                " (" + codeToFind + ") not found in ISO 3166 city codes file.");
            }
        }
        callback && callback(cities);
    } else {
        logger.error("No city array or country codes supplied.");
    }
};

/*
    Takes in a list of country codes from a file. We assume the list from file
    is more complete and traverse each item from that list and then compare
    the db list to see what items are missing.
*/

var compareCountryCodes = function(countryCodesFile) {
    City.find().distinct('country').exec(function(error, codes) {
        logger.info("Distinct codes from cities: " + codes.length + "\n");
        //We form the distinct country codes into an array of objects
        var distinctCountryCodesFromCities = [];
        for (var i = 0; i < codes.length; i++) {
            var countryCode = {
                country: codes[i]
            };
            distinctCountryCodesFromCities.push(countryCode);
        }
        //We populate the array of cities with distinct country code objects
        City.populate(distinctCountryCodesFromCities, {
            path: 'country',
            model: 'Country'
        }, function(err, docs){
            var countryCodesFromCities = docs;  //City info with populated country data
            var countriesNotFound = []; //All the codes that don't match between lists
            //We go through each item in the country codes file as its assumed the file
            //has more complete information
            for (i = 0; i < countryCodesFile.length; i++) {
                var codeToFind = countryCodesFile[i]["alpha-2"];
                var foundCode = false;
                var j = 0;
                //We next go through the DB country codes until we find one or run out of items
                while ((j < countryCodesFromCities.length) && !foundCode) {
                    if (codeToFind === countryCodesFromCities[j].country.countryCode) {
                        foundCode = true;
                    }
                    j++;
                }
                //If we still haven't found a code then we add what we were looking for to the missing list
                if (!foundCode) {
                    logger.warn("\t" + codeToFind + " (" + countryCodesFile[i].name +
                    ") not found in database city codes");
                    countriesNotFound.push(codeToFind);
                }
            }
            if (countriesNotFound.length > 0) {
                logger.warn("\t" + countriesNotFound.length +
                " country codes missing from OWM API but are in the database. \n");
            }
        });
    });
};

//Functions used outside this library are exported below
module.exports = {
    getAndSaveWeather: getAndSaveWeather,
    checkCountryData: checkCountryData
};
