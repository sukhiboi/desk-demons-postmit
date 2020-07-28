const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

const DBClient = require('./lib/DBClient');
const expressApp = require('./lib/expressApp');
const App = require('./lib/app');
const Auth = require('./lib/auth');

const clientId = '7c902cf5c0915e0fed2a';
const clientSecret = '262da536ff5730b16409843b3ce17284f05c62c9';
const db = new sqlite3.Database('./database/postmitDatabase.db');
expressApp.locals.app = new App(new DBClient(db));
expressApp.locals.auth = new Auth(clientId, clientSecret, axios);

const [, , PORT] = process.argv;
expressApp.listen(PORT, () => process.stdout.write(`listening on ${PORT}\n`));
