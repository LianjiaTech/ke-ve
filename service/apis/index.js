const express = require('express');
const plugin = require('./plugin');
const project = require('./project');
const folder = require('./folder');
const template = require('./template');
const config = require('./config');
const globalConfig = require('./globalConfig');
const depends = require('./depends');
const code = require('./code');
const deploy = require('./deploy');

const router = express.Router();

router.use('/plugin', plugin);
router.use('/project', project);
router.use('/folder', folder);
router.use('/template', template);
router.use('/config', config);
router.use('/gconfig', globalConfig);
router.use('/code', code);
router.use('/depends', depends);
router.use('/deploy', deploy);

module.exports = router;
