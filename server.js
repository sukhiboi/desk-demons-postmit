/* eslint-disable no-process-env */
require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

const expressApp = require('./lib/routes');
const App = require('./lib/app');
const Datastore = require('./lib/datastore');
const Auth = require('./lib/auth');

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const db = new sqlite3.Database(process.env.DB_PATH);
expressApp.locals.app = new App(new Datastore(db));
expressApp.locals.auth = new Auth(clientId, clientSecret, axios);

const [, , PORT] = process.argv;
expressApp.listen(PORT, () => process.stdout.write(`listening on ${PORT}\n`));
