/* City model. */

var mongoose = require('mongoose');

var citySchema = mongoose.Schema({
    cityID: String,
    cityName: String,
    latitude: String,
    longtitude: String,
    countryCode: String
});

module.exports = mongoose.model('City', citySchema);
