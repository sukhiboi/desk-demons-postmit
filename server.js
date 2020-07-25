const sqlite3 = require('sqlite3').verbose();
const DBClient = require('./lib/DBClient');
const expressApp = require('./lib/expressApp');
const App = require('./lib/app');

const db = new sqlite3.Database('./database/postmitDatabase.db');
expressApp.locals.app = new App(new DBClient(db));

const [, , PORT] = process.argv;
expressApp.listen(PORT, () => process.stdout.write(`listening on ${PORT}\n`));
