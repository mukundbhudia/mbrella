var express = require('express');
var router = express.Router();

/* GET logout page. */
router.get('/', function(req, res) {
    var sess = req.session;
    var userToLogOut = sess.userfirstname;
    sess.destroy(function(err) {
        if (err) return console.error(err);
        console.log("User: " + userToLogOut + " has logged out.")
        res.location('/');
        res.redirect('/');
    });
});


module.exports = router;
