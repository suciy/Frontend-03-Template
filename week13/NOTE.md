# 组件的基本概念和基本组成
`--- 组件化就是由如何扩展HTML标签延伸出来的前端架构体系，主要目标就是复用。`
## 组件化基础
* 对象
  * properties（属性）
  * methods（方法）
  * inherit（继承关系）

* 组件 --- 和UI强相关，在某种意义上可以说是模块或者特殊的对象，既是对象又是模块。特点是可以以树形结构来组合，具有一定的模版化配置能力
  * properties --- 属性
  * methods
  * inherit
  * attribute --- 特性
  * config & state --- 组件配置
  * event --- 组件向外传递
  * lifecycle --- 
  * children --- 树形结构的必要性

## 组件包含：
1、Input （输入），用户输入，影响组件状态
2、组件内部：包含状态和内部树形子节点，state 变动可能会引起子节点变化
3、组件的描述形型代码
4、来自上一级代码的属性或者函数，使用组件的程序员向开发组件的程序员进行传递
5、向外传递的函数


property 与 attribute 的区别： attribute 强调描述性 ； property 强调从属关系。attribute使用声明性的语言（markup language）进行描述，主流是基于XML来描述。

```
// Attribute
<my-component attribute=="v">
myComponent.getAttribute('a');
myComponent.setAttribute('a', 1);

// property
myComponent.a = 1;

```

```
<a href="//m.taobao.com">Link</a>
<script>
var a = document.getElementByTagName('a');
a.href // "http://m.taobao.com", url是resolve过的代码
a.getAttribute("href") // "//m.taobao.com"，和HTML代码一致
</script>
```
```
<input value="kawayi"/>
<script>
var input = document.getElementByTagName('input'); // 如果没有设置property，则结果都是attribute
input.value // kawayi
input.getAttribute('value') // kawayi
input.value = '123' // 如果value属性已经设置，则attribute不变，property变化，元素的实际效果是property 优先
input.value // 123
input.getAttribute('value') // kawayi
</script>
```
## 关于组件的生命周期
参考目前的流行框架： React 、 Vue
![lifeCycle](./lifecycle.jpg)
1、created 组件初始化
2、mount 组件 DOM 挂载
3、render/update 在遇见变更时，更新和渲染（比如用户输入、组件使用者通过js更新）
4、unmount组件DOM销毁
4、组件销毁

## Children
* Children 型 Children 与 Template 型 Children
  * Children 型 Children： 有什么展示什么
  * Template 型 Children： 组件充当展示模板，列表型会有多个

## 个人感受
组件化，也可以说是一种更高级的可预测的代码组件方式。最近，在工作中，就陷入了组件化的误区。我的划分一开始是参照业务组件和功能型组件来进行开发的。在使用 React Hooks 进行开发的时候，代码组织混乱，没有去仔细考虑组件的输入输出，以及内部的children组织方式，导致了很多问题。经过了这周课程，对组件化的认识更加清晰明了。

# JSX
  JSX 相当于一个语法的快捷方式。@babel/plugin-transform-react-jsx 编译出来的代码其实是： React.createElement() 方法。 可以在webpack中修改引用的方法：
  ```
  module.exports = {
  entry: './main.js',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: [["@babel/plugin-transform-react-jsx"], {pragma: "createELement"}]
          }
        }
      }
    ]
  },
  mode: "development"
}
```