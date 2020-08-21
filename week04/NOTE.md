
# 排版或布局
采用flex
##  预处理工作
将flex的一些属性，进行预处理

* 主轴（Main Axis）：排版时期主要的延伸方向
* 交叉轴（Cross Axis)：与主轴相垂直
flex-direction 可以确定主轴的延伸方向。 
### 主轴方向相关的属性
```
// flex-direction 为row时
主轴: width x left right
交叉轴: height y top bottom

// flex-direction 为column时
主轴: height y top bottom
交叉轴: width x left right

```
# 收集元素进行（hang）
参照属性： flex-wrap、 flex
分行： 1、根据主轴尺寸，把元素分进行
2、若设置了no-wrap,则强行分配进第一行

# 计算主轴方向

1、找出所有的 flex属性 元素： flex: 1
2、把主轴方向的剩余尺寸按比例分配给这些元素
3、若剩余空间为负数，所有的 flex 元素为0，等比压缩剩余元素

# 计算交叉轴方向
1、根据每一行中最大元素尺寸计算行高
2、根据行高flex-align和item-align，确定元素的具体位置

# 如何进行绘制
1、准备图形环境 --- Images
2、在viewport上进行绘制
3、与绘制相关的属性：背景色、边框
4、递归调用子元素的绘制方法完成DOM树的绘制
5、忽略一些不需要绘制的节点
6、实际浏览器中，文字绘制是难点，需要依赖子体库
7、实际浏览器中，会对一些图层做compositing


# 总结
本周主要是对元素进行排版和图片的渲染。在排版模块，参照弹性盒子布局来进行解析排版。在解析排版的过程中，由于有太多条件逻辑，乍一看有点混乱。后续，找了阮一峰老师的[Flex 布局教程](http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html)，根据各个属性去理解逻辑，总体思路还是清晰的。