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

});

describe("getWeather API endpoint", function() {

    it('should return a 404 error when no cityID is entered', function(done) {
        supertest
        .get('/getWeather/')
        .expect(404, done);
    });

    it("should return JSON error when characters are entered as a cityID", function(done) {
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
        supertest
        .get('/getWeather/123456')
        .end(function(err, res) {
            expect(res.status).toBe(404);
            expect(res.type).toBe('application/json');
            expect(res.body.error.message).toEqual("Error: Not found city");
            expect(res.body.error.cod).toEqual("404");
            done();
        });
    }, 8000);   //We give it a bit longer as its accessing HTTP API

});
