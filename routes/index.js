var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    var sess = req.session;
    if (sess.useremail) {
        res.render('index', { title: 'Brella', userEmail: sess.useremail, personalURL: 'user', personalMessage: sess.userfirstname + "'s weather" });
    } else {
        res.render('index', { title: 'Brella', personalURL: 'login', personalMessage: 'Log in' });
    }
});

module.exports = router;
