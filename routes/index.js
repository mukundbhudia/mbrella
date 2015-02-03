var express = require('express');
var session = require('express-session');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    var sess = req.session;
    console.log(sess);
    if (sess.useremail) {
        res.render('index', { title: 'Brella', userEmail: sess.useremail, userFirstName: sess.userfirstname });
    } else {
        res.render('index', { title: 'Brella' });
    }
});

module.exports = router;
