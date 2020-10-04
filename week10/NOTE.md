# 使用 LL 算法构建 AST（抽象语法树）
## 代码编译流程
1、将编程语言分词
2、把词构建成语法树 --- 语法分析
3、执行代码

## 语法分析算法
核心思想：
* LL 算法 --- 从左到右规约扫描
* LR 算法  

## 由四则运算展开
主要 token 有数值和加减乘除组成。结合前期的产生式可以更好的理解四则运算的解析。
`EOF --- End of file`
**怎样通过 LL 词法分析写出产生式**
以加法表达式为例，AdditiveExpression的结果可能是复合表达式或者是普通表达式：
```
<AdditiveExpression> ::= <MultiplicativeExpression> | <AdditiveExpression> <+> <MultiplicativeExpression> | <AdditiveExpression> <-> <MultiplicativeExpression>
```
而乘法表达式又可以展开为:
```
<AdditiveExpression> ::= 
<Number>
| <MultiplicativeExpression><*<Number>
| <MultiplicativeExpression></><Number>
| <AdditiveExpression><+><MultiplicativeExpression>
|<AdditiveExpression><-><MultiplicativeExpression> <MultiplicativeExpression
</AdditiveExpression>
```
由此可以得到一个从左到右扫描的算法。
**通过正则表达式开始词法分析**
1、正则表达式 --- 使用与或关系分隔，并且每一个都用圆括号匹配（正则里面，圆括号表示捕获／一旦被捕获，则整体表示的字符串以及括号内的内容也会被匹配）
2、使用Dictionary 来对应正则表达式的 token 名
3、使用正则的 exec 方法，不断的扫描源字符串的内容
4、使用 result 来存储结果，result[0] 是整个结构，后面才是匹配的某一个
5、循环dictionary，打印匹配的结果

```
var reg = /([0-9\.]+)|([ \t]+)|([\r\n]+)|(\*)|(\/)|(\+)|(\-)/g;

  var dictionary = ["Number", "WhiteSpace", "LineTerminator","*","/","+","-"];

  function tokensize(source) {
    var result = null;
    while(true) {
      result = reg.exec(source);
      if(!result) break;
      for(var i = 0; i < dictionary.length; i++)  {
        if(result[1]) {
          console.log(dictionary[i - 1]);
        }
        console.log(result);
      } 
    }
    
  }
  tokensize("1024 + 10 * 15");
```
**LL 词法分析**
1、增加变量 lastIndex ，补充逻辑： 匹配出来的长度与前进的长度不一致的异常处理
2、使用函数级别lastIndex，每次正则匹配的时候重新赋值，然后比较长度，如果长度不一致，就说明存在没有的字符，直接终端循环
3、尝试返回一个有效的 token ,使用变量token
4、使用Generator 返回一个序列
```
var regexp = /([0-9\.]+)|([ \t]+)|([\r\n]+)|(\*)|(\/)|(\+)|(\-)/g;

  var dictionary = ["Number", "WhiteSpace", "LineTerminator","*","/","+","-"];

  function* tokensize(source) {
    var result = null;
    var lastIndex = 0;
    while(true) {
      result = regexp.exec(source);
      if(!result) break;
      if(regexp.lastIndex - lastIndex > result[0].length) break;
      let token = {
        type: null,
        value: null
      }
      for(var i = 0; i < dictionary.length; i++)  {
        if(result[1]) {
          token.type = dictionary[i - 1];
        }
        token.value = result[0];
      } 
    }
    yield {
      type: 'EOF'
    };
  }
  for(let token of tokensize("1024 + 10 * 15")) {
    console.log(token);
  }
```
## LL 的语法分析
1、每一个产生式对应一个函数：
* MultiplicativeExpression函数，有两种输入值： Number 或者表达式（乘法表达式、除法表达式），因此有3种逻辑分支。
```
function MultiplicativeExpression(source) {
    // 一个 Number 可以形成MultiplicativeExpression， 新建一个非终结符
    if(source[0].type === "Number"){
      let node = {
        type: "MultiplicativeExpression",
        children: [source[0]] // 把Number寸金来
      }
      source[0] = node;
      // 后续递归
      return MultiplicativeExpression(source);
    }
    // 乘法形成一个新的MultiplicativeExpression
    if (source[0].type === "MultiplicativeExpression" && source[1] && source[1].type === "*") {
      let node = {
        type: "MultiplicativeExpression",
        operator: "*",
        children: []
      }
      node.children.push(source.shift());
      node.children.push(source.shift());
      node.children.push(source.shift());
      // 将新形成的结构插入到节点
      source.unshift(node);
      return MultiplicativeExpression(source);
    }
    if (source[0].type === "MultiplicativeExpression" && source[1] && source[1].type === "／") {
      let node = {
        type: "MultiplicativeExpression",
        operator: "*",
        children: []
      }
      node.children.push(source.shift());
      node.children.push(source.shift());
      node.children.push(source.shift());
      source.unshift(node);
      return MultiplicativeExpression(source);
    }
    if(source[0].type === "MultiplicativeExpression") {
      return source[0];
    }
  }
```
* AdditiveExpression 处理逻辑类似于MultiplicativeExpression产生式，包含MultiplicativeExpression产生式，所以需要重新调用MultiplicativeExpression函数。
```
  function AdditiveExpression(source) {
    if(source[0].type === "MultiplicativeExpression") {
      let node = {
        type: "AdditiveExpression",
        children: [source[0]]
      }
      source[0] = node;
      return AdditiveExpression(source);
    }
    if(source[0].type === "AdditiveExpression" && source[1] && source[1].type === "+") {
      let node = {
        type: "AdditiveExpression",
        operator: "+",
        children: []
      }
      node.children.push(source.shift());
      node.children.push(source.shift());
      // 第三项是非终结符，所以需要多一项
      MultiplicativeExpression(source);
      node.children.push(source.shift());
      return AdditiveExpression;
    }
    if (source[0].type === "AdditiveExpression" && source[1] && source[1].type === "-") {
      let node = {
        type: "AdditiveExpression",
        operator: "-",
        children: []
      }
      node.children.push(source.shift());
      node.children.push(source.shift());
      MultiplicativeExpression(source);
      node.children.push(source.shift());
      return AdditiveExpression;
    }
    if(source[0].type === "AdditiveExpression") return source(0);
    //  在第一次进来会到MultiplicativeExpression寻找
    MultiplicativeExpression(source);
    return AdditiveExpression(source);
  }
```
3、在 Expression 加上 EOF，包含 AdditiveExpression 的所有逻辑。
```
function Expression(tokens){
    if(source[0].type === "AdditiveExpression" && source.type === "EOF") {
      let node = {
        type: "Expression",
        children: [tokens.shift(), tokens.shift]
      }
      tokens.unshift(node);
      return node;
    }
    AdditiveExpression(tokens);
    return Expression(tokens);
  }
```
