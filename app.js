var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var lib = require('./lib');

var routes = require('./routes/index');
var users = require('./routes/users');
var login = require('./routes/login');
var signup = require('./routes/signup');
var findCity = require('./routes/findCity');
var weather = require('./routes/weather');
var getWeather = require('./routes/getWeather');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//Set up the express session middleware
//NOTE: this session middleware must be defined before the routes below
app.use(session({
    secret: 'shhhhh1234',
    resave: false,
    saveUninitialized: true
}));
app.use('/', routes);
app.use('/users', users);
app.use('/login', login);
app.use('/signup', signup);
app.use('/findCity', findCity);
app.use('/getWeather', getWeather);
app.use('/weather', weather);

mongoose.connect('mongodb://localhost/brella', function(err){
    if (err) {
        console.log("Connection to DB error: " + err + "\n");
    } else {
        console.log("Connection to DB successful \n");
    }
});

lib.populateCityData();
lib.checkCountryData();

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
