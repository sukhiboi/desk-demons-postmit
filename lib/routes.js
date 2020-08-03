const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cookieEncrypter = require('cookie-encrypter');
const userRoute = require('./userRoute');
const handlers = require('./handlers');

const app = express();
const secret = 'desk-demons-postmit-step-batch-7';

app.engine('pug', require('pug').__express);
app.set('view engine', 'pug');

// eslint-disable-next-line no-process-env
app.use(morgan('dev', { skip: () => process.env.NODE_ENV === 'test' }));
app.use(cookieParser(secret));
app.use(cookieEncrypter(secret));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(function (request, response, next) {
  const id = request.cookies.userId;
  request.cookies.userId = Number(id);
  const app = request.app.locals.app;
  app.updateUser(Number(id)).catch(() => {});
  next();
});
app.get('/', handlers.serveIndexPage);
app.get('/auth', handlers.authorizeUser);
app.get('/callback', handlers.handleUserProfile);
app.post('/save-user', handlers.saveUser);
app.post('/isUsernameAvailable', handlers.checkUsernameAvailability);
app.use(userRoute);

module.exports = app;
