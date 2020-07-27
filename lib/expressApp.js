const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieEncrypter = require('cookie-encrypter');
const handlers = require('./handlers');
const { authorizeUser } = require('./auth');

const expressApp = express();
const secret = 'desk-demons-postmit-step-batch-7';

expressApp.use(bodyParser.json({ extended: true }));

expressApp.engine('pug', require('pug').__express);
expressApp.set('view engine', 'pug');

expressApp.use(morgan('dev'));
expressApp.use(express.json());
expressApp.use(express.urlencoded({ extended: true }));
expressApp.use(cookieParser(secret));
expressApp.use(cookieEncrypter(secret));
expressApp.use(express.static('public'));

expressApp.use(function (request, response, next) {
  const id = request.cookies.user_id;
  request.cookies.user_id = Number(id);
  next();
});

expressApp.get('/', handlers.serveIndexPage);
expressApp.get('/auth', authorizeUser);
expressApp.get('/callback', handlers.handleUserProfile);
expressApp.post('/save-user', handlers.saveUser);
expressApp.get('/home', handlers.serveHome);
expressApp.get('/profile', handlers.serveProfilePage);
expressApp.get('/user/:username', handlers.serveSearchedUserProfile);
expressApp.post('/add-new-post', handlers.handleNewPost);
expressApp.post('/like', handlers.likePost);
expressApp.post('/unlike', handlers.unlikePost);
expressApp.post('/search', handlers.search);

module.exports = expressApp;
