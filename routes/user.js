var express = require('express');
var router = express.Router();
var User = require('../models/User');

/* GET users listing. */
router.get('/:userID', function(req, res) {
    var sess = req.session;
    var userID = req.params.userID;
    if (sess.useremail) {
        User.findById(userID, function(err, doc) {
            res.render('user', doc);
        });
    } else {
        res.location('/login');
        res.redirect('/login');
    }
});

module.exports = router;
