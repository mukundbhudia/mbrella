var express = require('express');
var router = express.Router();
var logger = require('../logger');
var User = require('../models/User');

/* GET a users favourite weather listing. */
router.get('/', function(req, res) {
    var sess = req.session;
    var userID = sess.userID;
    if (sess.useremail) {
        //If the user has logged on we find their details and their corresponding favorite cities
        res.render('myweather', {
            title: "mbrella",
            userEmail: sess.useremail,
            firstName: sess.userfirstname,
            favCities: sess.userFavCities
        });
    } else {
        res.location('/login?return=' + req.originalUrl);
        res.redirect('/login?return=' + req.originalUrl);
    }
});

module.exports = router;
