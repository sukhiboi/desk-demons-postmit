/* eslint-disable no-process-env */
require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

const expressApp = require('./lib/routes');
const App = require('./lib/app');
const Datastore = require('./lib/datastore');
const Auth = require('./lib/auth');
const { CLIENT_ID, CLIENT_SECRET, DB_PATH, PORT } = require('./config');

const db = new sqlite3.Database(DB_PATH);
expressApp.locals.app = new App(new Datastore(db));
expressApp.locals.auth = new Auth(CLIENT_ID, CLIENT_SECRET, axios);

expressApp.listen(PORT, () => process.stdout.write(`listening on ${PORT}\n`));
