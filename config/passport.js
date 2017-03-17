var JwtStrategy         = require('passport-jwt').Strategy;
var ExtractJwt          = require('passport-jwt').ExtractJwt;
var FacebookStrategy    = require('passport-facebook').Strategy;
var jwt                 = require('jwt-simple');

var User             = require('../models/userModel');

var config          = require('../config/database');
var configAuth      = require('../config/auth');

module.exports = function(passport) {

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  var opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
  opts.secretOrKey = config.secret;
  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findOne({id: jwt_payload.id}, function(err, user) {
      if (err) {
        return done(err, false);
      }
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    });
  }));

  passport.use('facebook', new FacebookStrategy({
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL,
    profileFields: ['id', 'displayName', 'email', 'first_name', 'last_name', 'profileUrl'],
  },  function(access_token, refresh_token, profile, done) {
    process.nextTick(function() {
      User.findOne({id: profile.name.givenName}, function(err, user) {
        if (err) {
          return done(err);
        }
        if (user) {
          return done(null, user);
        } else {
          var newUser = new User();
          newUser.id = profile.name.givenName;
          newUser.email = profile.emails[0].value;
          newUser.firstName  = profile.name.givenName;
          newUser.lastName = profile.name.familyName;
          newUser.phoneNumber  = 0;
          newUser.pictureUrl  = profile.profileUrl;
          newUser.registrationDate  = Date.now();
          //newUser.access_token = access_token;
          newUser.save(function(err) {
            if (err) {throw err;}
            return done(null, newUser);
          });
        }
      });
    });
  }));
};
