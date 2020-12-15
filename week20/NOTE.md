# 发布系统 --- 持续集成
## 发布前检查的相关知识
​	持续集成的概念一开始由客户端工程师提出，有两个重要概念：第一个概念叫 `daily build`，通过服务器端代码在每晚进行全局`build`；第二个概念叫 `build verification test`（BVT），构建的验证测试，属于冒烟测试，对`build`的内容进行验证。前端的持续集成与传统的持续集成是有一定区别的，前端的`build`时间更简单，我们可以控制在一个更短的时间线范围。对于前端短周期开发而言，使用轻量级（BVT）测试就可以简单校验。

  前端可以使用类似于`PhantomsJS`的无头浏览器进行持续集成，可以生成完整`DOM` 树，检查`DOM` 树的特定格式来完成BVT。本周主要介绍三方面知识，一是通过`Git Hook` 来获取校验时机，二是通过`Eslint`进行代码轻量级检查，三是通过`PhantomsJS`对代码生成出的样子做规则校验和检查。

## [Git Hooks]('https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks')基本用法

  	每一个 `git` 仓库默认会有`Git Hooks`，我们以一个简单栗子🌰尝试一下。首先新建一个干净的文件夹，然后新建一个`README.md`，然后通过`git init` 初始化代码仓库，将`README.md` 文件提交至缓存区，可以通过`git status` 查看文件状态。然后我们可以通过`ls -a` 可以找到`.git` 文件夹。

```javascript
mkdir git-demo
cd git-demo
touch README.md // 新建README.md 
git init // 初始化代码仓库
git add README.md
git commit -a -m 'init'
git log // 查看提交记录
ls -a // 查看.git文件夹
open ./.git // 打开.git， Windows使用start命令，Linux和Mac使用open
```
​	  我们可以打开看看`.git` 文件夹，看到`hooks` 文件夹包含多个后缀为`.sample`的文件，去掉后缀，其实是Linux可以执行的文件。如果需要对服务端的git进行处理的话，就可以使用`pre-receive`。一般而言，我们常用的就是`pre-commit` ，lint 操作一般放在这。而`git push`前的一些的检查，则放在`pre-push`中，本次也主要围绕这两个钩子进行操作。我们可以将`pre-commit.sample`文件修改为我们较为熟悉的`Node.js`：
   ```bash 
cd ./git
cd hooks
ls -l pre-commit.sample // 只有读写权限，不能让你执行
chmod +x ./pre-commit // 增加执行权限
   ```

​		然后我们可以在`pre-commit` 文件中进行简单测试，比如，在 `git commit` 命令前阻止文件提交。

```javascript
#!/usr/bin/env node // --- 对使用的语言和环境声明
let process = require("process");

console.log("hello hooks");
// 阻止提交
process.exitCode = 1;
```

​		可以`git status` 中看见文件依然还在本地缓存中，并没有上传到暂存空间中。

![stopCommit](/Users/dn/Documents/myself/Frontend-03-Template/week20/stopCommit.jpg)

## ESLint基本用法

​		[**ESLint**]('https://eslint.org/')是目前通用的代码风格检查工具。使用方法也比较简单，首先是新建文件夹，通过`npm init` 初始化，并安装依赖。直接使用`lint` 命令是没有效果的，需要通过`.eslintrc` 进行规则配置。

```bash
mkdir eslint-demo
npm i -S-D eslint // eslint属于工具因此需要--save-dev
npx eslint --init // 初始化.eslintrc
```

​		然后新建`eslint-demo/index.js`，进行简单测试：

```javascript
  let a = 1;
  for(let i of [1, 2, 3]) {
    console.log(i);
  }
```

​		控制台通过`npx eslint ./index.js`进行校验，会对变量 a 声明但是未使用进行错误提示。

## ESLint API及其高级用法

​		本节主要是将 `Eslint` 集成到我们的`git hooks`中，因此我们要使用的[API]('https://eslint.org/docs/developer-guide/nodejs-api#nodejs-api')是Node.js 风格的，基础模板如下：

