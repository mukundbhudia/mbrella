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

    userToSignup.save(function (err, userToSignup) {
        if (err) return console.error(err);
        userToSignup.getFullName();
        // User.findById(userToSignup._id, function (err, usr) {
        //     console.log(usr)
        // })
    });
    //TODO: proper authentication
    if (userFirstName && userPassword) {
        res.location('/');
        res.redirect('/');
        console.log(userToSignup.getFullName() + ' has signed up to Brella');
    } else {
        res.render('signup', { title: 'Node Chat', loginInfo: 'Incorrect username or password' });
    }
});

module.exports = router;
