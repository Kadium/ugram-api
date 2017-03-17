var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var cors        = require('cors');
var passport    = require('passport');
var multer      = require('multer');

var jwt         = require('jwt-simple');
var config      = require('./config/database');
var configAuth  = require('./config/auth');

var User        = require('./models/userModel');
var Picture     = require('./models/pictureModel');

var auth        = require('./middleware/authentication');

var users       = require('./routes/users');
var pictures    = require('./routes/pictures');
var search      = require('./routes/search');

var passport          = require('passport')
var FacebookStrategy  = require('passport-facebook').Strategy;
var session           = require('express-session');

//var AWS          = require('aws-sdk');
// Create an S3 client
//var s3 = new AWS.S3();
// AWS.config.update({
//     region: "us-west-2",
//     endpoint: "http://localhost:5000"
// });

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
// app.use(session({
//   secret: 'testauthfacebook',
//   resave: true,
//   saveUninitialized: true
// }));
// app.use(passport.initialize());
// app.use(passport.session());

app.use(morgan('dev'));

// passport.serializeUser(function (user, done) {
//   done(null, user.id);
// });
//
// passport.deserializeUser(function (id, done) {
//   User.findById(id, function (err, user) {
//     done(err, user);
//   });
// });
//
// passport.use('facebook', new FacebookStrategy({
//   clientID: configAuth.facebookAuth.clientID,
//   clientSecret: configAuth.facebookAuth.clientSecret,
//   callbackURL: configAuth.facebookAuth.callbackURL,
//   profileFields: ['id', 'displayName', 'email', 'first_name', 'last_name', 'profileUrl'],
// },  function(access_token, refresh_token, profile, done) {
//   process.nextTick(function() {
//     console.log(profile);
//     User.findOne({ 'id' : profile.givenName }, function(err, user) {
//       if (err) {
//         return done(err);
//       }
//       if (user) {
//         return done(null, user);
//       } else {
//         var newUser = new User();
//         newUser.id = profile.name.givenName;
//         newUser.access_token = access_token;
//         newUser.password = "test";
//         newUser.email = profile.name.emails;
//         newUser.firstName  = profile.name.givenName;
//         newUser.pictureUrl  = profile.name.pictureUrl;
//         newUser.phoneNumber  = 0505050505;
//         newUser.registrationDate  = Date.now();
//         newUser.lastName = profile.name.familyName;
//         console.log(newUser);
//         newUser.save(function(err) {
//           if (err) {throw err;}
//           return done(null, newUser);
//         });
//       }
//     });
//   });
// }));

// app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'public_profile' }));
//
// app.get('/auth/facebook/callback', passport.authenticate('facebook', {
//   successRedirect : '/users/test',
//   failureRedirect : '/users/charlestau2',
//   session: false
// }));

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
