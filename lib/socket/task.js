const TaskManager = require('../tasks/TaskManager');

const taskManager = new TaskManager();

module.exports = socket => {
  socket.on('init', payload => {
    taskManager.init(payload.cwd, data => {
      socket.emit('log', data);
    });
  });
  socket.on('run', payload => {
    let task = taskManager.getTask(payload.cwd, payload.name);
    task.run();
  });

  socket.on('stop', payload => {
    let task = taskManager.getTask(payload.cwd, payload.name);
    task.cancel();
  });

  socket.on('getinfo', payload => {
    let task = taskManager.getTask(payload.cwd, payload.name);
    socket.emit('info', JSON.stringify(task ? task.getDetail() : {}));
  });

  socket.on('logsClear', payload => {
    let task = taskManager.getTask(payload.cwd, payload.name);
    task.clearLog();
  });
};
