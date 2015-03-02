var express = require('express');
var router = express.Router();
var url = require("url");
var User = require('../models/User');

/* GET login page. */
router.get('/', function(req, res) {
    var sess = req.session;
    //Get the page the user was previously on
    var backURL = req.header('Referer') || '/';
    var backURLpathname = url.parse(backURL).pathname;
    //Check if user is logged in already
    if (sess.useremail) {
        console.log("User already logged in, redirecting");
        res.location("/myweather"); //Send user to the homepage as they are already logged in
        res.redirect("/myweather");
    } else {
        //Render login page including URL path the user was previously on
        res.render('login', { title: 'Brella', backPath: backURLpathname });
    }
});

/* GET login page. */
router.post('/', function(req, res) {
    var sess = req.session;
    var userEmail = req.body.useremail;
    var userPassword = req.body.userpassword;
    var backPath = req.body.backPath;   //the URL path the user was on prior to logging in

    User.find({email: userEmail, password: userPassword}, function(err, doc){
        if (doc[0]) {   //If a result exists then the correct user has logged in
            var foundUser = doc[0].toObject(); //Need to convert to JSON object
            if (doc.length === 1 && userEmail === foundUser.email && userPassword === foundUser.password) {
                sess.useremail = foundUser.email;
                sess.userfirstname = foundUser.firstName;
                sess.userID = foundUser._id;
                res.location(backPath); //Send user back to where they were
                res.redirect(backPath);
                console.info(userEmail + ' has logged in');
            }
        } else {
            console.log("unsuccessful login, sending back to login page...");
            res.render('login', {
                title: 'Brella',
                loginInfo: 'Incorrect email or password, please try again.' 
            });
        }
    });
});

module.exports = router;
