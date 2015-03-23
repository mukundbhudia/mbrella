var express = require('express');
var router = express.Router();
var User = require('../models/User');
var auth = require('../auth');

/* GET change password route. */
router.get('/', function(req, res) {
    var sess = req.session;
    var userID = sess.userID;
    if (sess.useremail) {
        //If the user has logged on we find their details and their corresponding favorite cities
        User.findById(userID, function(err, userInfo) {
            if (err) return console.error(err);
            userInfo.title = "mbrella";
            res.render('changePassword', userInfo);
        });
    } else {    //Otherwise we ask them to login
        res.location('/login?return=' + req.originalUrl);
        res.redirect('/login?return=' + req.originalUrl);
    }
});

/* POST user edit. */
router.post('/', function(req, res) {
    var sess = req.session;
    var userID = sess.userID;

    var userOldPassword = req.body.oldpassword;
    var userNewPassword = req.body.newpassword;
    //First we find the logged in users data
    User.findById(userID, function(err, doc){
        var userToUpdate = doc;
        //Check the old password matches the password on record for the user
        auth.checkPassword(userOldPassword, doc.password, function(passwordRes) {
            if (passwordRes === true) {     //If its correct we generate a new password
                auth.generatePassword(userNewPassword, function(hashedPassword) {
                    userToUpdate.password = hashedPassword;
                    //We then update the users data including their new password
                    //TODO: Do we need to update the entire user JSON document?
                    User.findByIdAndUpdate(userID, userToUpdate, function(err, doc) {
                        if (err) return console.error(err);
                        console.log("Password for user " + doc.email +
                        " changed successfully.");
                        //We notify the user the password has been changed
                        res.render('changePassword', {
                            title: "mbrella",
                            firstName: doc.firstName,
                            info: "Password changed successfully."
                        });
                    });
                });
            } else {    //This is if the old password entered is incorrect
                console.log("Password for user " + doc.email + " not changed. " +
                "Old password does not match database.");
                res.render('changePassword', {
                    title: "mbrella",
                    firstName: doc.firstName,
                    error: "The old password entered was incorrect, please try again."
                });
            }
        });
    });
});

module.exports = router;
