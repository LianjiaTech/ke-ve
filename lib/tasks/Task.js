const { EventEmitter } = require('events');
const spawn = require('cross-spawn');
const kill = require('tree-kill');

class Task extends EventEmitter {
  constructor(opt = {}) {
    super();

    this.cwd = opt.cwd;
    this.id = opt.id;
    this.name = opt.name;
    this.command = opt.command;
    this.subscribeInitFlag = false;
    this.log = ''; // 日志
    this.proc = null; // 当前进程
    this.status = 'init'; // 当前状态
    this.isCancel = false;
  }

  init(collector) {
    if (this.subscribeInitFlag) {
      return;
    }
    this.subscribeInitFlag = true;

    this.on('stdout-data', data => {
      this.log = `${this.log}${data}`;
      collector({
        cwd: this.cwd,
        type: 'org.ke-ve.task.log',
        payload: {
          status: this.status,
          log: data
        }
      });
    });

    this.on('stderr-data', data => {
      this.log = `${this.log}${data}`;
      collector({
        cwd: this.cwd,
        type: 'org.ke-ve.task.log',
        payload: {
          status: this.status,
          log: data
        }
      });
    });

    this.on('status_event', () => {
      collector({
        cwd: this.cwd,
        type: 'status',
        payload: this.getDetail()
      });
    });
  }

  getDetail() {
    return {
      status: this.status,
      name: this.name,
      command: this.command,
      log: this.log,
      proc: this.proc,
      isCancel: this.isCancel,
      cwd: this.cwd
    };
  }

  handleChildProcess(proc) {
    proc.stdout.setEncoding('utf8');
    proc.stdout.on('data', log => {
      this.emit('stdout-data', log);
    });
    proc.stderr.setEncoding('utf8');
    proc.stderr.on('data', log => {
      this.emit('stderr-data', log);
    });
    proc.on('exit', (code, signal) => {
      if (signal === 'SIGINT') {
        // 用户取消任务
        this.status = 'init';
      } else {
        if (this.isCancel) {
          this.status = 'init';
          this.isCancel = false;
        } else {
          this.status = code !== 0 ? 'fail' : 'sucess';
        }
      }
      // 触发事件
      this.emit('status_event', this.status);
    });

    // TODO: 这儿缺少信号
    process.on('exit', () => {
      proc.kill();
    });
  }

  clearLog() {
    this.log = '';
  }

  getLog() {
    return this.log;
  }

  run() {
    this.status = 'ing';
    this.emit('status_event', this.status);
    let processEnv = { ...process.env };
    delete processEnv.PORT;
    this.proc = spawn('npm', ['run', this.name], {
      cwd: this.cwd,
      stdio: 'pipe',
      env: processEnv
    });
    this.handleChildProcess(this.proc);
  }

  cancel() {
    const { proc } = this;
    if (!proc) {
      return;
    }

    // 子任务执行结束
    if (['fail', 'success'].indexOf(this.status) > -1) {
      return;
    }

    this.status = 'init';
    this.isCancel = true;
    kill(proc.pid, 'SIGINT');
  }
}

module.exports = Task;
