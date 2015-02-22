var express = require('express');
var router = express.Router();
var City = require('../models/City');
// var Country = require('../models/Country');

/* GET weather listing. */
router.get('/:cityID', function(req, res) {
    var cityID = req.params.cityID;
    City.findOne({cityID: cityID}).populate('country').exec(function(err, citydoc) {
        if (citydoc) {
            console.log(citydoc);
            var sess = req.session;
            var weatherToSend = {
                title: "Brella",
                cityID : cityID,
                cityName: citydoc.cityName,
                countryName: citydoc.country.countryName,
                countryCode: citydoc.countryCode,
                latitude: citydoc.latitude,
                longtitude: citydoc.longtitude
            };
            if (sess.useremail) {
                weatherToSend.userEmail = sess.useremail;
                weatherToSend.personalURL = 'user';
                weatherToSend.personalMessage = sess.userfirstname + "'s weather";
            } else {
                weatherToSend.personalURL = 'login';
                weatherToSend.personalMessage = "Log in";
            }
            res.render('weather', weatherToSend);
        } else {
            res.send("Error: Cannot find city with ID: " + cityID);
        }
    });
});

module.exports = router;
