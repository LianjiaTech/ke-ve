const { readPackage } = require('../utils/folder');
const Task = require('./Task');

/**
 * Tasks 管理，根据 cwd 做区分
 */
class TaskManager {
  constructor() {
    this.tasks = {}; // 任务
    this.send = null; // 客户端消息触发器
    this.currentCwd = null;
  }
  init(cwd, send) {
    this.currentCwd = cwd;
    this.send = send;

    if (this.tasks[cwd]) {
      return;
    }

    this.tasks[cwd] = {};

    const pkg = readPackage(cwd);

    if (pkg.scripts) {
      Object.keys(pkg.scripts).forEach(name => {
        if (pkg.scripts[name]) {
          this.tasks[cwd][name] = new Task({
            id: `${cwd}:${name}`,
            name,
            command: pkg.scripts[name],
            cwd
          });
          this.tasks[cwd][name].init(this.collector(cwd));
        }
      });
    }
  }

  getTask(cwd, type) {
    if (this.tasks[cwd]) return this.tasks[cwd][type];
    else return null;
  }

  collector(currentCwd) {
    return ({ cwd, ...otherData }) => {
      if (currentCwd !== cwd) {
        return;
      }
      if (!this.send) {
        return;
      }
      this.send(otherData);
    };
  }
}

module.exports = TaskManager;
