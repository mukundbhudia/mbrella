var express = require('express');
var router = express.Router();
var User = require('../models/User');

/* GET users listing. */
router.get('/', function(req, res) {
    var sess = req.session;
    var userID = sess.userID;
    if (sess.useremail) {
        //If the user has logged on we find their details and their corresponding favorite cities
        User.findById(userID).populate('favCities').exec(function(err, doc) {
            if (err) return console.error(err);
            var options = {
                path: 'favCities.country',
                model: 'Country'
            };
            User.populate(doc, options, function(err, userInfo){
                userInfo.title = "mbrella";
                res.render('user', userInfo);
            });

        });
    } else {
        res.location('/login?return=' + req.originalUrl);
        res.redirect('/login?return=' + req.originalUrl);
    }
});

/* POST user edit. */
router.post('/', function(req, res) {
    var sess = req.session;
    var userID = sess.userID;

    var userFirstName = req.body.userfirstname;
    var userLastName = req.body.userlastname;
    var userEmail = req.body.useremail;
    var usersCities = req.body.usersCitiesToAdd;

    var citiesToAddArray =[];   //The users favourite cities
    if (usersCities) {
        citiesToAddArray = JSON.parse(usersCities).cities;
    }

    var userToUpdate = {
        firstName: userFirstName,
        lastName: userLastName,
        email: userEmail,
        favCities: citiesToAddArray
    };

    User.findByIdAndUpdate(userID, userToUpdate, function(err, doc) {
        if (err) return console.error(err); //TODO: if doc?
        res.location("/myweather/user?updated=true");
        res.redirect("/myweather/user?updated=true");
    });
});

module.exports = router;
