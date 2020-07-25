const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const handlers = require('./handlers');

const expressApp = express();

expressApp.use(bodyParser.json({ extended: true }));

expressApp.engine('pug', require('pug').__express);
expressApp.set('view engine', 'pug');

expressApp.use(morgan('dev'));
expressApp.use(express.json());
expressApp.use(express.static('public'));

expressApp.get('/', handlers.serveHome);
expressApp.get('/profile', handlers.serveProfilePage);
expressApp.post('/add-new-post', handlers.handleNewPost);
expressApp.post('/like', handlers.likePost);
expressApp.post('/unlike', handlers.unlikePost);

module.exports = expressApp;
