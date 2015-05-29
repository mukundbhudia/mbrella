var express = require('express');
var router = express.Router();
var logger = require('../logger');

/* GET logout page. */
router.get('/', function(req, res) {
    var sess = req.session;
    var userToLogOut = sess.userfirstname;
    sess.destroy(function(err) {
        if (err) return logger.error(err);
        logger.info("User: " + userToLogOut + " has logged out.")
        res.location('/');
        res.redirect('/');
    });
});


module.exports = router;
