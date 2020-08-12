const axios = require('axios');
const sqlite = require('sqlite3');

const DataStore = require('./src/datastore');
const Auth = require('./src/auth');
const app = require('./src/routes');
const { CLIENT_ID, CLIENT_SECRET, PORT, DB_PATH } = require('./config');

const db = new sqlite.Database(DB_PATH);
app.locals.datastore = new DataStore(db);
app.locals.auth = new Auth(CLIENT_ID, CLIENT_SECRET, axios);

app.listen(PORT, () => process.stdout.write(`listening on ${PORT}\n`));
