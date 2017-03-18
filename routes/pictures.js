var async   = require('async');
var jwt     = require('jwt-simple');
var crypto  = require('crypto');
var bcrypt  = require('bcrypt');
var path    = require('path');
var formidable = require('formidable');
var fs      = require('fs');
var multer  = require('multer');

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
* /get /uploads/:pictureId
*/

exports.getUploads = function(req, res) {
  fs.createReadStream(path.join('./uploads/', req.params.pictureId)).pipe(res);
};

/*
* /post /users/:userId/pictures
*/

getRandomIntInclusive = function() {
  return Math.floor(Math.random() * (10000 - 1 + 1)) + 1;
}

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
    var newId = (getRandomIntInclusive()).toString();
    var url = 'http://localhost:5000/uploads/' + newId;
    var description = "";
    var mentions = "";
    var tags = new Array;
    console.log("ici");
    if (req.body.description) {description = req.body.description;}
    if (req.body.mentions) {mentions = req.body.mentions;}
    if (req.body.tags) {tags = req.body.tags;}
    console.log("ici");
    var newPicture = new Picture({
      id: newId,
      createdDate: Date.now(),
      description: description,
      mentions: mentions,
      tags: tags,
      url: url,
      userId: req.user.id
    });
    console.log(newPicture);
    newPicture.save();
    callback(null, newId);
  }
});

var upload = multer({storage : storage}).single('file');

exports.postPictures = function(req, res) {
  upload(req,res,function(err) {
    if(err) {
      return res.status(201).send({
        message: 'Error uploading file'
      });
    }
    res.end("File is uploaded");
  });
};

exports.postPicturesTmp = function(req, res) {
  if (!(fs.existsSync('http://localhost:5000/uploads/' + req.params.userId))) {
    fs.mkdir('http://localhost:5000/uploads/' + req.params.userId);
  }
  var form = new formidable.IncomingForm();
  form.parse(req);
  form.on('fileBegin', function (name, file) {
    file.path = 'http://localhost:5000/uploads/' + req.params.userId + '/' + file.name;
  });
  form.on('file', function (name, file) {
    console.log(file.name);
    var url = 'http://localhost:5000/uploads/' + req.params.userId + '/' + file.name;
    var description = "";
    var mentions = "";
    var newId = getRandomIntInclusive();
    var tags = new Array;
    if (req.body.description) {description = req.body.description;}
    if (req.body.mentions) {mentions = req.body.mentions;}
    if (req.body.tags) {tags = req.body.tags;}
    var newPicture = new Picture({
      id: newId,
      createdDate: Date.now(),
      description: description,
      mentions: mentions,
      tags: tags,
      url: url,
      userId: req.user.id
    });
    newPicture.save();
    console.log(newPicture);
  });
  return res.status(201).send({
    message: 'Picture updated'
  });
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
  Picture.findOne({id: req.params.pictureId}, function (err, picture) {
    if (!picture) {
      return res.status(403).send({
        message: 'Picture ' + req.params.pictureId + ' does not exist.'
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
