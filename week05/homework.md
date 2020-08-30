title: 课后作业
----
# 为什么 first-letter 可以设置 float，而  first-line 不行呢？

首先需要先明确 :first-letter 和 :first-line 的定义：
:first-letter 用于指定一个元素的第一个字母样式。

:first-line 作用于设置元素中的第一行文本的样式，不论该行出现多少单词。  

所以根据二者的定义，:first-letter 主要作用于的是文本第一个字母，而:first-line 主要作用于的是元素的第一行文字。如果对第一行文字进行浮动，类似于对块级子元素，有父元素高度塌陷的可能。
