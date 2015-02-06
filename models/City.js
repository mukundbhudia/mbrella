/* City model. */

var mongoose = require('mongoose');

var citySchema = mongoose.Schema({
    cityID: Number,
    cityName: String,
    latitude: Number,
    longtitude: Number,
    countryCode: String
});

module.exports = mongoose.model('City', citySchema);
