var async       = require('async');
var jwt         = require('jwt-simple');
var config      = require('../config/database');
var Picture     = require('../models/pictureModel');


getRandomIntInclusive = function() {
    return Math.floor(Math.random() * (10000 - 1 + 1)) + 1;
}

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

exports.postPictures = function( req, res, next ) {
    if (req.file) {
        var description = "";
        if (req.body.description !== undefined) {
          description = req.body.description;
        }

        var mentions = [];
        if (req.body.mentions !== undefined) {
            mentions = req.body.mentions;
        }

        var tags = [];
        if (req.body.tags !== undefined) {
            tags = req.body.tags;
        }

        var newPicture = new Picture({
            createdDate: Date.now(),
            description: description,
            mentions: mentions,
            tags: tags,
            url: req.file.location,
            userId: req.params.userId
        });
        newPicture.save();

        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ successMessage: 'Image provided', data: newPicture }));
    } else {
        res.status(422);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ errorMessage: 'No image provided' }));
    }
}

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
* /get /users/:userId/pictures/:pictureId
*/

exports.getPicturesByPictureId = function(req, res) {
  Picture.find({'_id': req.params.pictureId}, function (err, docs) {
    if (!err) {
      var pictures;
      for (var i = 0; i < docs.length; i++) {
          pictures = docs[i].toDTO();
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
  Picture.findOneAndRemove({'_id': req.params.pictureId}, function (err, picture) {
    if (err) {
      console.log(err);
      return res.status(403).send({
        message: 'Picture not found'
      });
    } else {
      res.send(JSON.stringify({message: 'Your picture has been deleted.'}));
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
