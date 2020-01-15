const router = require('express').Router();
const { exec } = require('child_process');
const { promisify } = require('util');
const promiseExec = promisify(exec);
const folder = require('../../lib/utils/folder');

router.get('/open', function(req, res) {
  let promiseStart;
  if (req.query.path) {
    promiseStart = folder.list(req.query.path);
  } else {
    promiseStart = folder.list();
  }
  promiseStart
    .then(data => {
      res.success({
        path: req.query.path || process.cwd(),
        children: data
      });
    })
    .catch(e => {
      res.fail(e);
    });
});

router.get('/parent', function(req, res) {
  let promiseStart;
  if (req.query.path) {
    promiseStart = folder.openParent(req.query.path);
  } else {
    promiseStart = folder.openParent();
  }
  promiseStart
    .then(data => {
      let info = folder.getParent(req.query.path || process.cwd());
      info.children = data;
      res.success(info);
    })
    .catch(e => {
      res.fail(e);
    });
});

router.post('/create', function(req, res) {
  if (req.body.path && req.body.name) {
    let info = folder.createFolder(req.body.path, req.body.name);
    res.success(info);
  } else {
    res.fail('文件路径和文件夹名称必传');
  }
});

router.post('/delete', function(req, res) {
  if (req.body.path) {
    folder.deleteFolder(req.body.path);
    res.success('删除成功');
  } else {
    res.fail('文件路径必传');
  }
});

router.get('/currentPath', function(req, res) {
  if (req.query.path) {
    folder.getCurrent(req.query.path);
    return res.success(folder.getCurrent(req.query.path));
  } else {
    return res.success(folder.getCurrent());
  }
});

router.get('/cwd', function(req, res) {
  const { pid } = req.query;
  promiseExec(`lsof -a -p ${pid} -d cwd -Fn | tail -1 | sed 's/.//'`)
    .then(newCwd => {
      const cwd = typeof newCwd === 'string' ? newCwd.trim() : newCwd.stdout.trim();
      res.success(cwd);
    })
    .catch(e => res.fail(e));
});

module.exports = router;
