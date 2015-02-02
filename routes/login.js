var express = require('express');
var router = express.Router();
var User = require('../models/User');

/* GET login page. */
router.get('/', function(req, res) {
  res.render('login', { title: 'Brella' });
});

/* GET login page. */
router.post('/', function(req, res) {
    // sess = req.session;
    var userEmail = req.body.useremail;
    var userPassword = req.body.userpassword;
    console.log(req.body);
    // sess.userEmail = userEmail;
    // sess.password = userPassword;
    User.find({email: userEmail, password: userPassword}, function(err, doc){
        console.log(doc);
        if (doc[0]) {
            var foundUser = doc[0].toObject();
            if (doc.length === 1 && userEmail === foundUser.email && userPassword === foundUser.password) {
                // res.cookie('loginStatus', sess.userstatus);
                res.location('/');
                res.redirect('/');
                console.log(userEmail + ' has logged in');
            }
        } else {
            console.log("unsuccessful login, sending back to login page...");
            res.render('login', { title: 'Brella', loginInfo: 'Incorrect email or password' });
        }
    });
});

module.exports = router;
