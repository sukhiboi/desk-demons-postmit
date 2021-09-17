const axios = require('axios');

const Database = require('./src/database');
const Auth = require('./src/auth');
const app = require('./src/routes');
const {CLIENT_ID, CLIENT_SECRET, PORT} = require('./config');

//new DB setup
const pg = require('knex')({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    port: 5432,
    user: 'sukhdev',
    password: 'root',
    database: 'postmit'
  }
});
app.locals.datastore = new Database(pg);

//old DB setup
// const db = new sqlite.Database(DB_PATH);
// app.locals.datastore = new DataStore(db);

app.locals.auth = new Auth(CLIENT_ID, CLIENT_SECRET, axios);

app.listen(PORT, () => process.stdout.write(`listening on ${PORT}\n`));
