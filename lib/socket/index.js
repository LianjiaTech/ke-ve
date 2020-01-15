const fs = require('fs');
const path = require('path');
const SocketServer = require('./socket');
const terminal = require('./terminal');
const task = require('./task');
const watchDir = path.resolve(__dirname, '../../service/public');
module.exports = server => {
  const socketServer = new SocketServer(server);

  socketServer.use('terminal', terminal);
  socketServer.use('task', task);

  if (process.env.NODE_ENV === 'nodemon') {
    socketServer.use('reload', socket => {
      fs.watch(watchDir, e => {
        if (e === 'change') {
          socket.emit('reload');
        }
      });
    });
  }

  process.on('exit', () => {
    socketServer.io.close();
  });
};
