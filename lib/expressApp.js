const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieEncrypter = require('cookie-encrypter');
const handlers = require('./handlers');

const expressApp = express();
const secret = 'desk-demons-postmit-step-batch-7';

expressApp.engine('pug', require('pug').__express);
expressApp.set('view engine', 'pug');

// eslint-disable-next-line no-process-env
expressApp.use(morgan('dev', { skip: () => process.env.NODE_ENV === 'test' }));
expressApp.use(cookieParser(secret));
expressApp.use(cookieEncrypter(secret));
expressApp.use(express.json());
expressApp.use(express.urlencoded({ extended: true }));
expressApp.use(express.static('public'));
expressApp.use(bodyParser.json({ extended: true }));
expressApp.use(function (request, response, next) {
  const id = request.cookies.userId;
  request.cookies.userId = Number(id);
  next();
});

const isUserLoggedIn = function (request, response, next) {
  const userId = request.cookies.userId;
  if (userId) {
    next();
    return;
  }
  response.redirect('/');
};

expressApp.get('/', handlers.serveIndexPage);
expressApp.get('/auth', handlers.authorizeUser);
expressApp.get('/callback', handlers.handleUserProfile);
expressApp.get('/home', isUserLoggedIn, handlers.serveHome);
expressApp.get('/profile', isUserLoggedIn, handlers.serveProfilePage);
expressApp.get(
  '/user/:username',
  isUserLoggedIn,
  handlers.serveSearchedUserProfile
);
expressApp.get(
  '/user/:username/following',
  isUserLoggedIn,
  handlers.serveFollowingList
);
expressApp.get(
  '/user/:username/followers',
  isUserLoggedIn,
  handlers.serveFollowersList
);

expressApp.post('/save-user', handlers.saveUser);
expressApp.post('/isUsernameAvailable', handlers.checkUsernameAvailability);
expressApp.post('/add-new-post', isUserLoggedIn, handlers.handleNewPost);
expressApp.post('/toggleLike', isUserLoggedIn, handlers.toggleLike);
expressApp.post('/search', isUserLoggedIn, handlers.search);
expressApp.post('/follow', isUserLoggedIn, handlers.follow);
expressApp.post('/unfollow', isUserLoggedIn, handlers.unfollow);
expressApp.post('/deletePost', isUserLoggedIn, handlers.deletePost);

module.exports = expressApp;
