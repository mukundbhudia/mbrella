//Library functions for Brella

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
        console.log("Got response: " + getRes.statusCode + " collecting weather data...");
        //Build up the data from the HTTP GET request using the body variable (as it is streamed)
        var body = "";
        getRes.on('data', function(data) {
            body += data.toString();    //accumulate text buffer as string
        });
        getRes.on('end', function () {     //action after data transmission
            var currentWeather = JSON.parse(body);  //TODO: try/catch here? body could be malformed
            weatherToSave = new Weather(currentWeather);
            //Perfrom save to db
            weatherToSave.save(function (err, data) {
                if (err) return console.error(err);
                console.log("Weather data for " + currentWeather.name +
                " with ID: " + currentWeather.id + " saved.");
            });
            //Return the weather to callback function
            callback && callback(currentWeather);
        });
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    });
}

/*
    Accesses Open Weather Map URL to obtain a city text file.
    Goes through each line to extract the city info, converts to JSON.
    Then bulk insterts to db. Only does so if there are no cities already
    in the db.
*/

var populateCityData = function() {

    City.find().count(function (err, count) {
        if (err) return console.error(err);
        console.log(count + " cities in database.");
        //Determine the number of cities in the db, only access URL if none in db
        if (count === 0) {
            //Access the URL and process the data
            http.get("http://openweathermap.org/help/city_list.txt", function(res) {
                console.log("Got response: " + res.statusCode + " collecting city data...");
                var body = "";
                res.on('data', function(data) {
                    body += data.toString();    //accumulate text buffer as string
                });
                res.on('end', function () {     //action after data transmission
                    var cityArray = body.split("\n");   //each line in text file is a city
                    //ignoring the header line and blank line at end of file
                    var totalCitiesInArray = cityArray.length - 2;
                    var cities = [];
                    console.log('...finished collecting city data. ' + (totalCitiesInArray) + " cities found.");
                    // NOTE: for loop starts 1 item ahead to ignore the header line and...
                    //...ends one item before to ignore blank space in text file
                    for (i = 1; i < (cityArray.length - 1); i++) {
                        var cityLine = cityArray[i].split("\t");    // split up each line...
                        var cityToSave = {                          // ...to form JSON
                            cityID: parseInt(cityLine[0]),
                            cityName: cityLine[1],
                            latitude: parseFloat(cityLine[2]),
                            longtitude: parseFloat(cityLine[3]),
                            countryCode: cityLine[4],
                            __v : 0
                        };
                        cities.push(cityToSave);
                    }
                    //Batch insert the array of JSON objects
                    City.collection.insert(cities, function(err, doc) {
                        if (err) return console.error(err);
                        console.log(cities.length + " cities saved to database.");
                    });
                });
            }).on('error', function(e) {
                console.log("Got error: " + e.message);
            });

        } else {
            console.log("Cities found in database, skipping city retrival");
        }
    });
}

/*
    Takes in two lists of country codes, one from a file and one from the database.
    We assume the list from file is more complete and traverse each item from that list
    and then compare the db list to see what items are missing.
*/

var compareCountryCodes =  function(countryCodes, countryCodesFromCities, callback) {
    if (countryCodes) {
        var countriesNotFound = []; //All the codes that don't match between lists
        //We go through each item in the country codes file as its assumed the file
        //has more complete information
        for (i = 0; i < countryCodes.length; i++) {
            var codeToFind = countryCodes[i]["alpha-2"];
            var foundCode = false;
            var j = 0;
            //We next go through the DB country codes until we find one or run out of items
            while ((j < countryCodesFromCities.length) && !foundCode) {
                if (codeToFind === countryCodesFromCities[j]) {
                    foundCode = true;
                }
                j++;
            }
            //If we still haven't found a code then we add what we were looking for to the missing list
            if (!foundCode) {
                console.log("\t" + codeToFind + " (" + countryCodes[i].name + ") not found in database city codes");
                countriesNotFound.push(codeToFind);
            }
        }
        if (countriesNotFound.length > 0) {
            callback && callback(countriesNotFound);
        }
    }
}

/*
    We hold information about the countries that Open Weather Map has data for.
    checkCountryData checks what country data we have and populates it if nessacery.
*/

var checkCountryData = function() {
    var keysFileName = "./data/slim-2.json"      //The name of the 2 char country code JSON file
    fs = require('fs');
    fs.readFile(keysFileName, 'utf8', function (err, data) {

        if (err && (err.errno == 34)) {         //34 is file not found error
            return console.log("country file '" + keysFileName + "' not found.");

        } else if (err && (err.errno != 34)) {  //Another file error has occured
            return console.log(err);

        } else {
            try {
                var countryCodes = JSON.parse(data);   //Attempt to Parse as JSON
                console.log("Country file '" + keysFileName + "' found and loaded. Attempting DB checks...");
                City.find().distinct('countryCode', function(error, codes) {
                    var countryCodesFromCities = codes;
                    console.log("Distinct codes from cities: " + countryCodesFromCities.length + "\n");
                    //For all the country codes we have from the list of cities we compare that
                    //with the list of codes from file
                    compareCountryCodes(countryCodes, countryCodesFromCities, function(deadCodes){
                        console.log("\n" + deadCodes.length + " country codes missing from API and not in the database.");
                    });
                });
                Country.find().count(function (err, count) {    //Check how many countries are in the db
                    if (err) return console.error(err);
                    console.log(count + " countries in database.");
                    if (count === 0) {  //If there are no countries in the db we populate them
                        var countriesToAdd = [];
                        for (i = 0; i < countryCodes.length; i++) {
                            var countryToAdd = {
                                countryCode : countryCodes[i]["alpha-2"],
                                countryName : countryCodes[i].name,
                                __v : 0
                            }
                            countriesToAdd.push(countryToAdd);
                        }
                        Country.collection.insert(countriesToAdd, function(err, doc) {
                            if (err) return console.error(err);
                            console.log(countriesToAdd.length + " countries saved to database.");
                        });
                    } else {
                        console.log("Countries found in database, skipping countries retrival");
                    }

                });

            } catch (error) {
                console.error(error);
                return console.error("country file '" + keysFileName + "' found but is not in JSON form");
            }
        }
    });
}

module.exports = {
    getAndSaveWeather: getAndSaveWeather,
    populateCityData: populateCityData,
    compareCountryCodes: compareCountryCodes,
    checkCountryData: checkCountryData
}
