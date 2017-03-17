var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var modelHelpers = require('./modelHelpers.js');

var UserSchema = new Schema({
  id: {type: String, required: false},
  password: {type: String, required: false},
  email: {type: String, required: false},
  firstName: {type: String, required: false},
  lastName: {type: String, required: false},
  phoneNumber: {type: Number, required: false},
  pictureUrl: {type: String},
  registrationDate: {type: Date, required: false}
}, {
  versionKey: false
});

UserSchema.methods.toDTO = function() {
  var obj = this.toJSON();
  var dto = {
    id: obj.id.toString(),
    email: obj.email,
    firstName: obj.firstName,
    lastName: obj.lastName,
    firstName: obj.firstName,
    phoneNumber: obj.phoneNumber,
    registrationDate: obj.registrationDate,
    pictureUrl: obj.pictureUrl
  };
  return dto;
};

UserSchema.method('toJSON', modelHelpers.toJSON);

UserSchema.pre('save', function (next) {
  var user = this;
  if (this.isModified('password') || this.isNew) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        return next(err);
      }
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) {
          return next(err);
        }
        user.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});

UserSchema.methods.comparePassword = function (passw, cb) {
  bcrypt.compare(passw, this.password, function (err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.updateUser = function (_id, user, options, callback) {
  var query = {_id: user._id};
  var update = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    id: user.id,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    pictureUrl: user.pictureUrl
  };
  User.findOneAndUpdate(query, update, options, callback);
};
