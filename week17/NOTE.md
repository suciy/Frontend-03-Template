# 初始化与构建

> 为 JavaScript 生产环境制作一套工具链覆盖前端开发的各个环节。

##  工具链开端--- 脚手架（generator）

选用  [Yeoman](https://yeoman.io/) 作为初始化工具 ，**Yeoman** 目前社区较为流行的脚手架的生成器。通过 Yeoman 能够去初始化项目、创建模板。

###  **Yeoman** 基本使用

 1、新建目录文件夹，并初始化 package.json 文件，注意的是包名应该为 generator开头，这样 Yeoman 才能读取到。

``` javascript
npm init // 初始化 package.json
```

 2、在全局安装 yo 包（用以执行yo命令），当前目录安装 yeoman 包。	

     ``` javascript
npm i -g yo // --- 全局安装
npm i yeoman-generator // 当前目录安装generator
     ```

3、跟随官网的教程，在当前文件夹新建 generators 文件夹，整体目录结构如下：

```javascript
├───package.json
└───generators/
    ├───app/
    │   └───index.js
```

而 index.js 中是通过继承 Generator 来声明类，与其它代码不一样的是，Generator 的代码是一行一行往下执行的。

```javascript
var Generator = require('yeoman-generator');

module.exports = class extends Generator {
  // The name `constructor` is important here
  constructor(args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts);
  }
  method1() {
    this.log('method 1 just ran');
  }

  method2() {
    this.log('method 2 just ran');
  }
};
```

4、随后，修改 main.js 中的 main 属性为我们 app 文件夹下的 index.js。

     ``` javascript
 "main": "generators/app/index.js"
     ```

5、最后，通过 **npm link** 来运行 **generator** ， 但是 **npm link** 命令需要运行在 **generator** 的根目录下。

综上，一个关于 **generator** 的基本使用流程就有啦！

### **Yeoman** 具备的能力

1、用户交互能力：**Prompts**。`prompt`方法是异步的，且返回值是一个promise。`prompt`方法返回的其实是一个用户回馈队列， [`prompting` queue](https://yeoman.io/authoring/running-context.html) 。因此我们可以使用 async、await 来获取返回的答案。

```javascript
async method1() {
    const answers = await this.prompt([
      {
        type: "input",
        name: "name",
        message: "Your project name",
        default: this.appname // Default to current folder name
      },
      {
        type: "confirm",
        name: "cool",
        message: "Would you like to enable the Cool feature?"
      }
    ]);
    this.log('app name', answers.name);
    this.log('cool feature', answers.cool);
  }
```

2、文件系统能力：可以通过**this.destinationRoot()**获取目标文件夹、**this.destinationPath('sub/path')**获取目标文件；也可以通过**template context**存储文件模板，默认定义在`./templates/`路径下，也可以通过`this.sourceRoot('new/template/path')`更改路径。

​		关于文件系统交互具体使用范例，首先是在`./templates/`下新建一个`index.html`，具体内容为：

```html
<html>
  <head>
    <title><%= title %></title>
  </head>
</html>
```

​		其次是在`index.js`中，增加`renderHTML`方法，通过`this.fs.copyTpl()`来定义复制的模板文件、新生成的文件路径、需要填充的要素内容。

```javascript
renderHTML() {
    this.fs.copyTpl(
      this.templatePath('index.html'),
      this.destinationPath('public/index.html'),
      { title: 'Templating with Yeoman' }
    );
  }
```

​	最后，在命令行中，退出当前项目，新建或者使用当前目录，通过运行`yo projeetName`来生成新的文件夹。

​	用户交互能力与文件系统能力足以生成一个初始化文件，比如说 `npm init`。

3、依赖系统---对 npm 做了简单封装。可以通过`this.npmInstall()` 执行安装的命令，也可以指定参数在安装特定的库。

```javascript
class extends Generator {
  installingLodash() {
    this.npmInstall(['lodash'], { 'save-dev': true });
  }
}
```

对于系统化的管理 **npm** 库，比如说需要指定某些库的版本，可以创建或继承当前的 `package.json`文件。

```javascript
 initPackage() {
    const pkgJson = {
      devDependencies: {
        eslint: '^3.15.0'
      },
      dependencies: {
        react: '^17.0.0'
      }
    }
    this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);
    this.npmInstall();
  }
```

## 深入理解 **Generator** --- Vue 项目的脚手架

本节将会通过搭建一个 Vue 项目的脚手架，来加深对  [Yeoman](https://yeoman.io/) 的理解，同时也通过这个过程透视热门脚手架的一些原理。正常而言，一个新的项目开始，都由 npm init 来初始化一个 package.json。我们也可以在 Yeoman 中通过用户交互、文件系统交互来实现package.json的初始化，并指定需要的基础依赖。

首先，在 *generators/app/index.js* 下声明一个初始化函数，通过用户交互，来达到用户自定义某些内容。再声明一个 **JSON** 字符串，对一些固定字段进行指定，` this.fs.extendJSON()` 方法可以继承重写目标文件夹已有的 package.json 文件，或者生成新的package.json。

```javascript
// generators/app/index.js
 async initPackage() {
  let answers = await this.prompt([
     {
          type: "input",
          name: "name",
          message: "Please input your project name",
          default: this.appname // 默认为文件夹的名字
        }
      ])
      const pkgJson = {
        "name": answers.name,
        "version": "1.0.0",
        "description": "",
        "main": "index.js",
        "scripts": {
          "test": "echo \"Error: no test specified\" && exit 1"
        },
        "author": "",
        "license": "ISC",
        "devDependencies": {

        },
        "dependencies": {

        }
      }
    this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);
		this.npmInstall(['vue'], { 'save-dev': false });
 }
```

其次，由于是对 **Vue** 脚手架的搭建，因此我们需要指定安装 **Vue** 的依赖，以及对 **webpack、webpack-cli** 等 配置化的安装。依赖列表为：vue（其中 **vue** 包不需要指定依赖安装环境）、webpack、webpack-cli、vue-loader、vue-style-loader、css-loader、vue-template-compiler、copy-webpack-plugin。

```javascript
// generators/app/index.js
async initPackage() {
  ...
   this.npmInstall(['vue'], { 'save-dev': false });
    this.npmInstall([
      'webpack',
      'webpack-cli',
      'vue-loader',
      'vue-style-loader', 
      'css-loader',
      'vue-template-compiler', 
      'copy-webpack-plugin',
    ], 
    { 'save-dev': true });
}
```

然后，则需要对 **webpack** 进行配置，因此需要声明一个*webpack.config.js* 的文件模板，再到`generators/app/index.js` 下把文件模板复制到目标文件夹下。

其中 **[copy-webpack-plugin](https://webpack.js.org/plugins/copy-webpack-plugin/#root)** 主要作用是在webpack中拷贝文件和文件夹，包含的参数有：

```csharp
from  定义要拷贝的源文件              from：__dirname+'/src/components'
to    定义要拷贝到的目标文件夹         to: __dirname+'/dist'
toType  file 或者 dir               可选，默认是文件
force   强制覆盖前面的插件            可选，默认是文件
context                            可选，默认base   context可用specific  context
flatten  只拷贝指定的文件             可以用模糊匹配
ignore  忽略拷贝指定的文件            可以模糊匹配
... // 更多参数可以参考官网
```

(关于 Vue 的 webpack 的配置可以参考[Vue Loader](https://vue-loader.vuejs.org/))

```javascript
var path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CopyPlugin = require("copy-webpack-plugin"); 

module.exports = {
  entry: './src/main.js',
  module: {
    rules: [
      { test: /\.vue$/, use: 'vue-loader' },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'index_bundle.js'
  },
  plugins: [
    new VueLoaderPlugin(),
    new CopyPlugin({
      patterns: [
        { from: "src/*.html", to: "[name].[ext]" }
      ],
    }),
  ]
};

```

```javascript
// generators/app/index.js
  copyFiles() {
    this.fs.copyTpl(
      this.templatePath('webpack.config.js'),
      this.destinationPath('webpack.config.js'),
      {}
    );
  }
```

然后，再声明一个**.vue** 文件，以及 **main.js** 引用 vue 组件，**index.html **渲染根节点。

```vue
// HelloWorld.vue
<template>
  <p>{{ greeting }} World!</p>
</template>
<script>
  module.exports = {
    name: 'HelloWorld',
    data: function() {
      return {
        greeting: 'Hello vue',
      };
    },
  }
</script>
<style>
p {
  font-size: 14px;
  text-align: center;
}
</style>
```

```javascript
// main.js
import Vue from "Vue";
import HelloWorld from './HelloWorld.vue';

new Vue({
  el: '#app',
  render: h => h(HelloWorld)
});
```

```html
<!--index.html-->
<html>
  <head>
    <title><%= title %></title>
  </head>
  <body>
    <div id="app"></div>
    <script src="./main.js"></script>
  </body>
</html>
```

最后，新建一个空白文件夹，到当前目录，通过 `yo (fileName)` 初始化所有文件，在运行一下`webpack` 命令，可以看见打包的文件夹则说明成功了。新建文件夹的目录如下：

```javascript
├───package.json
└───src/
    ├───index.hmtl
    ├───main.js
 		├───HelloWorld.vue
├───webpack.config.js
└───dist/
    ├───...
└───node_modules/
    ├───...
```

## build 工具 --- Webpack 基本知识

​    在对工具链初始化后，下一步很重要的就是**build** ，**build**是同时为开发和发布服务的。目前社区比较流行的**build 工具** 主要有有 [**rollup.js**](http://rollupjs.org/guide/en/)、[**Webpack**](https://webpack.js.org/) 几款。其中**rollup.js** 是一个 *JavaScript* 模块打包器，比较适合对框架类的库进行构建，像我们熟知的 **Vue** 使用的就是它；而 **Webpack**则功能比较强大，能够通过各种 **loader** 对图片等各类非 *JavaScript* 的文件进行打包构建。在我们日常工作的项目中，使用 **Webpack** 来进行项目开发和打包的频率比较多。

​	那么，**Webpack** 的整个历程是怎么样的呢？**Webpack** 其实是为 **Node** 设计的一款打包工具，能力是把 **Node** 的代码打包成**浏览器**可用的代码。从能力而言，也是完全针对 *JavaScript* ，因为 **Node** 没有 *HTML*。**Webpack** 其实主要可以进行多文件的合并，通过 **loader** 和 **plugin** 控制合并规则和文本转换。

​	而 **Webpack** 的主要使用方法是声明一个 **webpack.config.js** 文件在其中通过*module.exports* 导出一个配置对象。而配置对象主要包括：

​	1、 **entry**，打包的入口文件。

```javascript
module.exports = {
  entry: './src/index.js',
};
```

​	2、 **output**，告知**webpack** 打包好的文件创建在哪个目录下，以及指定文件夹和文件名。默认情况下打包的文件为 `./dist/main.js`。

```javascript
module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  }
};
```

3、**Loaders**，文件解析器，通过各类**Loaders**，**webpack** 就能对非 *JavaScript* 的文件进行处理。

```javascript
module.exports = {
  ...
  module: {
    rules: [
      { test: /\.txt$/, use: 'raw-loader' }
    ]
  }
}
```

4、**Plugins**， 插件可以实现 Loaders 无法实现的功能，比如一些性能优化插件。

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm
const webpack = require('webpack'); //to access built-in plugins

module.exports = {
  module: {
    rules: [
      { test: /\.txt$/, use: 'raw-loader' }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({template: './src/index.html'})
  ]
};
```

5、**Mode**，指定模式：开发或生产，指定生产模式后，webpack 会自动执行一些优化命令，比如压缩*JavaScript* 代码。

```javascript
module.exports = {
  mode: 'production'
};
```

6、**Browser Compatibility**，webpack 5 新增属性，由于webpack需要import、Promise而的[ES5-compliant](https://kangax.github.io/compat-table/es5/)只支持IE8及以上的浏览器，因此IE8以下的环境可以需要使用*polyfill*。

7、**Environment**，webpack 5 新增属性，webpack 需要运行在 8.x 及以上的 **Node.js** 环境中。

而对于执行**webpack** 命令，可以通过全局安装 **webpack** 和 **webpack-cli**来运行，还可以通过当前文件夹下安装 **webpack-cli** ，再通过 [npx --- 可以调用项目内部安装的模块](http://www.ruanyifeng.com/blog/2019/02/npx.html) 命令来使用webpack。关于**webpack**的更多知识，可以查看极客时间的webpack课程。

## Babel 基本知识

​		**Babel** 是独立于 **Webpack** 的系统，主要是将新版本的 *JavaScript* 编译成老版本的 *JavaScript* 。我们由**babel**命令开始展开，babel 命令需要一个输入与输出，也可以直接跟一个文件名。**babel ** 不能同时处理多个文件，需要一定的脚本去调用它。

​		如何安装 **Babel** 呢? （新版本Babel 需要依赖 babel/cli。）

```javascript
npm i @babel/core @babel/cli -S-D
```

​	我们可以新建 *JavaScript*文件来测试一下，输入新版本语法，执行`babel path/fileName`会输出文件内容，通过操作系统的重定向标准输出的方式可以把转换后的内容保存到新文件中。但是转化规则需要进行[babel配置](https://babeljs.io/docs/en/configuration)，新建`.babelrc`文件来进行配置：

```javascript
// JSON 格式
{
  "presets": ["@babel/preset-env"] //  由于配置繁琐，因此presets是一些常用配置集合，需要安装 @babel/preset-env
}
```

​		注意，此处有一个小坑，那就是执行`npx babel ./source.js >target.file ` 命令还是报错，不但报错缺少 @babel/core，安装后还会缺少babel-helpers，需要把node_modules 删除重新安装。而转化前后的结果则如下：

```javascript
// 源文件
for(let a of [1, 2, 3]) {
  console.log(a);
}
// 转化后的目标文件
"use strict";

for (var _i = 0, _arr = [1, 2, 3]; _i < _arr.length; _i++) {
  var a = _arr[_i];
  console.log(a);
}
```

​		但是我们日常用的较多的是 **babel-loader**  ,用于webpack 打包时，对文件进行babel 处理。

## 本周总结

​		本周主要是工具链的全流程以及实现有一定讲解，通过这些知识完全可以自己搭建起一套通用脚手架，具体可以通过对目前流行的vue-cli、create-react-app、Umi.j等进行深入了解啦。然后还对Webpack 和 Babel 的基本知识做了简单的介绍，但是具体内容还是可以参考官方文档进入深入。