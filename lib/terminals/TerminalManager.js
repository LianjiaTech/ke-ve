const pty = require('node-pty');
const os = require('os');
const userhome = require('user-home');
const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

class TerminalManager {
  constructor() {
    this.terminals = {};
    this.send = null;
  }

  init(send) {
    this.send = send;
  }

  getTermial(name) {
    return this.terminals[name] || null;
  }

  add(option) {
    if (this.terminals[option.name]) return this.terminals[option.name];

    let tm = new Terminal(option.name);
    this.terminals[option.name] = tm;
    tm.create(option, this.collector(option.name));
    return tm;
  }

  remove(name) {
    if (this.terminals[name]) {
      this.terminals[name].destroy();
      delete this.terminals[name];
    }
  }
  collector(currentName) {
    return payload => {
      if (currentName !== payload.name) {
        return;
      }
      if (!this.send) {
        return;
      }
      this.send(payload);
    };
  }
}

module.exports = TerminalManager;

class Terminal {
  constructor(name) {
    this.name = name;
    this.proc = null;
    this.logs = '';
    this.status = 'init';
  }

  create(option = {}, send) {
    this.status = 'ing';
    this.proc = pty.spawn(shell, ['--login'], {
      name: 'xterm-color',
      cols: option.cols || 80,
      rows: option.rows || 24,
      cwd: option.cwd || userhome,
      env: process.env
    });
    this.handleChildProcess(send);
  }

  handleChildProcess(send) {
    this.proc.on('data', data => {
      this.logs = `${this.logs}${data}`;
      send({
        log: data,
        name: this.name,
        status: this.status,
        type: 'log'
      });
    });

    send({
      log: this.logs,
      name: this.name,
      status: this.status,
      pid: this.proc.pid,
      type: 'info'
    });

    process.on('exit', () => {
      this.destroy();
    });
  }

  write(data) {
    this.proc.write(data);
  }

  resize(size) {
    this.proc.resize(size[0], size[1]);
  }

  destroy() {
    this.proc.destroy();
    this.proc.kill();
  }
}
