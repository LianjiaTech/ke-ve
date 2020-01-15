const merge = require('deepmerge');
const FileController = require('../utils/FileController');
const mergeDeps = require('../utils/mergeDeps');

const isFunction = val => typeof val === 'function';
const isObject = val => val && typeof val === 'object';

class GeneratorApi extends FileController {
  constructor(addor, options, rootOptions) {
    super(options);
    this.addor = addor;
    this.rootOptions = rootOptions;
  }

  /**
   * 合并pkg
   */
  extendPackage(fields) {
    const pkg = this.addor.pkg;
    const toMerge = isFunction(fields) ? fields(pkg) : fields;

    for (let key in toMerge) {
      let value = toMerge[key];
      let existing = pkg[key];
      if (isObject(value) && (key === 'dependencies' || key === 'devDependencies')) {
        pkg[key] = mergeDeps(existing || {}, value);
      } else if (!(key in pkg)) {
        pkg[key] = value;
      } else if (Array.isArray(value) && Array.isArray(existing)) {
        pkg[key] = existing.concat(value);
      } else if (isObject(value) && isObject(existing)) {
        pkg[key] = merge(existing, value);
      } else {
        pkg[key] = value;
      }
    }

    this.addor.isPkgRender = true;
  }

  /**
   * 文件注入import
   */
  injectImports(file, imports) {
    let _imports = this.addor.imports[file] || (this.addor.imports[file] = new Set());
    (Array.isArray(imports) ? imports : [imports]).forEach(imp => {
      _imports.add(imp);
    });
  }

  /**
   * vue文件注入
   * @param {*} file
   * @param {*} options
   */
  injectVue(file, options = {}) {
    let _imports =
      this.addor.injectVue[file] ||
      (this.addor.injectVue[file] = {
        js: new Set(),
        template: new Set()
      });

    if (options.js) {
      (Array.isArray(options.js) ? options.js : [options.js]).forEach(imp => {
        _imports.js.add(imp);
      });
    }
    if (options.template) {
      (Array.isArray(options.template) ? options.template : [options.template]).forEach(imp => {
        _imports.template.add(imp);
      });
    }
  }

  /**
   * vue的module文件注入
   * @param {*} file
   * @param {*} imports
   */
  injectVueModule(file, imports) {
    let _imports =
      this.addor.injectVueModule[file] || (this.addor.injectVueModule[file] = new Set());
    (Array.isArray(imports) ? imports : [imports]).forEach(imp => {
      _imports.add(imp);
    });
  }

  /**
   * vue的路由文件注入
   * @param {*} file
   * @param {*} imports
   */
  injectVueRoutes(file, imports) {
    let _imports =
      this.addor.injectVueRoutes[file] || (this.addor.injectVueRoutes[file] = new Set());
    (Array.isArray(imports) ? imports : [imports]).forEach(imp => {
      _imports.add(imp);
    });
  }

  /**
   * vue的store文件注入
   * @param {*} file
   * @param {*} imports
   */
  injectVueStore(file, imports) {
    let _imports = this.addor.injectVueStore[file] || (this.addor.injectVueStore[file] = new Set());
    (Array.isArray(imports) ? imports : [imports]).forEach(imp => {
      _imports.add(imp);
    });
  }

  /**
   * api文件注入
   * @param {*} file
   * @param {*} imports
   */
  injectApis(file, imports) {
    let _imports = this.addor.injectApis[file] || (this.addor.injectApis[file] = new Set());
    (Array.isArray(imports) ? imports : [imports]).forEach(imp => {
      _imports.add(imp);
    });
  }
}

module.exports = GeneratorApi;
