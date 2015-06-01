var app = require('../app');

var request = require('http');
var supertest = require('supertest')(app);
// var api = supertest('http://localhost:3000');

describe("findCity API endpoint", function() {

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
