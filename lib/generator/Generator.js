const EventEmitter = require('events');
const path = require('path');
const home = require('user-home');
const fs = require('fs-extra');
const rm = require('rimraf').sync;
const ora = require('ora');
const inquirer = require('inquirer');

const GeneratorApi = require('./Api');
const downloadPromise = require('../utils/download');
const { loadModule } = require('../utils/module');
const injectImports = require('./inject/injectImports');
const {
  injectVue,
  injectVueModule,
  injectVueRoutes,
  injectVueStore
} = require('./inject/injectVue');

class Generator extends EventEmitter {
  /**
   * 初始化配置
   * @param {String} template 模板路径或者git地址
   * @param {String} projectPath 项目路径
   * @param {String} mode 调用模式，cmd：命令行调用，api: API调用
   * @param {Object} args 命令行参数
   */
  constructor(template, projectPath, mode, args) {
    super();

    if (typeof template == 'object') {
      projectPath = template.projectPath;
      mode = template.mode;
      args = template.args;
      template = template.template;
    }
    this._resolveTemplate(template, args);
    this.mode = mode || 'cmd';
    this.cmdArgs = args;
    this.projectPath = projectPath; //项目目录

    this.imports = {};
    this.injectVue = {};
    this.injectVueModule = {};
    this.injectVueRoutes = {};
    this.injectVueStore = {};

    this.options = {};
  }

  /**
   * 解析template类型
   * @param {String} template 模板路径或者git地址
   * @param {Object} args 命令行参数
   */
  _resolveTemplate(template, args = {}) {
    if (args.type == 'git' || /^http(s):/.test(template) || /\.git$/.test(template)) {
      let templateArr;
      if (template.indexOf(':') > 0) {
        let arr = template.split(':');
        templateArr = arr[arr.length - 1].split('/');
      } else {
        templateArr = template.split('/');
      }
      let templateName =
        templateArr[templateArr.length - 2] +
        '-' +
        templateArr[templateArr.length - 1].replace('.git', '');

      this.template = {
        type: 'git',
        git: template,
        path: path.resolve(home, '.ke-ve', 'components', templateName)
      };
    } else if (path.isAbsolute(template)) {
      this.template = {
        type: 'localpath',
        path: template
      };
    } else {
      let pathinfo = path.resolve(process.cwd(), template);
      this.template = {
        type: 'localpath',
        path: pathinfo
      };
    }
  }

  /**
   * 下载模板，并注册generator和meta文件
   */
  async download() {
    const { clear } = this.cmdArgs;
    try {
      let spinner = null;
      // cmd模式显示加载动画
      if (this.mode == 'cmd') {
        spinner = ora('downloading template...');
        spinner.start();
      }
      this.emit('add:download:start');

      if (this.template.type == 'git') {
        if (fs.existsSync(this.template.path)) {
          // 删除所有缓存
          if (clear) {
            // 如果模版在本地已存储，则先删除
            rm(this.template.path);

            await downloadPromise(this.template.git, this.template.path);
          }
        } else {
          await downloadPromise(this.template.git, this.template.path);
        }
      }

      if (this.mode == 'cmd') {
        spinner.stop();
      }

      //获取module的生成器
      try {
        this.plugin = loadModule('generator', this.template.path);
      } catch (error) {
        throw new Error(`${this.template.path} 模板插件中没有generator文件`);
      }

      try {
        this.meta = require(path.join(this.template.path, 'meta'));
      } catch (error) {
        console.warn(`${this.template.path} 模板插件中没有meta文件`);
      }

      this.emit('add:download:done', this.meta);
    } catch (err) {
      this.emit('add:download:error', err);
    }
  }

  async create(meta) {
    if (!this.plugin) return false;
    try {
      let options = { meta: {}, filters: [] };
      if (!meta) {
        options = await this._resolveMeta();
      } else {
        options.meta = meta;
        options = handleMetaFilters(this.meta.filters, options);
      }

      const gApi = new GeneratorApi(this, options, this.options);
      this.plugin(gApi, options.meta, this.options);
      await this.resolveFiles(gApi);

      await gApi.writeFileTree();

      this.emit('add:generator:done');
    } catch (error) {
      console.log(error);
      this.emit('add:generator:error', error);
    }
  }

  /**
   * 读取meta数据，并进行格式化
   * @description
   * 数据格式为
   * {
   *      prompts: [
   *          {
   *              name: "name",
   *              type: "input",
   *              message: "项目名称"
   *          }
   *      ],
   *      filters: {
   *          "src/router/**": "router"
   *      }
   * }
   */
  async _resolveMeta() {
    let options = { meta: {}, filters: [] };

    if (!this.meta || !this.meta.prompts) return options;

    if (this.meta.prompts.length > 0) {
      options.meta = await inquirer.prompt(this.meta.prompts);
    }

    options = handleMetaFilters(this.meta.filters, options);
    return options;
  }

  /**
   * 解析模板并创建文件
   */
  async resolveFiles(gApi) {
    const files = gApi.files;

    await gApi.resolveFileMiddlewares();

    //处理js文件
    Array.from(this.imports).forEach(file => {
      files[file] = {
        source: injectImports(file, {
          cwd: this.projectPath,
          js: this.imports[file]
        }),
        dir: this.projectPath
      };
    });
    //处理vue文件
    Object.keys(this.injectVue).forEach(file => {
      files[file] = {
        source: injectVue(
          file,
          Object.assign(
            {
              cwd: this.projectPath
            },
            this.injectVue[file]
          )
        ),
        dir: this.projectPath
      };
    });

    //处理vue中的module文件
    Object.keys(this.injectVueModule).forEach(file => {
      files[file] = {
        source: injectVueModule(file, {
          cwd: this.projectPath,
          js: this.injectVueModule[file]
        }),
        dir: this.projectPath
      };
    });

    //处理vue中route文件
    Object.keys(this.injectVueRoutes).forEach(file => {
      files[file] = {
        source: injectVueRoutes(file, {
          cwd: this.projectPath,
          js: this.injectVueRoutes[file]
        }),
        dir: this.projectPath
      };
    });

    //处理vue中store文件
    Object.keys(this.injectVueStore).forEach(file => {
      files[file] = {
        source: injectVueStore(file, {
          cwd: this.projectPath,
          js: this.injectVueStore[file]
        }),
        dir: this.projectPath
      };
    });
  }
}

module.exports = Generator;

/**
 * 提取需要过滤的文件
 * @param {Array} filters
 * @param {Object} options
 */
function handleMetaFilters(filters, options) {
  if (!filters) return options;

  Object.keys(filters).forEach(key => {
    let index = filters[key];
    if (!options.meta[index]) {
      options.filters.push(key);
    }
  });
  return options;
}
