var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    var sess = req.session;
    if (sess.useremail) {
        res.render('index', { title: 'mbrella', userEmail: sess.useremail, personalURL: 'myweather', personalMessage: sess.userfirstname });
    } else {
        res.render('index', { title: 'mbrella', personalURL: 'login', personalMessage: 'Log in' });
    }
});

module.exports = router;
