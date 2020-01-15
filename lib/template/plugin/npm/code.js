module.exports = api => {
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
          // {
          //   key: 'new_page', // 配置项key
          //   name: '新增页面', // 配置项名称
          //   option: {
          //     // 参考 ncform 配置项规则： https://github.com/ncform/ncform/blob/master/CONFIG.md
          //     type: 'object',
          //     properties: {},
          //     ui: {
          //       widgetConfig: {
          //         layout: 'h'
          //       }
          //     }
          //   }
          // }
        ]
      };
    } catch (e) {
      throw e;
    }
  });

  /**
   * @object projectInfo
   *  @field name 项目名称
   *  @field desc 项目描述
   *  @field path 项目绝对路径
   *  @field rootPath 项目所在根目录
   * @object configInfo 配置信息，对应registerCodeConfig函数中注册的config信息
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
};
