# Proxy 和双向数据绑定
## Proxy 的定义
Proxy 对象用于定义基本操作的自定义行为（如属性查找、赋值、枚举、函数调用等）。
## Proxy 基本用法
Proxy 有两个参数： 
1、target --- 要使用 Proxy 包装的目标对象（可以是任何类型的对象，包括原生数组，函数，甚至另一个代理）。
2、handler --- 一个通常以函数作为属性的对象，各属性中的函数分别定义了在执行各种操作时代理 p 的行为。比如： set、get、defineProperty 等。详情见(Proxy)['https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy]

```
const p = new Proxy(target, handler)
```
## 模仿 Vue 的 Reactive 实现原理
// TODO Vue3.0的Reactive具体使用方法
