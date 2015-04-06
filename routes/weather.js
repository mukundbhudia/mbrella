var express = require('express');
var router = express.Router();
var City = require('../models/City');

/* GET weather listing. */
router.get('/', function(req, res) {
    var sess = req.session;
    var weatherViewToSend = {
        title: "mbrella"
    };
    if (sess.useremail) {
        weatherViewToSend.userEmail = sess.useremail;
        weatherViewToSend.firstName = sess.userfirstname;
    }
    res.render('weather', weatherViewToSend);
});

module.exports = router;
