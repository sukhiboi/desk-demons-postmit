const sqlite3 = require('sqlite3').verbose();
const { DBClient } = require('./lib/DBClient');
const { expressApp } = require('./lib/expressApp');

const db = new sqlite3.Database('./database/postmitDatabase.db');
expressApp.locals.dbClient = new DBClient(db);

const [, , PORT] = process.argv;
expressApp.listen(PORT, () => process.stdout.write(`listening on ${PORT}\n`));
