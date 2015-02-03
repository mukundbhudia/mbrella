var express = require('express');
var router = express.Router();
var User = require('../models/User');

/* GET signup page. */
router.get('/', function(req, res) {

    User.find().count(function (err, count) {
        if (err) return console.error(err);
        console.log(count + " users already exist.");
    });

  res.render('signup', { title: 'Brella' });
});

/* GET signup page. */
router.post('/', function(req, res) {
    var userFirstName = req.body.userfirstname;
    var userLastName = req.body.userlastname;
    var userEmail = req.body.useremail;
    var userPassword = req.body.userpassword;

    var userToSignup = new User({
        firstName: userFirstName,
        lastName: userLastName,
        email: userEmail,
        password: userPassword
    });

    if (userFirstName && userLastName && userPassword && userEmail) {

        User.find({email: userEmail}, function(err, doc){
            console.log(doc);
            if (doc[0]) {   //If a result exists then the correct user has logged in
                var foundUser = doc[0].toObject(); //Need to convert to JSON object
                if (doc.length === 1 && userEmail === foundUser.email) {
                    res.render('signup', { title: 'Brella', signUpInfo: 'The email address ' + userEmail + ' is already taken, please try again.' });
                    console.log("Sign up unsuccessful, user: " + userEmail + " already exists. Sending back to sign up page...");
                }
            } else {
                userToSignup.save(function (err, userToSignup) {
                    if (err) return console.error(err);
                    User.findById(userToSignup._id, function (err, usr) {
                        console.log(usr)
                    })
                    console.log("User: " + userToSignup.getFullName() + " with email: " + userEmail + ' has signed up.');
                    res.location('/');
                    res.redirect('/');
                });
            }
        });

    } else {
        res.render('signup', { title: 'Node Chat', signUpInfo: 'Please fill out all data' });
    }
});

module.exports = router;
