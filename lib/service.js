const http = require('http');
const opn = require('opn');
const portfinder = require('portfinder');
const killPort = require('kill-port');
const axios = require('axios');
const chalk = require('chalk');
const app = require('../service/app');
const createSocketServer = require('./socket');
const { loadLocalPlugin } = require('./pluginApi/index');

module.exports = async (args = {}) => {
  loadLocalPlugin();

  if (process.env.NODE_ENV === 'nodemon') {
    const port = normalizePort(args.port || '9729');
    await killPort(port);

    app.set('port', port);

    const server = http.createServer(app);
    createSocketServer(server);
    server.listen(port, () => {
      const url = 'http://localhost:' + port;
      console.log(url);
    });
    server.on('error', error => {
      onError(error, port);
    });
  } else {
    portfinder.basePort = normalizePort(args.port || '9728');
    portfinder.getPort((err, port) => {
      if (err) {
        throw err;
      } else {
        app.set('port', port);

        const server = http.createServer(app);
        createSocketServer(server);
        server.listen(port, async () => {
          const url = 'http://localhost:' + port;

          try {
            const { status, data } = await axios.get(url + '/api/depends/info?name=ke-ve');

            if (status === 200 && data && data.code === 0) {
              const { latestVersion } = data.data.npmInfos;
              const currentVersion = require('../package').version;
              if (latestVersion > currentVersion) {
                console.log(
                  chalk.yellow('A newer version of ke-ve is available: ') +
                    chalk.red(currentVersion) +
                    ' -> ' +
                    chalk.green(latestVersion)
                );
                console.log(chalk.yellow('Run the following command to update:'));
                console.log(
                  chalk.green(
                    '> npm i ke-ve -g  --registry=https://registry.npm.taobao.org --unsafe-perm=true --allow-root'
                  )
                );
              }
            }
          } catch (e) {
            console.log(chalk.red(`版本更新检测出错: ${e.message || e}`));
          }

          console.log(`starting at ${url}`);
          opn(url, { wait: true });
        });
        server.on('error', error => {
          onError(error, port);
        });
      }
    });
  }

  process.on('uncaughtException', err => {
    console.log(err);
    process.exit(1);
  });
};

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error, port) {
  if (error.syscall !== 'listen') {
    process.exit(1);
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}
