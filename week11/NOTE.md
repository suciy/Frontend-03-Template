# 字符串分析算法
整体目录：
## 字典树
  * 大量高重复字符串的存储与分析 ---- 检查两个字符串是不是完全匹配
实现一个 Trie 类：
1、使用 Object／Map 来作为字典树的节点，Object和 Map比较适合存储字典树分支的数据结构
2、使用 Object.create(null) 创建对象，避免原型上的污染
3、insert 方法把字符串插入字典树
4、most 方法查询出现最多次数的单词
```
  let $ = Symbol('$');
  class Trie {
    constructor() {
      this.root = Object.create(null); 
    }
    insert(word) {
      let node = this.root;
      for(let c of word) {
        if(!node(c)) { // 子树不存在，创建一个子树
          node[c] = Object.create(null);
        }
        node = node[c];// 让node进入下一个层级
      }
      if(!($ in node)) { // 使用Symbol不可重复的特点做一个截止符
        node[$] = 0;
      }
      node[$]++;
    }
    most(){
      let max = 0;
      let maxWord = null;
      let visit = (node, word) => {
        if(node[$] && node[$] > max) { // 查看树上是否有截止符
          max = node[$];
          maxWord = word;
        }
        for(let p in node) { // 在递归的时候追加一个单词
          visit(node[p], word + p);
        }
      }
      visit(this.root, "");
      console.log(maxWord, max);
    }
  }
```
*  KMP
  * 在长字符串里找模式 ---- 检查两个字符串是不是部分匹配
实现 KMP 算法 --- 重点在于判断模式串字符串是否具有高重复项
1、采用表格去描述模式串字符串自重复性
2、进行匹配
```
// 两个参数一个源字符串，一个模式字符串
function kmp(source, pattern) {
    // 计算table
    let table = new Array();
    ／／ 查询模式字符串是否有自重复
    {
      let i = 1, j = 0;
      while(i < pattern.length) {
        // 如果相等则有自重复
        if(pattern[i] === pattern[j]) {
          ++j, ++i;
          table[i] = j; // table需要更新
        } else {
          if(j > 0) {
            j = table[j];
          } else {
            ++i;
          }
        }
      }
    }
    {
      let i = 0, j = 0;
      while(i < source.length) {
        // 相等的时候则是匹配
        if(pattern[j] === source[i]) {
          ++i, ++j;
        } else {
          if(j > 0){
            j = table[j];
          } else {
            ++i;
          }
        }
        if (j === pattern.length) {
          return true;
        }
      }
      return false;
    }
    
  }
```
* WildCard
  * 带通配符的字符串模式 --- ? 匹配任意字符， * 匹配任意数量的任意字符串
定义一个 find 方法，考虑两种情况：
1、只有 * ：ab*cd*abc*a?d
  * 不同的位置的*有不同的意义： 最后可以匹配前面所有的字符，中间的字符可以尽量少匹配
  * 去掉?，一个WildCard就是若干个KMP算法，加上?就是复杂的KMP
  * 本次只考虑没有？的情况，则代码中：
    * 扫描最后一个 *
2、只有 ? ：c?d, a?d
```
  // 本次只考虑没有？的情况
  function find(source, pattern) {
    let startCount = 0;
     // 扫描一次，找出有多少个*
    for(let i = 0; i< pattern.length; i++) {
      if(pattern[i] === "*") {
        startCount++;
      }
    }
    // 处理没有*的情况
    if(startCount === 0) {
      for(let i = 0; i < pattern.length; i++) {
        if(pattern[i] !== souce[i] && pattern[i] !== "?") {
          return false;
        }
      }
      return;
    }
   
    let i = 0;
    let lastIndex = 0;
    for(let i = 0; pattern[i] !== "*"; i++) {
      if(pattern[i] !== souce[i] && pattern[i] !== "?") {
        return false;
      }
    }
    // 匹配字符串中间的*
    lastIndex = i;
    for(let p = 0; p < startCount; p++) {
      i++;
      let subPattern = "";
      while(pattern[i] !== "*") {
        subPattern += pattern[i];
        i++;
      }
      // 把*替换成任意字符
      let reg = new RegExp(subPattern.replace(/\?/g,"[\\s\\S]"), 'g');
      reg.lastIndex = lastIndex;

      if(!reg.exec(source)) {
        return false;
      }
      lastIndex = reg.lastIndex;
    }
    for(let j = 0; j < source.length - lastIndex && pattern[pattern.length - j]; j++) {
      if(pattern[pattern.length - j] !== source[source.length - j] && pattern[pattern.length - j] !== '?') {
        return false;
      }
    }
    return true;
  }

```
* 正则
  * 字符串通用模式匹配
* 状态机
  * 通用的字符串分析
* LL LR
  * 字符串多层级结构分析
