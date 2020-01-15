[![npm version](https://img.shields.io/npm/v/ke-ve.svg?style=flat)](https://www.npmjs.com/package/ke-ve) [![downloads](https://img.shields.io/npm/dt/ke-ve.svg)](https://www.npmjs.com/package/ke-ve) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[![NPM](https://nodei.co/npm/ke-ve.png?downloads=true&downloadRank=true)](https://nodei.co/npm/ke-ve/)

## 什么是 ke-ve

ke-ve 是一个**助力本地前端项目开发**的**一站式可视化服务集成**平台。

ke-ve 的目标是打通本地前端项目从**创建**、**配置**、**开发**、**运行**、**部署**的整条链路。

ke-ve 的特点：

- **统一化的脚手架管理**：ke-ve 提供了一套脚手架插件机制来快速接入各个业务线的脚手架，用户可以选择自己感兴趣的脚手架，一键创建项目。
- **可定制化的页面开发**：ke-ve 提供了自定义的项目开发能力，脚手架提供方可以通过配置的方式，来定制专属于该脚手架项目的开发管理界面，用户可以在开发管理界面上，一键生成新页面样板代码，减少了机械化的人工成本。
- **丰富的系统配套功能**：ke-ve 提供了丰富的配套功能来打造整个系统的闭环能力，这些配套功能主要包括：`任务管理`、`文档管理`、`依赖管理`、`部署管理`，`快速打开项目`等

## 安装 ke-ve

```bash
npm i ke-ve -g  --registry=https://registry.npm.taobao.org --unsafe-perm=true --allow-root
```

> 建议使用 Node.js 10.0 及以上版本

## 运行 ke-ve

```bash
ke-ve service
```

## 接入 ke-ve

### 脚手架插件

#### 什么是脚手架插件

为了方便用户快速接入自己开发的脚手架，ke-ve 提供了一套脚手架插件机制，脚手架插件可以很好的包裹现有的脚手架，实现解耦的功能。

ke-ve 的脚手架插件本质上是一个 `npm` 包，它和普通脚手架之间是一一对应的关系。

脚手架插件在 ke-ve 运行时会被加载，并通过注入 API 的方式来和 ke-ve 进行通信。

脚手架插件内容主要包括：

- `cli.js`：[接入自定义脚手架配置](#接入自定义脚手架配置)
- `config.js`：[接入自定义项目配置](#接入自定义项目配置)
- `code.js`：[接入自定义项目开发](#接入自定义项目开发)

#### 快速创建一个脚手架插件

1. 切换到`脚手架插件列表`标签页，点击`创建脚手架插件`按钮
2. 输入`项目名称`，项目名称必填，不能包含中文及特殊字符，默认会加上`ve-cli-`前缀
3. 选择`项目路径`，项目路径必填
4. 选择`脚手架地址类型`，同时支持 **npm** 和 **git** 类型的脚手架
5. 如果选择 **npm**，则需要输入`脚手架npm地址`、`脚手架npm包名`以及`脚手架描述`
6. 如果选择 **git**，则需要输入`脚手架git地址`、`脚手架描述`
7. 选择是否`在编辑器中打开`
8. 点击`创建`按钮，就能创建一个脚手架插件样板项目
9. 将脚手架插件项目发布到 `npmjs.com`，包名以 `ve-cli-` 作为前缀

![create_1.png](http://ww1.sinaimg.cn/large/7061f0fdly1g9kvqhc17xj22xk1githk.jpg)

### 接入自定义脚手架配置

- 接入自定义脚手架的关键在 `cli.js` 文件，该文件会导出一个函数，函数接收 api 对象作为参数

```javascript
module.exports = api => {
  // 在这里使用 API...
};
```

- 在函数中调用 `api.registerPluginInfo` 来注册插件信息

```javascript
api.registerPluginInfo({
  name: '<%=meta.fullName%>', // 展示名称
  pkgName: '<%=meta.fullName%>', // npm包名
  description: '<%=meta.desc%>', // 展示在名称下方的描述
  link: '<%=meta.npmUrl%>', // “更多信息 (More info)”链接
  config: [] // 配置项规则参考inquirer
});
```

- 在函数中调用 `api.registerGenerate` 来运行脚手架生成新项目

```javascript
/**
   * @object projectInfo
   *  @field name 项目名称
   *  @field desc 项目描述
   *  @field path 项目绝对路径
   *  @field rootPath 项目所在根目录
   * @object pluginInfo 插件信息，对应 registerPluginInfo 中注册的 config 信息
   * @function push sss-pusher的实例，用于向前端推送消息
   */
  api.registerGenerate(async ({ pluginInfo, projectInfo, push }) => {
    try {
      //...
    } catch(e) {
      throw e;
    }
  }
```

### 接入自定义项目配置

- 接入自定义项目配置的关键在 `config.js` 文件，该文件会导出一个函数，函数接收 api 对象作为参数

```javascript
module.exports = api => {
  // 在这里使用 API...
};
```

- 在函数中调用 `api.registerGetConfig` 来注册自定义配置信息

```javascript
/**
 * @object projectInfo
 *  @field name 项目名称
 *  @field desc 项目描述
 *  @field path 项目绝对路径
 *  @field rootPath 项目所在根目录
 */
api.registerGetConfig(async ({ projectInfo }) => {
  try {
    return {
      config: [
        {
          key: 'test1', // 配置项key
          name: '测试配置项1', // 配置项名称
          option: {
            // 参考 ncform 配置项规则： https://github.com/ncform/ncform/blob/master/CONFIG.md
            type: 'object',
            properties: {},
            ui: {
              widgetConfig: {
                layout: 'h'
              }
            }
          }
        }
      ]
    };
  } catch (e) {
    throw e;
  }
});
```

- 在函数中调用 `api.registerSaveConfig` 来保存自定义配置

```javascript
/**
 * @object projectInfo
 *  @field name 项目名称
 *  @field desc 项目描述
 *  @field path 项目绝对路径
 *  @field rootPath 项目所在根目录
 * @object configInfo 配置信息，对应 registerGetConfig 中注册的 config 信息
 */
api.registerSaveConfig(async ({ configInfo, projectInfo }) => {
  const { key = '', option = {} } = configInfo;
  try {
    /** TODO: 根据不同的key值和options执行相应的操作 */
    switch (key) {
    }
  } catch (e) {
    throw e;
  }
});
```

### 接入自定义项目开发

- 接入自定义项目开发的关键在 `code.js` 文件，该文件会导出一个函数，函数接收 api 对象作为参数

```javascript
module.exports = api => {
  // 在这里使用 API...
};
```

- 在函数中调用 `api.registerCodeConfig` 来注册自定义开发信息

```javascript
/**
 * @object projectInfo
 *  @field name 项目名称
 *  @field desc 项目描述
 *  @field path 项目绝对路径
 *  @field rootPath 项目所在根目录
 */
api.registerCodeConfig(async ({ projectInfo }) => {
  try {
    return {
      config: [
        {
          key: 'new_page', // 配置项key
          name: '新增页面', // 配置项名称
          option: {
            // 参考 ncform 配置项规则： https://github.com/ncform/ncform/blob/master/CONFIG.md
            type: 'object',
            properties: {},
            ui: {
              widgetConfig: {
                layout: 'h'
              }
            }
          }
        }
      ]
    };
  } catch (e) {
    throw e;
  }
});
```

- 在函数中调用 `api.registerGenerate` 来生成代码

```javascript
/**
 * @object projectInfo
 *  @field name 项目名称
 *  @field desc 项目描述
 *  @field path 项目绝对路径
 *  @field rootPath 项目所在根目录
 * @object configInfo 配置信息，对应 registerGetConfig 中注册的 config 信息
 */
api.registerGenerate(async ({ configInfo, projectInfo }) => {
  const { key = '', option = {} } = configInfo;
  try {
    /** TODO: 根据不同的key值和options执行相应的操作 */
    switch (key) {
    }
  } catch (e) {
    throw e;
  }
});
```

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright(c) 2017 Lianjia, Inc. All Rights Reserved
