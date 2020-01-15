const spawn = require('cross-spawn');
const fse = require('fs-extra');
const chalk = require('chalk');

module.exports = function(api) {
  api.registerPluginInfo({
    name: '<%=meta.fullName%>', // 展示名称
    pkgName: '<%=meta.fullName%>', // npm包名
    description: '<%=meta.desc%>', // 展示在名称下方的描述
    link: '<%=meta.npmUrl%>', // “更多信息 (More info)”链接
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

      const npmName = '<%=meta.npmName%>';
      push('process', `调用 ${npmName} 创建项目中`);
      console.log(chalk.yellow(`调用 ${npmName} 创建项目中`));

      // 调用脚手架命名创建项目
      const createOutput = spawn(
        'npx',
        [
          npmName,
          /** TODO: 脚手架对应的命令参数 */
          projectName
        ],
        {
          cwd: projectRootPath,
          stdio: 'inherit'
        }
      );
      await new Promise((resolve, reject) => {
        createOutput.on('close', code => {
          if (code !== 0) {
            console.log(chalk.red('脚手架运行出错'));
            return reject(new Error('脚手架运行出错'));
          }
          return resolve();
        });
      });

      console.log(chalk.green('项目创建成功'));
    } catch (err) {
      throw err;
    }
  });
};
