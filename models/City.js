/* City model. */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var citySchema = mongoose.Schema({
    cityID: Number,
    cityName: String,
    latitude: Number,
    longtitude: Number,
    country: {type: Schema.Types.ObjectId, ref: 'Country'}
});

module.exports = mongoose.model('City', citySchema);
