var async   = require('async');
var jwt     = require('jwt-simple');
var crypto  = require('crypto');
var bcrypt  = require('bcrypt');
var path    = require('path');
var formidable = require('formidable');
var fs      = require('fs');

var config  = require('../config/database');

var User    = require('../models/userModel');
var Picture = require('../models/pictureModel');

/*
* /get /pictures
*/

exports.getPictures = function (req, res) {
  Picture.find({}, function (err, docs) {
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

/*
* /post /users/:userId/pictures
*/

exports.postPictures = function(req, res) {
  if (!(fs.existsSync('routes/uploads/' + req.params.userId))) {
    fs.mkdir('routes/uploads/' + req.params.userId);
  }
  var form = new formidable.IncomingForm();
  form.multiples = false;
  form.uploadDir = path.join(__dirname, '/uploads/' + req.params.userId);
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
  });
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
    res.send(403);
  });
  form.on('end', function() {
    var description = "";
    var mentions = ""
    var tags = new Array;
    if (req.body.description) {description = req.body.description;}
    if (req.body.mentions) {mentions = req.body.mentions;}
    if (req.body.tags) {tags = req.body.tags;}
    console.log(req.body.tags);
    // console.log(req.user);
    var newPicture = new Picture({
      id: "test",
      createdDate: Date.now(),
      description: description,
      mentions: mentions,
      tags: tags,
      url: form.uploadDir,
      userId: req.user.id
    });
    newPicture.save();
  });
  form.parse(req);
  res.send(200);
};



/*
* /get /users/:userId/pictures
*/

exports.getPicturesByUserId = function(req, res) {
  Picture.find({userId: req.params.userId}, function (err, docs) {
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

/*
* /delete /users/:userId/pictures/:pictureId
*/

exports.deletePicture = function(req, res) {
  console.log(req.params.pictureId);
  Picture.findOneAndRemove({'id': req.params.pictureId}, function (err, picture) {
    if (err) {
      console.log(err);
      return res.status(403).send({
        message: 'Picture not found'
      });
    } else {
      res.json(picture);
    }
  });
};


/*
* /put /users/:userId/pictures/:pictureId
*/

exports.putPicturebyPictureId = function(req, res) {
  if (req.params.userId != req.user.id) {
    return res.status(403).send({
      message: 'Editing on forbidden user account for current authentication'
    });
  }
  console.log(req.params.pictureId);
  User.findOne({url: req.params.pictureId}, function (err, picture) {
    if (!picture) {
      return res.status(403).send({
        message: 'Picture ' + req.params.userId + ' does not exist.'
      });
    }
    picture.description = req.body.description;
    picture.mentions = req.body.mentions;
    picture.tags = req.body.tags;
    Picture.updatePicture(req.params.pictureId, picture, {}, function (err, picture) {
      if (err) {
        return res.status(403).send({
          message: 'Can\'t update picture'
        });
      } else {
        return res.status(201).send({
          message: 'Picture updated'
        });
      }
    });
  });
};
