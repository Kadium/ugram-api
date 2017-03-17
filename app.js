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

var AWS          = require('aws-sdk');
//Create an S3 client
//var s3 = new AWS.S3();
AWS.config.update({
  region: "us-west-2",
  endpoint: "http://localhost:5000"
});

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
app.delete('/users/:userId', users.deleteByUserId);

app.post('/login', users.login);
app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'public_profile' }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect : '/users',
  failureRedirect : '/',
  session: false
}));

app.get('/pictures', pictures.getPictures);
app.post('/users/:userId/pictures', auth.isAuthenticated, auth.isCurrentUser, pictures.postPictures);
app.get('/users/:userId/pictures', pictures.getPicturesByUserId);
app.delete('/users/:userId/pictures/:pictureId', auth.isAuthenticated, auth.isCurrentUser, pictures.deletePicture);
app.put('/users/:userId/pictures/:pictureId', auth.isAuthenticated, auth.isCurrentUser, pictures.putPicturebyPictureId)

app.get('/search/users', search.searchUser);
app.get('/search/tags', search.searchTags);
app.get('/search/description', search.searchDescription);


app.listen(port, function () {
  console.log("Running on http://localhost:" + port + "/");
});
