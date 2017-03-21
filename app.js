var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var cors        = require('cors');
var passport    = require('passport');
var multer      = require('multer');

var jwt         = require('jwt-simple');
var config      = require('./config/database');

var User        = require('./models/userModel');

var auth        = require('./middleware/authentication');

var users       = require('./routes/users');
var pictures    = require('./routes/pictures');
var search      = require('./routes/search');

var session     = require('express-session');

var Picture = require('./models/pictureModel');

require('./config/passport')(passport);

var corsOptions = {
  origin: '*',
  methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'UPDATE'],
  credentials: true
};

app.use(cors(corsOptions));

var port = process.env.PORT || 5000;

var options = { promiseLibrary: require('bluebird') };
mongoose.Promise = global.Promise;
mongoose.connect(config.database, options);

app.set('superSecret', config.secret);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
  secret: 'testauthfacebook',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(morgan('dev'));

app.use(passport.initialize());

app.get('/', function(req, res) {
  res.send('Welcome to Ugram API');
});

app.get('/users', users.getUsers);
app.get('/users/:userId', users.getUserByUserId);
app.post('/users', users.postUser);
app.put('/users/:userId', auth.isAuthenticated, users.putUserId);
app.delete('/users/:userId', auth.isAuthenticated, auth.isCurrentUser, users.deleteByUserId);

app.post('/login', users.login);
app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'public_profile' }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect : '/users',
  failureRedirect : '/',
  session: false
}));

var AWS = require('aws-sdk');
var multerS3 = require('multer-s3');
var path        = require('path');
var http        = require('http');
var fs          = require('fs');

getRandomIntInclusive = function() {
  return Math.floor(Math.random() * (10000 - 1 + 1)) + 1;
}

var multer = require( 'multer' );
var s3 = require( 'multer-storage-s3');
var storage = s3({
  destination : function(req, file, cb) {
    cb( null, './uploads' );
  },
  filename    : function(req, file, cb) {
    var newId = ((getRandomIntInclusive()).toString());
    var tmp = newId + ".png";
    var url = 'https://s3-us-west-2.amazonaws.com/elasticbeanstalk-us-west-2-428121826875/uploads/' + tmp;
    var description = "";
    var mentions = "";
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
      userId: req.params.userId
    });
    newPicture.save();
    cb( null, tmp);
  },
  bucket      : 'elasticbeanstalk-us-west-2-428121826875',
  region      : 'us-west-2'
});
var uploadMiddleware = multer({ storage: storage });
app.post( '/users/:userId/pictures', uploadMiddleware.single( 'file' ), function( req, res, next ) {
  res.send( 'File was uploaded successfully!' );
});


app.get('/pictures', pictures.getPictures);
//app.post('/users/:userId/pictures', auth.isAuthenticated, auth.isCurrentUser, pictures.postPictures);
app.get('/users/:userId/pictures', pictures.getPicturesByUserId);
app.delete('/users/:userId/pictures/:pictureId', auth.isAuthenticated, auth.isCurrentUser, pictures.deletePicture);
app.put('/users/:userId/pictures/:pictureId', auth.isAuthenticated, auth.isCurrentUser, pictures.putPicturebyPictureId);
app.get('/users/:userId/pictures/:pictureId', pictures.getPicturesByPictureId);
app.get('uploads/:pictureId', pictures.getUploads);


app.get('/search/users', search.searchUser);
app.get('/search/tags', search.searchTags);
app.get('/search/description', search.searchDescription);


app.listen(port, function () {
  console.log("Running on http://localhost:" + port + "/");
});
