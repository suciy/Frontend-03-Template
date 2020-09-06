# CSS 排版
## 盒
### 概念引入
1、标签 —— Tag， 源自源代码的概念
2、元素 —— Element， 源自语义的概念
3、盒 —— Box， 是一种表现。
`盒模型是进行排版的基本单位。`
```
HTML代码中可以书写开始__标签__，结束__标签__ ，和自封闭__标签__ 。

一对起止__标签__ ，表示一个__元素__ 。

DOM树中存储的是_元素___和其它类型的节点（Node）。

CSS选择器选中的是__元素__ 。

CSS选择器选中的__元素__ ，在排版时可能产生多个__盒__ 。

排版和渲染的基本单位是__盒__ 。
```
### 盒模型
盒模型的几个属性：
1、content —— 内容
2、border —— 边框
3、margin —— 外边距，主要影响盒的排版
4、padding —— 内边距，主要影响盒内的排版  
box-sizing:
1、content-box：盒模型的宽高设置的就是内容大小，整个盒的宽高 = content + border + padding + margin
2、border-box：整个盒的宽高 = 宽高  

## 正常流
### 三代排版技术
1、基于正常流和正常流的一些基础设施的排版
2、基于 flex 技术的排版（主流还是 flex 排版）
3、基于 grid 技术的排版
--- 第3.5个版本，未来可能会有出现的 [CSS Houdini](https://zhuanlan.zhihu.com/p/20939640)

### 基础正常流
排版的主要内容： 盒、文字。
文字排版规则：
1、从左到右排版
2、同一行写的文字都是对齐的（基线）
3、一行排满了，就换到下一行  

正常流排版：
1、收集盒进行
2、计算盒在行中的排布
3、计算行的排布  

BFC —— block-level-formatting-context， 块级格式化上下文  

IFC —— inline-level-formatting-context， 行内级格式上下文

### 正常流的行级排布
行模型的主要线：
1、line-top：出现于行高 > 文字的高度的情况
2、text-top：受字体大小影响，多种不同大小字体混排，以最大值决定  
3、base-line： 以英文字母对齐为主
4、text-bottom：受字体大小影响，多种不同大小字体混排，以最大值决定  
5、line-bottom：出现于行高 > 文字的高度的情况
 
`盒的先后顺序以及盒的尺寸会影响line-top、line-bottom 的位置`

行内盒inline-block 的基线随着内部文字的变化的，可以使用 vertical-align。

### 正常流的块级排布
float 与 clear：
float元素出现后，会影响行盒的尺寸，高度占据的地方，尺寸都会被影响。浮动元素会相互堆叠，会发生一定的重排的行为。
clear 是找一块干净的空间，形成浮动。  

边距折叠（margin collapse）：
从上往下排列的两个盒模型，如果两个盒模型都存在 margin 属性，并且不为0，两个盒模型的距离的是取二者的最大值，并不是二者相加。

### BFC 合并
Block 的概念： 
* Block Container： 里面有BFC的，能容纳正常流的盒
* Bolck-level Box:外面有BFC的
* Block Box = Block Container + Bolck-level Box（里外都有BFC）  

Block Container 包括哪些：
* block
* inline-block
* table-cell
* flex-items
* grid cell
* table-caption

 Bolck-level Box 包括：
 * Block level
  1、display: block
  2、display: flex
  3、display: table
  4、display: grid
  ...
 * inline level
  1、display: inline-block
  2、display: inline-flex
  3、display: inline-table
  4、display: inline-grid
  ...

`display: run-in，跟随自己的上一级排版。基本没有使用`

如何设立 BFC：
* floats
* absolutely positioned elements  
* block container:
  * flex-items
  * grid cell
  ...
* and block boxes with 'overflow' other than 'visible'
简而言之，默认能容纳正常流的盒都能创建BFC，除了 Blcok Box 里外都是 BFC，且 overflow 为 visible的情况。

BFC合并后的影响（block box && overflow: visible)
* BFC合并与float
* BFC合并与边距折叠

### flex 排版
1、收集盒进行
2、计算盒在主轴方向的排布
3、计算盒在交叉轴方向的排布

# CSS 动画与绘制
## 动画 -- Animation
1、@keyframes 定义
```
@keyframes myAnimation{
  from: {background: red;}
  to: {background: yellow;}
}
@keyframes myAnimation{
  10%: {background: red;}
  100%: {background: yellow;}
}
```
2、 animaition 属性的使用
```
div {
  animation: myAnimation 5s infinite;
}
```
具体属性：
* animation-name 时间曲线
* animation-duration 动画的时长
* animation-timing-function 动画的时间曲线
* animation-delay 动画开始前的延迟
* animation-iteration-count 动画的播放次数
* animation-direction 动画的方向  
3、 transition
* transition-property 要变换的属性
* transition-duration 变换的时长
* transition-timing-function 时间曲线
ease-in 缓慢启动（常用于停止动画），ease-out 缓慢停止
* transition-delay 延迟
## 颜色
HSV和HSL
## 绘制
* 几何图形
  * border
  * box-shadow
  * border-radius
* 文字
  * font
  * text-decoration
* 位图
  * background-image
