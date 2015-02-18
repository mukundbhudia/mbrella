var express = require('express');
var router = express.Router();
var User = require('../models/User');

/* GET users listing. */
router.get('/:userID', function(req, res) {
    var sess = req.session;
    var userID = req.params.userID;
    if (sess.useremail) {
        User.findById(userID, function(err, doc) {
            if (err) return console.error(err);
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

    var userToUpdate = {
        firstName: userFirstName,
        lastName: userLastName,
        email: userEmail,
        password: userPassword
    };

    User.findByIdAndUpdate(userID, userToUpdate, function(err, doc) {
        if (err) return console.error(err); //TODO: if doc?
        res.location('/user/' + userID + "?updated=true");
        res.redirect('/user/' + userID + "?updated=true");
    });
});

module.exports = router;
