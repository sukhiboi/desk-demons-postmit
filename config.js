/* eslint-disable no-process-env */
require('dotenv').config();

module.exports = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRETE,
  DB_PATH: process.env.DB_PATH,
};
