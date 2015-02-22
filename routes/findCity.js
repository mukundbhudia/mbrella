var express = require('express');
var router = express.Router();
var City = require('../models/City');

/* GET findCity. */
router.get('/:cityToFind', function(req, res) {
    var cityToFind = req.params.cityToFind;
    //Execute search only after 3 or more chars entererd
    if (cityToFind.length >= 3) {
        console.log("Searching for cities containing: " + cityToFind + "...");
        //TODO: Check the regex. Needs to allow "City of London" when searching for "london"
        City.find({
             cityName: { $regex: new RegExp("" + cityToFind.toLowerCase(), "i") }
         }, {limit: 10})
         .populate('country')   //TODO: have country.countryName only?
         .select('cityID cityName country').exec(function(err, doc) {
            if (err) return console.error(err);
            if (doc) {
                var foundCities = doc;
                //TODO: Strip out db id and __v items
                console.log("...found " + doc.length + " cities matching " + cityToFind);
                res.json(foundCities);
            } else {
                res.json({error : 'City: ' + cityToFind + ' not found'});
            }
        });
    } else {
        res.json({error : 'City query not long enough, need 3 characters or more'});
    }
});

module.exports = router;
