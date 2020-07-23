const express = require('express');
const morgan = require('morgan');
const handlers = require('./handlers');
const sqlite3 = require('sqlite3').verbose();
const { DBClient } = require('./DBClient');

const app = express();
const db = new sqlite3.Database('./database/postmitDatabase.db');
app.locals.dbClient = new DBClient(db);

app.engine('pug', require('pug').__express);
app.set('view engine', 'pug');

app.use(morgan('dev'));
app.use(express.static('public'));

app.get('/', handlers.getPosts);

module.exports = { app };
