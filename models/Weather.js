/* Weather model (data set by Open Weather Map). */

var mongoose = require('mongoose');

var weatherSchema = mongoose.Schema({
    dateret: { type: Date, default: Date.now },
    coord: {
        lon: Number, lat: Number},
        sys: {
            message: Number,
            country: String,
            sunrise: Number,
            sunset: Number
        },
        weather: [{
            id: Number,
            main: String,
            description: String,
            icon: String
        }],
        base: String,
        main: {
            temp: Number,
            temp_min: Number,
            temp_max: Number,
            pressure: Number,
            sea_level: Number,
            grnd_level: Number,
            humidity: Number
        },
        wind: {speed: Number, deg: Number},
        clouds: {all: Number},
        dt: Number,
        id: Number,
        name: String,
        cod: Number
    });

    module.exports = mongoose.model('Weather', weatherSchema);
