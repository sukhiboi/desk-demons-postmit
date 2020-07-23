const { app } = require('./lib/app');

const main = function (args) {
  const [, , port] = args;
  app.listen(port, () => process.stdout.write(`started listening ${port}\n`));
};

main(process.argv);
