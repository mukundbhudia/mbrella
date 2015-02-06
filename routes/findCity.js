var express = require('express');
var router = express.Router();
var City = require('../models/City');

/* GET findCity. */
router.get('/:cityToFind', function(req, res) {
    //TODO: Execute search only after 3 or more chars entererd?
    var cityToFind = req.params.cityToFind;
    console.log("Searching for cities containing: " + cityToFind + "...");
    //TODO: Check the regex
    City.find({cityName: { $regex: new RegExp("^" + cityToFind.toLowerCase(), "i") }}, function(err, doc) {
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
});

module.exports = router;
