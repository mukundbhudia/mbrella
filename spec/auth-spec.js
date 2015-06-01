var auth = require('../auth');

//To test the Authentication library that uses bcrypt
describe("Authentication library", function() {

    var testPassword = "P@ssw0rd1234";
    var testHashPassword = null;    //The generatePassword call will create this hash

    it("should generate a hashed password from plaintext", function(done) {
        auth.generatePassword(testPassword, function(password) {
            testHashPassword = password;    //Remember the hash for later comprison
            expect(password).not.toBe(testPassword);
            done();
        });
    });

    it("should compare a hashed password with a plaintext", function(done) {
        auth.checkPassword(testPassword, testHashPassword, function(res) {
            expect(res).toBe(true);
            done();
        });
    });

    it("should reject an incorrect hashed password", function(done) {
        auth.checkPassword(testPassword, "rubbishHash", function(res) {
            expect(res).toBe(false);
            done();
        });
    });

});
