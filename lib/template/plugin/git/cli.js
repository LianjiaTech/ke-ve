const fse = require('fs-extra');
const spawn = require('cross-spawn');
const chalk = require('chalk');
const path = require('path');

module.exports = function(api) {
  api.registerPluginInfo({
    name: '<%=meta.fullName%>', // 展示名称
    pkgName: '<%= meta.fullName%>', // npm包名
    description: '<%=meta.desc%>', // 展示在名称下方的描述
    link: '<%=meta.gitUrl%>', // “更多信息 (More info)”链接
    config: [] // 配置项规则参考inquirer
  });

  /**
   * @object projectInfo
   *  @field name 项目名称
   *  @field desc 项目描述
   *  @field path 项目绝对路径
   *  @field rootPath 项目所在根目录
   * @object pluginInfo 插件信息，对应registerPluginInfo函数中注册的config信息
   * @function push sss-pusher的实例，用于向前端推送消息
   */
  api.registerGenerate(async ({ pluginInfo, projectInfo, push }) => {
    try {
      const { rootPath: projectRootPath, name: projectName, path: projectPath } = projectInfo;

      // 如果项目目录已存在，则抛出异常
      if (fse.existsSync(projectPath)) {
        throw new Error(`${projectPath} 路径已存在，请换个路径再试`);
      }

      // 在项目根目录不存在的情况下，创建项目根目录
      if (fse.existsSync(projectRootPath)) {
        fse.ensureDirSync(projectRootPath);
      }

      // 克隆git项目到本地
      push('process', '正在克隆项目到本地: <%=meta.gitUrl%>');
      console.log(chalk.yellow('正在克隆项目到本地: <%=meta.gitUrl%>'));
      const repo = '<%=meta.gitUrl%>';
      const cloneOutput = spawn('git', ['clone', repo, projectName], {
        cwd: projectRootPath,
        stdio: 'inherit'
      });
      await new Promise((resolve, reject) => {
        cloneOutput.on('close', code => {
          code === 0 ? resolve() : reject(new Error('clone 项目失败'));
        });
      });

      // 删除.git文件夹
      fse.removeSync(path.resolve(projectPath, '.git'));

      // 安装依赖
      push('process', '正在为项目安装依赖');
      console.log(chalk.yellow('正在为项目安装依赖'));
      const installOutput = spawn(
        'npm',
        ['install', '--registry=https://registry.npm.taobao.org'],
        {
          cwd: projectPath,
          stdio: 'inherit'
        }
      );
      await new Promise((resolve, reject) => {
        installOutput.on('close', code => {
          code === 0 ? resolve() : reject(new Error('安装依赖失败'));
        });
      });

      console.log(chalk.green('项目创建成功'));
    } catch (err) {
      throw err;
    }
  });
};
