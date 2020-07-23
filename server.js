const sqlite3 = require('sqlite3').verbose();
const { DBClient } = require('./DBClient');
const { app } = require('./lib/app');

const db = new sqlite3.Database('./database/postmitDatabase.db');
app.locals.dbClient = new DBClient(db);

const [, , PORT] = process.argv;
app.listen(PORT, () => process.stdout.write(`listening on ${PORT}\n`));
