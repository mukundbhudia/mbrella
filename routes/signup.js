var express = require('express');
var router = express.Router();
var logger = require('../logger');
var url = require("url");
var User = require('../models/User');
var auth = require('../auth');

/* GET signup page. */
router.get('/', function(req, res) {
    var sess = req.session;
    //Get the page the user was previously on
    var backURL = req.header('Referer') || '/';
    var backURLpathname = url.parse(backURL).pathname;
    //Check if user is logged in already
    if (sess.useremail) {
        logger.info("User already logged in, redirecting");
        res.location("/myweather"); //Send user to the homepage as they are already logged in
        res.redirect("/myweather");
    } else {
        //Sign up login page including URL path the user was previously on
        res.render('signup', { title: 'mbrella', backPath: backURLpathname });
    }
});

/* POST signup page. */
router.post('/', function(req, res) {
    var sess = req.session;

    var userFirstName = req.body.userfirstname;
    var userLastName = req.body.userlastname;
    var userEmail = req.body.useremail;
    var userPassword = req.body.userpassword;
    var backPath = req.body.backPath;   //the URL path the user was on prior to logging in

    var userToSignup = new User({
        firstName: userFirstName,
        lastName: userLastName,
        email: userEmail
    });

    if (userFirstName && userLastName && userPassword && userEmail) {

        User.find({email: userEmail}, function(err, doc){
            if (doc[0]) {   //If a result exists then the correct user has logged in
                var foundUser = doc[0].toObject(); //Need to convert to JSON object
                if (doc.length === 1 && userEmail === foundUser.email) {
                    res.render('signup', {
                        title: 'mbrella',
                        signUpInfo: 'The email address ' +
                        userEmail + ' is already taken, please try again.'
                    });
                    logger.info("Sign up unsuccessful, user: " +
                    userEmail + " already exists. Sending back to sign up page...");
                }
            } else {
                auth.generatePassword(userPassword, function(hashedPassword){
                    userToSignup.password = hashedPassword;
                    userToSignup.save(function (err, userToSignup) {
                        if (err) return logger.error(err);
                        logger.info("User: " + userToSignup.getFullName() +
                        " with email: " + userEmail + ' has signed up.');
                        sess.useremail = userToSignup.email;
                        sess.userfirstname = userToSignup.firstName;
                        sess.userID = userToSignup._id;
                        res.location(backPath); //Send user back to where they were
                        res.redirect(backPath);
                    });
                });
            }
        });

    } else {
        res.render('signup', { title: 'mbrella', signUpInfo: 'Please fill out all data' });
    }
});

module.exports = router;
