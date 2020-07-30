const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

const expressApp = require('./lib/expressApp');
const App = require('./lib/app');
const Datastore = require('./lib/datastore');
const Auth = require('./lib/auth');

const clientId = 'a10adde55f64586894bf';
const clientSecret = '260e6be0ce6751f5557dda1192b1a3fa5b18993b';
const db = new sqlite3.Database('./database/postmitDatabase.db');
expressApp.locals.app = new App(new Datastore(db));
expressApp.locals.auth = new Auth(clientId, clientSecret, axios);

const [, , PORT] = process.argv;
expressApp.listen(PORT, () => process.stdout.write(`listening on ${PORT}\n`));
