const { app } = require('./lib/app');

const [, , PORT] = process.argv;
app.listen(PORT, () => process.stdout.write(`listening on ${PORT}\n`));
