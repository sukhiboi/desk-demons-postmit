/* eslint-disable no-process-env */
const axios = require('axios');

const Database = require('./src/database');
const Auth = require('./src/auth');
const app = require('./src/routes');

const pg = require('knex')(require('./knexfile')[process.env.ENV]);
app.locals.datastore = new Database(pg);

app.locals.auth =
  new Auth(process.env.CLIENT_ID, process.env.CLIENT_SECRET, axios);

app.listen(process.env.PORT,
  () => process.stdout.write('Postmit Server Started\n'));
