var User    = require('../models/userModel');
var Picture = require('../models/pictureModel');

exports.searchUser = function(req, res) {
  User.find({'id': req.query.data}, function (err, docs) {
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

exports.searchTags = function(req, res) {
  Picture.find({'tags': req.query.data}, function (err, docs) {
    if (!err) {
      var pictures = [];
      for (var i = 0; i < docs.length; i++) {
        pictures.push(docs[i].toDTO());
      }
      res.status(200).send(pictures);
    } else {
      console.error(err);
      res.status(500).send(err);
    }
  });
};

exports.searchDescription = function(req, res) {
  Picture.find({'description': {$regex: ".*" + req.query.data + ".*"}}, function(err, docs) {
    if (!err) {
      var pictures = [];
      for (var i = 0; i < docs.length; i++) {
        pictures.push(docs[i].toDTO());
      }
      res.status(200).send(pictures);
    } else {
      console.error(err);
      res.status(500).send(err);
    }
  });
};
