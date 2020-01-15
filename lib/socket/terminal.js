const TermianlManager = require('../terminals/TerminalManager');
const tm = new TermianlManager();

module.exports = socket => {
  tm.init(payload => {
    socket.emit(payload.name + '-' + payload.type, payload);
  });

  socket.on('all', () => {
    let terminalNames = Object.keys(tm.terminals);
    if (terminalNames.length) {
      let terminals = [
        {
          name: 'tab0',
          currentPane: 0,
          children: []
        }
      ];
      terminalNames.forEach(name => {
        let terminal = tm.terminals[name];
        let pane = {
          name: terminal.name,
          pid: terminal.proc.pid,
          logs: terminal.logs
        };
        terminals[0].children.push(pane);
      });

      socket.emit('terminals', terminals);
    } else {
      socket.emit('terminals', []);
    }
  });

  socket.on('create', option => {
    tm.add(option);
  });
  socket.on('remove', name => {
    tm.remove(name);
  });
  socket.on('getinfo', name => {
    let terminal = tm.getTermial(name);
    socket.emit(terminal.name + '-info', terminal);
  });

  socket.on('resize', payload => {
    let terminal = tm.getTermial(payload.name);
    if (terminal) {
      terminal.resize(payload.size);
    }
  });

  socket.on('log', payload => {
    let terminal = tm.getTermial(payload.name);
    socket.emit(payload.name + '-log', {
      logs: terminal ? terminal.logs : null
    });
  });

  socket.on('input', payload => {
    let terminal = tm.getTermial(payload.name);
    if (terminal) {
      terminal.write(payload.data);
    }
  });
};
