var async   = require('async');
var jwt     = require('jwt-simple');
var crypto  = require('crypto');
var bcrypt  = require('bcrypt');

var config  = require('../config/database');

var User    = require('../models/userModel');

/*
* /get /users
*/

exports.getUsers = function (req, res) {
  User.find({}, function (err, docs) {
    if (!err) {
      var users = [];
      for (var i = 0; i < docs.length; i++) {
        users.push(docs[i].toDTO());
      }
      res.status(200).send(users);
    } else {
      console.error(err);
      res.status(500).send(err);
    }
  });
};

/*
* /get /users/:userId
*/

exports.getUserByUserId = function (req, res) {
  User.findOne({id: req.params.userId}, function (err, user) {
    if (!err) {
      if (user) {
        return res.status(200).send(user.toDTO(true));
      } else {
        return res.status(400).send({
          message: 'User ' + req.params.userId + ' does not exist.'
        });
      }
    } else {
      res.status(500).send(err);
    }
  });
};

/*
* /post /users/
*/

exports.postUser = function (req, res) {
  if (!req.body.email || !req.body.firstName || !req.body.lastName || !req.body.phoneNumber || !req.body.id || !req.body.password) {
    return res.status(400).send({
      message: 'Missing parameter'
    });
  } else {
    var newUser = new User({
      id: req.body.id,
      password: req.body.password,
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneNumber: req.body.phoneNumber,
      pictureUrl: "",
      registrationDate: Date.now()
    });
    if (req.body.pictureUrl) {
      newUser.pictureUrl = req.body.pictureUrl
    }
    newUser.save(function (err) {
      if (err) {
        console.log(err);
        return res.status(403).send({
          message: 'User already exists'
        });
      }
      return res.status(201).send({
        message: 'Created'
      });
    });
  }
};

/*
* /put /users/:userId
*/

exports.putUserId = function(req, res) {
  if (!req.params.userId) {
    return res.status(400).send({
      message: 'Missing parameter'
    });
  }
  if (req.params.userId != req.user.id) {
    return res.status(403).send({
      message: 'Editing on forbidden user account for current authentication'
    });
  }
  User.findOne({id: req.params.userId}, function (err, user) {
    if (!user) {
      return res.status(403).send({
        message: 'User ' + req.params.userId + ' does not exist.'
      });
    }
    user.email = req.body.email;
    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.phoneNumber = req.body.phoneNumber;
    User.updateUser(req.params.userId, user, {}, function (err, user) {
      if (err) {
        return res.status(403).send({
          message: 'Can\'t update user'
        });
      } else {
        return res.status(201).send({
          message: 'User updated'
        });
      }
    });
  });
};

/*
* /post /login
*/

exports.login = function(req, res) {
  User.findOne({id: req.body.id}, function (err, user) {
    if (err) throw err;
    if (!user) {
      return res.status(403).send({
        message: 'Authentication failed. User not found.'
      });
    } else {
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          var token = jwt.encode(user, config.secret);
          return res.status(200).send({
            token: 'Bearer ' + token
          });
        } else {
          return res.status(403).send({
            message: 'Authentication failed. Wrong password.'
          });
        }
      });
    }
  });
};

/*
* /delete /users/:userId
*/

exports.deleteByUserId = function(req, res) {
  User.findOneAndRemove({'id': req.params.userId}, function (err, picture) {
    if (err) {
      console.log(err);
      return res.status(403).send({
        message: 'User not found'
      });
    } else {
      return res.status(201).send({
        message: 'User deleted'
      });
    }
  });
};
