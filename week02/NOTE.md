学习笔记

# 浏览器工作原理
浏览器渲染流程：
* URL(涉及HTTP、DNS)
* HTML(解析HTML，BNF范式和AST语法树)
* DOM(DOM树，可以扩散到虚拟dom)
* [DOM with CSS(CSSOM树，样式层叠表)](https://suciy.github.io/2020/04/13/CSS/cascade/)
* DOM with position(render, 浏览器的渲染进程)
* 位图(显卡加载图片)

# 有限状态机处理字符串
## 有限状态机是什么？
* 在每一个机器，我们可以做计算、存储、输出。。。
  * 所有的这些机器接受的输入是一致的
  * 状态机的每一个机器没有状态，如果用函数来表示，就是无副作用的纯函数
* 每一个机器应该知道下一个状态
  * 每个机器都有确定的下一个状态（Moore）
  * 每个机器根据输入决定下一个状态（Mealy）
`个人感觉可以理解为一个流程图，在上一个状态指向下一个状态，是否结束。`
# HTTP解析——ISO-OSI七层网络协议
[关于协议](https://suciy.github.io/2020/04/13/Network/protocol/)

HTTP 属于文本型协议，每一个字节都会被理解成字符串的一部分
常见方法： GET、POST、PUT、DELETE
[HTTP扩展](https://suciy.github.io/2020/04/07/Network/https/)
# HTTP Request 请求接口设计
* method
* host
* port
* path
* headers
* body
* send -> promise
# 服务端
* conentType 是一个必要字段
* Response 格式
* 状态码
