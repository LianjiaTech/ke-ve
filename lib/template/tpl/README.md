## 模版插件项目

防 vue-cli2.0 规则，写的项目模板插件

## 模板插件目录结构

```
├── meta.json || meta.js
├── templates
│   └── \*
└── readme.md
```

### meta.json

> 配置 templates 下所需要的数据

### prompts

是一个数组，编写规则参考[inquirer 配置](https://www.npmjs.com/package/inquirer#question)

### filters

根据 prompts 中的配置，过滤掉不需要渲染生成的文件或者文件夹，比如：

meta.json

```
{
	"prompts": [
		{
			"name": "router",
			"type": "confirm",
			"message": "Install vue-router?",
			"default": true
		}
	],
	"filters": {
		"router/**/*": "router"
	}
}

```

templates 目录结构

```
├── router
│   └── \*
└── *
```

如果 prompts 中的 router 为 false，则生成的项目中不会生成 router 文件夹下的所有文件，说白了就是设置一个白名单

## templates

这个文件夹下存放要生成的项目文件，都是 ejs 文件

渲染引擎用的是 ejs

传入的数据 meta 对象，里面的 key 和 value 都是通过 meta.json 中的 prompts 进行的配置所获取
