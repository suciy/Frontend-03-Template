# 重学 CSS 
## CSS 总体结构
* @charset
* @import -- 可以有多个
* rules
  * @media -- 媒体查询
  * @page -- 页面打印
  * @rule -- 普通选择器语法
## CSS @规则研究
* @counter-style -- 计数器属性
* @keyframe -- 动画
* @fontface -- 字体，iconfont由此衍生
* @support -- 检查属性是否兼容
* @namespace -- 类似于 svg，MathML 之类的
----
不常用@规则
* @document
* @color-profile --- 过于老旧，浏览器基本不支持
* @font-feature
----
## CSS 规则的结构
* 选择器: selector_group, selector(>, <sp>,+, -), simple_selector(type, *, #,.,:,::,[],:not())
* 声明
  * Key： 分为两种，普通属性，--variables
  * Value： calc, number, length...
## 选择器
### 语法
* 简单选择器
  <ul>
    <li>*（通用选择器）</li>
    <li>div  svg|a（标签选择器）</li>
    <li>.cls（类选择器）</li>
    <li>#id（ID选择器）</li>
    <li>[attr=value]（属性选择器）</li>
    <li>:hover（伪类选择器）</li>
    <li>::before（伪元素选择器）</li>
  </ul>
  `由于 HTML 存在命名空间，主要包括 HTML、Svg、MathML，如果想选中 Svg、MathML 的元素，需要使用到单竖线，用于命名空间分割`
  `HTML 中命名空间的分割符是冒号，在CSS中就是单竖线`
* 复合选择器
  * <简单选择器> <简单选择器> <简单选择器>
  * *或者 div 必须写在最前面
* 复杂选择器
  * <复合选择器> <sp> <复合选择器> ---- 后代选择
  * <复合选择器> ">" <复合选择器>  ---- 父子选择器  
  * <复合选择器> "～" <复合选择器>  ---- 邻接元素选择器
  * <复合选择器> "+" <复合选择器>   ---- 邻接元素选择器 
  * <复合选择器> "||" <复合选择器>  ---- 可以选择表格的某一列 
### 选择器的优先级
  CSS 优先级是由4个级别的出现次数，然后采用 N 进制表示优先级，采用 N 做进位。
  四个优先级分别为： 行内选择器、ID选择器、类选择器、元素选择器。
  优先级的算法：
  每个规则对应一个初始的四位数：[0, 0, 0, 0]
  如果是行内选择器，则为[1, 0, 0, 0];
  如果是 ID选择器，则为[0, 1, 0, 0];
  如果是 类选择器/属性选择器/伪类选择器，则为[0, 0, 1, 0];
  如果是 元素选择器/伪元素选择符，则为[0, 0, 0, 1];
  算法：将每条规则中，选择符对应的数相加后得到的”四位数“，从左到右进行比较，大的优先级越高。
  `优先级相同时，则采用就近原则，选择最后出现的样式;继承得来的属性，其优先级最低。`
  `!important > 行内样式>ID选择器 > 类选择器 > 标签 > 通配符 > 继承 > 浏览器默认属性`
  以 
  ```
  `#id div.a#id{
    //......
  }
  ```
  为例子，优先级可以 [0, 2, 1, 1], S = 0 * N^3 + 2 * N^2 + 1 * N^1 + 1，取N = 1000000，在十进制的情况下，则 S = 2000001000001。
### 伪类
  1、一开始，与链接／行为相关，如：  

  * :any-link --- 匹配所有的超链接
  * :link:visited --- link 匹配未访问的超链接， visited 匹配访问过的超链接，匹配就是any-linl
  * :hover --- 用户鼠标上移
  * :active --- 当前点击
  * :focus --- 获得焦点时
  * :target --- 链接到当前目标，适用于当作锚点使用的a链接  

  2、树结构相关伪类
  * :empty     —— 表示当前元素是否有子元素
  * :nth-child() —— 表示当前元素是父元素的第几个元素
  * :nth-last-child() —— 表示当前元素是父元素的第几个元素，从后往前走
  * :first-child :last-child :only-child

  3、逻辑型选择器
  * :not 
  * :where :has

### 伪元素
* ::before —— 在元素的内容前插入为元素
* ::after —— 在元素的内容后插入为元素，通过选择器在页面添加不存在的东西
---
* ::first-line —— 选中排版后的第一行，只支持修改改font系列、color系列、background系列、word-spacing、letter-spacing、text-decoration、text-transform、line-height、clear
* ::first-letter —— 选中第一个字母，用一个不存在的元素把一部分文本括起来，让开发者可以对文本进行处理，支持修改font系列、color系列、background系列、word-spacing、letter-spacing、text-decoration、text-transform、line-height、float、vertical-align、float
clear、盒模型系列：margin、padding、border

  







