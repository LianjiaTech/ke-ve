const SocketIoServer = require('socket.io');

module.exports = class SocketServer {
  constructor(server, options) {
    this.io = new SocketIoServer(server, options);
  }

  use(name, fn) {
    if (!name) return false;
    if (typeof name === 'string') {
      if (!fn) return false;
      if (typeof fn !== 'function') throw new TypeError('middleware must be a function!');

      let nsp = this.io.of(name);
      nsp.on('connection', socket => {
        fn(socket, nsp);
      });
    } else if (typeof name === 'function') {
      this.io.on('connection', socket => {
        fn(socket, this.id);
      });
    }
  }
};
