var app = require('../app');

var request = require('http');
var supertest = require('supertest')(app);

describe("findCity API endpoint", function() {

    it("should return a 404 error when no city is entered", function(done) {
        supertest
        .get('/findCity/')
        .expect(404, done);
    });

    it("should return JSON error when less than three characters are entered", function(done) {
        supertest
        .get('/findCity/ha')
        .end(function(err, res) {
            expect(res.status).toBe(200);
            expect(res.type).toBe('application/json');
            expect(res.body.error).toEqual(
                "City query not long enough, need 3 characters or more");
            done();
        });
    });

    it('should return empty array for non-existant city', function(done){
        supertest
        .get('/findCity/testfakecity')
        .end(function(err, res) {
            expect(res.status).toBe(200);
            expect(res.type).toBe('application/json');
            expect(res.body).toEqual([]);
            done();
        });
    });

    it('should return one city named: Dubai for the entered text: dubai', function(done){
        supertest
        .get('/findCity/dubai')
        .end(function(err, res) {
            expect(res.status).toBe(200);
            expect(res.type).toBe('application/json');
            expect(res.body.length).toBe(1);
            expect(res.body[0].cityName).toEqual("Dubai");
            done();
        });
    });

    it("should return five cities for the entered text: 'carac'", function(done){
        supertest
        .get('/findCity/carac')
        .end(function(err, res) {
            expect(res.status).toBe(200);
            expect(res.type).toBe('application/json');
            expect(res.body.length).toBe(6);
            done();
        });
    });

    it("should return a maximum of 10 cities for short city text " +
     " such as 'car'", function(done){
        supertest
        .get('/findCity/car')
        .end(function(err, res) {
            expect(res.status).toBe(200);
            expect(res.type).toBe('application/json');
            expect(res.body.length).toBe(10);
            done();
        });
    });

});

describe("getWeather API endpoint", function() {

    it('should return a 404 error when no cityID is entered', function(done) {
        supertest
        .get('/getWeather/')
        .expect(404, done);
    });

    it("should return JSON error when alphabetic characters " +
     " are entered as a cityID", function(done) {
        var characterCityID = "abcdefg";
        supertest
        .get('/getWeather/' + characterCityID)
        .end(function(err, res) {
            expect(res.status).toBe(404);
            expect(res.type).toBe('application/json');
            expect(res.body.error).toEqual(
                "The city ID: " + characterCityID + " is not a number");
            done();
        });
    });

    it("should return JSON error when special characters " +
     " are entered as a cityID", function(done) {
        var specialCharacterCityID = "*^&";
        supertest
        .get('/getWeather/' + specialCharacterCityID)
        .end(function(err, res) {
            expect(res.status).toBe(404);
            expect(res.type).toBe('application/json');
            expect(res.body.error).toEqual(
                "The city ID: " + specialCharacterCityID + " is not a number");
            done();
        });
    });

    it("should return a 400 error when invalid characters " +
      " are entered as a city", function(done) {
        supertest
        .get('/getWeather/!@£^£%^$%^')
        .expect(400, done);
    });

    it("should return JSON error when alpha-numeric " +
    "characters are entered as a cityID", function(done) {
        var characterCityID = "abcdefg123456";
        supertest
        .get('/getWeather/' + characterCityID)
        .end(function(err, res) {
            expect(res.status).toBe(404);
            expect(res.type).toBe('application/json');
            expect(res.body.error).toEqual(
                "The city ID: " + characterCityID + " is not a number");
            done();
        });
    });

    it("should return JSON error when a non-existant cityID is entered", function(done) {
        var nonExistantCityID = '123456';
        supertest
        .get('/getWeather/' + nonExistantCityID)
        .end(function(err, res) {
            expect(res.status).toBe(404);
            expect(res.type).toBe('application/json');
            expect(res.body.error).toEqual("The city with ID " + nonExistantCityID +
            " does not exist in DB");
            done();
        });
    });

    it("should return JSON weather data for correct city", function(done) {
        var cityID = 2641181; //cityID for Norwich
        supertest
        .get('/getWeather/' + cityID)
        .end(function(err, res) {
            expect(res.status).toBe(200);
            expect(res.type).toBe('application/json');
            expect(res.body.id).toEqual(cityID);
            expect(res.body.name).toEqual("Norwich");
            done();
        });
    }, 8000);   //We give it a bit longer as it may access the OWM API

});
