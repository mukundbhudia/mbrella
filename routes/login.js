var express = require('express');
var router = express.Router();

/* GET login page. */
router.get('/', function(req, res) {
  res.render('login', { title: 'Brella' });
});

/* GET login page. */
router.post('/', function(req, res) {
    // sess = req.session;
    var userName = req.body.username;
    var userPassword = req.body.userpassword;
    // sess.username = userName;
    // sess.password = userPassword;
    console.log('username and password are:' + userName + " and " + userPassword);
    //TODO: proper authentication
    if (userName && userPassword) {
        // res.cookie('loginStatus', sess.userstatus);
        res.location('/');
        res.redirect('/');
        console.log(userName + ' has logged in');
    } else {
        res.render('login', { title: 'Node Chat', loginInfo: 'Incorrect username or password' });
    }
});

module.exports = router;
