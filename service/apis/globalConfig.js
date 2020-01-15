// 一些全局配置 终端/编辑器
const express = require('express');
const globalConfigModel = require('../../lib/model/config');

var router = express.Router();

router.get('/detail', function(req, res) {
  const data = globalConfigModel.getAll();
  res.success({ data });
});

router.post('/update', function(req, res) {
  globalConfigModel.update(req.body);
  res.success({ code: 0, msg: '配置修改成功' });
});

module.exports = router;
