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
            var userInfo = doc;
            userInfo.userEmail = sess.useremail;
            res.render('user', doc);
        });
    } else {
        res.location('/login');
        res.redirect('/login');
    }
});

/* POST user edit. */
router.post('/', function(req, res) {
    var sess = req.session;
    var userID = sess.userID;

    var userFirstName = req.body.userfirstname;
    var userLastName = req.body.userlastname;
    var userEmail = req.body.useremail;
    var userPassword = req.body.userpassword;
    var usersCities = req.body.usersCitiesToAdd;

    var citiesToAddArray =[];   //The users favourite cities
    if (usersCities) {
        citiesToAddArray = JSON.parse(usersCities).cities;
    }

    var userToUpdate = {
        firstName: userFirstName,
        lastName: userLastName,
        email: userEmail,
        password: userPassword,
        favCities: citiesToAddArray
    };

    User.findByIdAndUpdate(userID, userToUpdate, function(err, doc) {
        if (err) return console.error(err); //TODO: if doc?
        res.location("/user?updated=true");
        res.redirect("/user?updated=true");
    });
});

module.exports = router;
