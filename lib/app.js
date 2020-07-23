const express = require('express');
const morgan = require('morgan');
const handlers = require('./handlers');
const app = express();

app.engine('pug', require('pug').__express);
app.set('views', './views');
app.set('view engine', 'pug');

app.use(morgan('dev'));
app.use(express.static('public'));
app.get('/', handlers.getPosts);

module.exports = { app };
