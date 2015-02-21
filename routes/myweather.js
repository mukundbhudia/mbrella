var express = require('express');
var router = express.Router();
var User = require('../models/User');

/* GET a users favourite weather listing. */
router.get('/', function(req, res) {
    var sess = req.session;
    var userID = sess.userID;
    if (sess.useremail) {
        //If the user has logged on we find their details and their corresponding favorite cities
        User.findById(userID).populate('favCities').exec(function(err, doc) {
            if (err) return console.error(err);
            var userInfo = doc;
            userInfo.userEmail = sess.useremail;
            userInfo.title = "Brella";
            res.render('myweather', userInfo);
        });
    } else {
        res.location('/login');
        res.redirect('/login');
    }
});

module.exports = router;
