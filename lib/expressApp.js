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
  const id = request.cookies.user_id;
  request.cookies.user_id = Number(id);
  next();
});

expressApp.get('/', handlers.serveIndexPage);
expressApp.get('/auth', handlers.authorizeUser);
expressApp.get('/callback', handlers.handleUserProfile);
expressApp.get('/home', handlers.serveHome);
expressApp.get('/profile', handlers.serveProfilePage);
expressApp.get('/user/:username', handlers.serveSearchedUserProfile);
expressApp.get('/user/:username/following',handlers.serveFollowingList)

expressApp.post('/save-user', handlers.saveUser);
expressApp.post('/add-new-post', handlers.handleNewPost);
expressApp.post('/like', handlers.likePost);
expressApp.post('/unlike', handlers.unlikePost);
expressApp.post('/search', handlers.search);
expressApp.post('/isUsernameAvailable', handlers.checkUsernameAvailability);
expressApp.post('/follow', handlers.follow);
expressApp.post('/unfollow', handlers.unfollow);


module.exports = expressApp;
