var express = require('express');
var router = express.Router();
var City = require('../models/City');
var Country = require('../models/Country');

/* GET weather listing. */
router.get('/:cityID', function(req, res) {
    var cityID = req.params.cityID;
    City.findOne({cityID: cityID}, function(err, citydoc) {
        if (citydoc) {
            Country.findOne({countryCode: citydoc.countryCode}, function(err, countrydoc) {
                if (countrydoc) {
                    res.render('weather', {
                        cityName: citydoc.cityName,
                        countryName: countrydoc.countryName,
                        countryCode: citydoc.countryCode,
                        latitude: citydoc.latitude,
                        longtitude: citydoc.longtitude
                    });
                    // res.json(citydoc);
                } else {
                    res.send("Error: Cannot find country code: " + citydoc.countryCode);
                }
            });
        } else {
            res.send("Error: Cannot find city with ID: " + cityID);
        }
    });
});

module.exports = router;
