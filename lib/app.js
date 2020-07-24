const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const handlers = require('./handlers');

const app = express();

app.use(bodyParser.json({ extended: true }));

app.engine('pug', require('pug').__express);
app.set('view engine', 'pug');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.static('public'));

app.get('/', handlers.serveHome);
app.get('/profile', handlers.serveProfilePage);
app.post('/add-new-post', handlers.handleNewPost);
app.post('/like', handlers.likePost);
app.post('/unlike', handlers.unlikePost);

module.exports = { app };
