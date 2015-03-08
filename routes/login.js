var express = require('express');
var router = express.Router();
var url = require("url");
var User = require('../models/User');
var auth = require('../auth');

/* GET login page. */
router.get('/', function(req, res) {
    var sess = req.session;
    //Get the page the user was previously on
    var backURL = req.query.return || url.parse(req.header('Referer')).pathname || '/';
    //Check if user is logged in already
    if (sess.useremail) {
        console.log("User already logged in, redirecting");
        res.location("/myweather"); //Send user to the homepage as they are already logged in
        res.redirect("/myweather");
    } else {
        //Render login page including URL path the user was previously on
        res.render('login', { title: 'Brella', backPath: backURL });
    }
});

/* GET login page. */
router.post('/', function(req, res) {
    var sess = req.session;
    var userEmail = req.body.useremail;
    var userPassword = req.body.userpassword;
    var backPath = req.body.backPath;   //the URL path the user was on prior to logging in

    User.find({email: userEmail}, function(err, doc){
        if (doc[0]) {   //If a result exists then the correct user has logged in
            var foundUser = doc[0].toObject(); //Need to convert to JSON object
            //First we check that only one user exists with the username
            if (doc.length === 1 && userEmail === foundUser.email) {
                //Then we authenticate the user hashing the given password and comparing it
                //to the hased pasword stored in the database
                auth.checkPassword(userPassword, foundUser.password, function(passRes) {
                    if (passRes === true) { //hashed passwords are the same
                        sess.useremail = foundUser.email;
                        sess.userfirstname = foundUser.firstName;
                        sess.userID = foundUser._id;
                        res.location(backPath); //Send user back to where they were
                        res.redirect(backPath);
                        console.info(userEmail + ' has logged in');
                    } else {
                        console.log("unsuccessful login (wrong password for user)," +
                        " sending back to login page...");
                        res.render('login', {
                            title: 'Brella',
                            loginInfo: 'Incorrect password, please try again.'
                        });
                    }
                });

            } else {
                //Technically this case should not occur as the email address for a user is
                //checked for uniqueness upon sign up
                console.error("unsuccessful login, multiple user found with email: " + userEmail);
            }

        } else { //No user matches the db query using the given email address
            console.log("unsuccessful login (user not exist), sending back to login page...");
            res.render('login', {
                title: 'Brella',
                loginInfo: "The given email does not exist in our records, please " +
                 " check the email address and try again."
            });
        }
    });
});

module.exports = router;
