const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const spawn = require('cross-spawn');
const templateModel = require('../../lib/model/template');
const downloadPromise = require('../../lib/utils/download');
const globalConfigModel = require('../../lib/model/config');
const { addTemplate } = require('../../lib/create');
const router = express.Router();

router.get('/list', (req, res) => {
  return res.success({
    list: templateModel.getAll()
  });
});

router.post('/update', (req, res) => {
  if (req.body.id) {
    let info = templateModel.get({ id: req.body.id });
    if (info) {
      return downloadPromise(info.git, info.path)
        .then(() => {
          res.success({ msg: '更新成功' });
        })
        .catch(e => {
          console.log(e);
          return res.fail(e);
        });
    } else {
      return res.fail(`没有获取到模板id为${req.body.id}的数据`);
    }
  } else {
    return res.fail('没有传模板id');
  }
});

router.post('/add', (req, res) => {
  if (req.body.repo) {
    let info = templateModel.get({
      git: req.body.repo
    });
    if (info) {
      if (fs.existsSync(info.path)) {
        return res.fail('该项目模板地址在本地已经存在');
      } else {
        templateModel.delete({
          git: req.body.repo
        });
        addTemplate(req.body.repo)
          .then(() => {
            return res.success({
              msg: '添加成功'
            });
          })
          .catch(e => {
            res.fail(e);
          });
      }
    } else {
      addTemplate(req.body.repo)
        .then(() => {
          return res.success({
            msg: '添加成功'
          });
        })
        .catch(e => {
          res.fail(e);
        });
    }
  } else {
    return res.fail('项目模板地址必传');
  }
});

router.post('/delete', (req, res) => {
  if (req.body.id) {
    let info = templateModel.get({
      id: req.body.id
    });
    if (info) {
      fs.removeSync(info.path);
      templateModel.delete({
        id: req.body.id
      });
      return res.success({ msg: '删除成功' });
    } else {
      return res.fail(`没有获取到模板id为${req.body.id}的数据`);
    }
  } else {
    return res.fail('项目模板地址必传');
  }
});

router.post('/create', (req, res) => {
  if (req.body.name && req.body.path) {
    let templatePath = path.resolve(__dirname, '../../lib/template/tpl');
    fs.copy(templatePath, req.body.path)
      .then(() => {
        if (req.body.open) {
          const { editor } = globalConfigModel.getAll();
          const { status } = spawn.sync('open', ['-a', editor, req.body.path], {
            stdio: 'inherit'
          });
          if (status === 0) {
            return res.success({ msg: '创建成功' });
          } else {
            return res.fail('打开项目失败');
          }
        } else {
          return res.success({ msg: '创建成功' });
        }
      })
      .catch(e => {
        console.error(e);
        res.fail(e.message || e);
      });
  } else {
    return res.fail('名称和地址必传');
  }
});

module.exports = router;
