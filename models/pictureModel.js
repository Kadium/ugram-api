var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var modelHelpers = require('./modelHelpers.js');
var config      = require('../config/database');

var PictureSchema = new Schema({
  id: {type: Number},
  createdDate: {type: String, required: true},
  description: {type: String, required: false},
  mentions: {type: String, required: false},
  tags: {type: Array, required: false},
  url: {type: String, required: true},
  userId: {type: String, required: true}
}, {
  versionKey: false
});

PictureSchema.methods.toDTO = function() {
  var obj = this.toJSON();
  var dto = {
    id: obj.id,
    createdDate: obj.createdDate,
    description: obj.description,
    mentions: obj.mentions,
    tags: obj.tags,
    url: obj.url,
    userId: obj.userId
  };
  return dto;
};

PictureSchema.method('toJSON', modelHelpers.toJSON);

PictureSchema.pre('save', function (next) {
  return next();
});

var Picture = module.exports = mongoose.model('Picture', PictureSchema);

module.exports.getNextSequence = function(oldId) {
  var ret = db.counters.findAndModify(
    {
      query: {id: oldId},
      update: { $inc: { seq: 1 } },
      new: true
    }
  );
  return ret.seq;
}


module.exports.updatePicture = function (_id, picture, options, callback) {
  var query = {_id: picture._id};
  var update = {
    id: picture.id,
    description: picture.description,
    mentions: picture.mentions,
    tags: picture.tags
  };
  Picture.findOneAndUpdate(query, update, options, callback);
};
