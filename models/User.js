/* User model. */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    favCities: [{type: Schema.Types.ObjectId, ref: 'City'}]
});

//TODO: Consider using a virtual instead of function?
userSchema.methods.getFullName = function() {
    var fullName = this.firstName + " " + this.lastName;
    return fullName;
};

module.exports = mongoose.model('User', userSchema);
