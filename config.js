/* eslint-disable no-process-env */
const dotenv = require('dotenv');
const result = dotenv.config({ path: process.env.CONFIG_PATH });

if (result.error) {
  throw result.error;
}

module.exports = result.parsed;
