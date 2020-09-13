# HTML 的定义： XML 与 SGML
## DTD
DTD： 是 SGML 规定的定义子集的一种文档格式。
`nbsp: no-break space，如果用nbsp作为空格分隔，会把两个词当作一个词处理。`

# HTML 标签的语义
## strong 和 em 的区别
strong 表示的是一个词在整个文章中的重要性（不改变语义地强调词的重要性）。  
em 表示的这个词在句子中的重音（辅助语气）。
## figure 标签  
figure 标签规定独立的流内容（图像、图表、照片、代码等等）， figure 元素的内容应该与主内容相关，但如果被删除，则不应对文档流产生影响。
`请使用 <figcaption> 元素为 figure 添加标题（caption）。`
## dfn 标签
<dfn> 标签可标记那些对特殊术语或短语的定义。
## samp 标签
<samp> 标签是一个短语标签，用来定义计算机程序的样本文本。  
————————
| 标签 | 描述 |
| ------ | ------ | ------ |
<em>	| 呈现为被强调的文本。| 
<strong>	| 定义重要的文本。|
<dfn> |	定义一个定义项目。|
<code> |	定义计算机代码文本。|
<samp> |	定义样本文本。|
<kbd>	 | 定义键盘文本。它表示文本是从键盘上键入的。它经常用在与计算机相关的文档或手册中。|
<var>	 | 定义变量。您可以将此标签与 <pre> 及 <code> 标签配合使用。|
————————————————————————

# HTML 语法
## 合法元素
1、Element: <tagname>...</tagname>
2、Text: text
3、Comment: <!-- comments -->
4、DocumentType: <!Document html>
5、ProcessingInstruction: <?a 1?> // 预处理语法
6、CDATA: <![CDATA[]]> ／／ 特殊语法，产生的也是文本

## 字符引用
1、&#161; --- 表示ASII码中161对应的字符
2、&amp;  --- ;
3、&lt; --- >
4、&quot; --- ""
——————————————————————————

# 浏览器 API
## DOM （文档对象模型） API
1、节点部分
* 导航类操作API
  * parentNode
  * childNodes
  * firstChild
  * lastChild
  * nextSibling
  * previousSibling
  * parentElement
  * children
  * firstElementChild
  * lastElementChild
  * nextElementSibling
  * previousElementSibling

* 修改类操作
  * appendChild
  * insertBefore
  * removeChild
  * replaceChild

* 高级操作
  * compareDocumentPosition 是一个用于比较两个节点中关系的函数  
  * contains 检查一个节点是否包含另一个节点的函数
  * isEqualNode 检查两个节点是否完全相同
  * isSameNode 检查两个节点是否是同一个节点，实际上在 JavaScript 中可以用 “===”
  * cloneNode 复制一个节点，如果传入参数true，则会连同子元素做深拷贝

2、事件部分
* addEventListener api, 3个参数：
1） 事件类型 --- type，比如：click, mouseover...
2) 回调函数 ---  listener
3) 如果是 useCapture 格式的话，改变事件模式：捕获模式或者冒泡模式 ； 如果是[, options]的话，允许传入更多信息： capture --- 事件模式，once --- 事件是否只响应一次， passive ---  表示事件是否是一个不会产生副作用，比如 onScroll 事件，传入passive达到提升性能的作用。在想阻止事件的一些默认行为时，需要将 passive 设置为 true。最常用的应用场景就是移动端默认为 false，比如在需要阻止屏幕的滚动时，可以设置 passive 为 true。

* 事件的冒泡和捕获
冒泡和捕获在不监听事件时也会发生，普通事件也会发生先捕获再冒泡的过程。 
`捕获是通过触发，浏览器去层层计算触发的是哪个元素`
`冒泡则是在捕获了之后，再向外触发，然后让元素去响应这个事件 `

3、Range API ———— 性能好，易用性差

**把一个元素的所有的子元素逆序的考点：**
  * DOM的 HTMLCollection(类似包含 HTML 元素的一个数组) 是 living collection，操作时取出来的 childNodes 会随着操作变化
  * 元素的子元素使用 insert 方法的时候不需要把原来位置挪掉，DOM 树会把元素自动 remove 掉，然后再把它 append 到新的树上

* Range API:
  * var range = new Range()
  * range.setStart(element, 9) --- 第二个参数是偏移量，如果是元素节点指的是偏移的子节点，如果是文本节点指的则是偏移文字
  * range.setEnd(element, 4)
  * var range = document.getSelection().getRangeAt(0); --- 选中Range
  * range.setStartBefore
  * range.setEndBefore
  * range.setStartAfter
  * range.setEndAfter
  * range.selectNode
  * range.selectNodeContents
  ```
  // 把在 range 选取的内容从 dom 树上完全的取下来，是一个 fragment 对象
  var fragment = range.extractContents();
  // 在range的位置增加一个节点
  range.insertNode(document.createTextNode('a'))
  ```

4、废弃API —— traversal 系列 API，可以去访问 DOM 树的所有节点的一个自动的迭代工具。

## CSSOM
可以通过 document.styleSheets 访问。  
### styleSheets Rules:
1、 document.styleSheets[0].cssRules
2、 document.styleSheets[0].insertRule("p{color: pink}", 0)
3、 document.styleSheets[0].removeRule(0)  
Rule 的类型：
1、CSSStyleRule --- 普通css rule
2、CSSCharsetRule
3、CSSImportRule
4、CSSMediaRule
5、CSSFontRule
6、CSSPageRule
7、CSSNamespaceRule
8、CSSKeyframesRule
9、CSSKeyframeRule
10、CSSSupportsRule
11、...  

### getComputedStyle
* window.getComputedStyle(elt, pseudoElt)
  * elt 想要获取的元素
  * pseudoElt 可选，伪元素 
  * 应用场景：拖拽时计算位置、部分CSS动画中间态需要暂停  


### CSSOM View
1、window --- 屏幕相关 API
* window.innerHeight, window.innerWidth --- 代表实际上使用的 viewport，浏览器的 HTML 内容实际上渲染所用的区域
* window.outWidth, window.outerHeight --- 包含浏览器的工具栏、inspector 占用的空间，即是浏览窗口所占区域
* window.devicePixelRatio（DPR） --- 屏幕上的物理像素与px的一个比值，正常屏幕下是 1: 1， Retina 屏幕下是 1:2
* window.screen
  * window.screen.width --- 实际屏幕的宽
  * window.screen.height  --- 实际屏幕的高
  * window.screen.availWidth --- 可使用的宽
  * window.screen.availHeight --- 可使用的高

2、window --- 新建浏览器窗口相关 API
* window.open("about:blank","_blank","width=100,height=100,left=100,right=100"  ) --- 第三个参数指定打开的页面的宽高和在屏幕所处的位置
* moveTo(x, y) --- 改变创建的新窗口的位置
* moveBy(x, y) --- 改变创建的新窗口的位置
* resizeTo(x, y) --- 改变创建的新窗口的尺寸
* resizeBy(x, y) --- 改变创建的新窗口的尺寸

3、scroll 相关 API
* scroll 元素
  * scrollTop
  * scrollLeft
  * scrollWidth
  * scrollHeight
  * scroll(x, y)
  * scrollIntoView()
* window
  * scrollX
  * scrollY
  * scroll(x, y)
  * scrollBy(x, y)

4、layout 相关 API
* getClientRect() 
* getBoundingClientRect()

## 其他API
1、API 来源 --- 标准化组织
* khronos
  WebGL
* ECMA
  * ECMAScript
* WHATWG 
  * HTML
* W3C
  * webaudio
  * CG/WG

