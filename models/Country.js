/* Country model. */

var mongoose = require('mongoose');

var countrySchema = mongoose.Schema({
    countryName: String,
    countryCode: String
});

module.exports = mongoose.model('Country', countrySchema);