```javascript
const { ESLint } = require("eslint");

(async function main() {
  // 1. Create an instance with the `fix` option.
  // 不建议使用fix: true，可能造成bug
  const eslint = new ESLint({ fix: true });

  // 2. Lint files. This doesn't modify target files.
  // 对某些目录文件夹的文件进行lint
  const results = await eslint.lintFiles(["lib/**/*.js"]);

  // 3. Modify the files with the fixed code.
  await ESLint.outputFixes(results);

  // 4. Format the results.
  const formatter = await eslint.loadFormatter("stylish");
  const resultText = formatter.format(results);

  // 5. Output it.
  console.log(resultText);
})().catch((error) => {
  process.exitCode = 1;
  console.error(error);
});
```

​	回到我们的`git-demo`文件夹，通过`npm init` 初始化文件夹，安装`eslint`的依赖，并且通过`npx eslint --init` 初始化`.eslintrc`。再对我们的`pre-commit` 进行修改：

```javascript
#!/usr/bin/env node
let process = require("process");
const { ESLint } = require("eslint");

(async function main() {
  // 1. Create an instance with the `fix` option.
  const eslint = new ESLint({ fix: false });

  // 2. Lint files. This doesn't modify target files.
  const results = await eslint.lintFiles(["index.js"]);


  // 4. Format the results.
  const formatter = await eslint.loadFormatter("stylish");
  const resultText = formatter.format(results);

  // 5. Output it.
  console.log(resultText);
  // 由于eslint的错误不算检查异常，因此需要自行对错误进行阻止提交操作
  for (const result of results) {
    if(result.errorCount) {
      process.exitCode = 1;
    }
  }
})().catch((error) => {
  process.exitCode = 1;
  console.error(error);
});
```

​		但是目前需要去处理一下边界情况：在进行`git add .`后再次进行编辑，commit的版本是执行过`git add .`的文件，但是校验的确实当前修改的版本。可以通过`git stash` 相关命令来处理。

```bash
git stash push
git stash list // 查看记录
git stash pop // 两次更改被合成了一次
git add .
git stash push -k // 变更依然在，eslint依然检查要提交的版本
git stash pop // 将之前的修改释放回来
```

​	我们也可以集成到我们的`pre-commit`中，自动会执行这些命令。

```javascript
#!/usr/bin/env node
let process = require("process");
++ let child_process = require("child_process");
const { ESLint } = require("eslint");

++ function exec(name) {
 ++  return new Promise(function(resolve) {
 ++    child_process.exec(name, resolve)
 ++  });
++ }

(async function main() {
  // 1. Create an instance with the `fix` option.
  const eslint = new ESLint({ fix: false });

  // 2. Lint files. This doesn't modify target files.
++  await exec('git stash push -k');

  const results = await eslint.lintFiles(["index.js"]);

++  await exec('git stash pop');

  // 4. Format the results.
  const formatter = await eslint.loadFormatter("stylish");
  const resultText = formatter.format(results);

  // 5. Output it.
  console.log(resultText);
  for (const result of results) {
    if(result.errorCount) {
      process.exitCode = 1;
    }
  }
})().catch((error) => {
  process.exitCode = 1;
  console.error(error);
});
```

## 使用无头浏览器检查DOM

​		由于`PhantomsJS`过于老旧，因此使用Chrome推出的`Headless`（Headless Browser（无头的浏览器）是浏览器的无界面状态，可以在不打开浏览器GUI的情况下，使用浏览器支持的性能。） 来进行检查。

​		具体使用方法，首先需要在（Mac）电脑的终端中执行`alias chrome="/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome"`，然后就可以通过`chrome` 来执行了，`chrome --headless` 就是使用无头浏览器。

​		通过`chrome --headless --dump-dom about:blank` 就可以执行后的DOM打印在终端。通过`chrome --headless --dump-dom about:blank >tmp.txt `就可以执行后的DOM输出在指定文件夹中。

​		可以安装[puppeteer]('https://github.com/puppeteer/puppeteer') 来代替`PhantomsJS`的命令行，新建`headless-demo`，然后新建`main.js`进行逻辑编写。

```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://localhost:8080/main.html', {waitUntil: 'networkidle2'});
  // $$ 取照片
  const img = await page.$$('a');
  console.log(img);
  await browser.close();
})();
```

## 总结

​	持续集成是发布系统的最后一环，而在持续集成中又包括`git hooks`，`eslint`、`puppeteer`形成强有力的保障。

​	同时，这周也是整个训练营的最后一周课，在这20周，经历过无数头皮发麻、不想坚持下去的时候，但是努力走过去的20周，学习到了很多，也得到了很多。

​	毕业🎓快乐～～～！！！