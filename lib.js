//Library functions for Brella

var http = require('http');
var City = require('./models/City');

module.exports = {

    /*
        Accesses Open Weather Map URL to obtain a city text file.
        Goes through each line to extract the city info, converts to JSON.
        Then bulk insterts to db. Only does so if there are no cities already
        in the db.
    */
    populateCityData: function() {

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
                                    countryCode: cityLine[4]
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

}
