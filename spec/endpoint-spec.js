var app = require('../app');

var request = require('http');
var supertest = require('supertest')(app);
// var api = supertest('http://localhost:3000');

describe("findCity API endpoint", function() {

    it("should return a 404 error when no city is entered", function(done) {
        supertest
        .get('/findCity/')
        .set('Accept', 'application/json')
        .expect(404, done);
    });

    it("should return JSON error when less than three characters are entered", function(done) {
        supertest
        .get('/findCity/ha')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
            expect(res.body.error).toEqual(
                "City query not long enough, need 3 characters or more");
            done();
        });
    });

    it('should return empty array for non-existant city', function(done){
        supertest
        .get('/findCity/testfakecity')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
            expect(res.body).toEqual([]);
            done();
        });
    });

    it('should return one city named: Dubai for the entered text: dubai', function(done){
        supertest
        .get('/findCity/dubai')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
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
        .set('Accept', 'application/json')
        .expect(404, done);
    });

    it("should return JSON error when characters are entered as a cityID", function(done) {
        var characterCityID = "abcdefg";
        supertest
        .get('/getWeather/' + characterCityID)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
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
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
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
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end(function(err, res) {
            expect(res.status).toBe(404);
            expect(res.type).toBe('application/json');
            expect(res.body.error.message).toEqual("Error: Not found city");
            expect(res.body.error.cod).toEqual("404");
            done();
        });
    }, 8000);   //We give it a bit longer as its accessing HTTP API

});
