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
## Vue reactive 的用处
  **Reactivity** 是一个半成品的双向绑定，可以负责从数据到DOM或者native输入的监听。

## 模仿 Vue 的 Reactive 实现原理

在 Vue3.0 的 Reactivity APIs中，reactive 的基础使用方法：
```
const obj = reactive({ count: 0 });
```
而 reactive 接收一个原始对象作为参数，返回一个 Proxy 包裹的对象。
```
function reactive<T extends object>(target: T): UnwrapNestedRefs<T>
```
因此我们可以在实现代码中确定 reactive 的基本结构：
```
  function reactive(object) {
    set(obj, prop, val) {
      obj[prop] = val;
      return obj[prop];
    },
    get(obj, prop) {
      return obj[prop];
    }
  }
```
然后为了在调用时监听到数据变化，我们需要一个 effect 来监听 reactive 包裹的数据
```
  effect(() => {
    console.log(ro.a, 'effect');
  })

  // effect 接收一个回调函数作为参数
  function effect(callback){
    callbacks.push(callback);
  };
```
而后续的数据实现双向数据绑定和更深层次的监听，以及达到性能的优化，引入新的数据结构 Map 来存储全局回调，以及全局的调用的reactive。
在 reactive 中每次获取值时，可以获取监听效果，在设置值时，可以更新全局变量。
```
  // 给 reactive 和 effect 之间建立连接
  // 在js中，没有办法获取一个函数能访问的所有变量
  // 可以通过调用函数，获得函数实际使用的变量
   let callbacks = new Map();

  // 使用全局表格来保存调用的reactive
  let reactivities = new Map();

   // 使用全局变量
   let  usedReactivities = [];
 
   let object = {
     a: { data: 1},
     b: 2
   }
   let ro = reactive(object);
 
   effect(() => {
     console.log(ro, 'effect');
   })
 
   // effect 接收一个回调函数作为参数
   function effect(callback){
     // callbacks.push(callback);
      // 在 get 注册进 usedReactivities
      usedReactivities = [];
      callback();
      console.log(usedReactivities);
      for (const reactivity of usedReactivities) {
         if(!callbacks.has(reactivity[0])) {
           callbacks.set(eactivity[0], new Map());
         }
         if(!callbacks.get(reactivity[0]).has(reactivity[1])) {
           callbacks.get(reactivity[0]).set(reactivity[1], []);
         }
         callbacks.get(reactivity[0]).get(reactivity[1]).push(callback);
      }
   };
 
   function reactive(object) {
     if(reactivities.has(object)) {
       return reactivities.get(object);
     }
     let proxy =  new Proxy(object, {
       // 可以在 get 获取监听效果
       get(obj, prop) {
         usedReactivities.push([obj, prop]);
         if(typeof obj[prop] === 'object') {
          return reactive(obj[prop]);
         }
         return obj[prop];
       },
       set(obj, prop, val) {
         if(callbacks.get(obj)) {
           if(callbacks.get(obj).get(prop)) {
             for(let callback of callbacks.get(obj).get(prop)) {
               callback();
             }
           }
         }
         return obj[prop] = val;
       }
     });
     reactivities.set(object, proxy);
   }
```
## CSSOM 和 Range
通过 CSSOM 和 Range ，实现拖拽后文字环绕的效果。
```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <div id='container'>
    文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字
    文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字
    文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字
    文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字
    文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字
    文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字
    文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字
    文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字
    文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字
    文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字
    文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字
    文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字
    文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字
    文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字
    文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字
    文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字
    文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字
    文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字
    文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字
    文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字
    文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字
    文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字
    文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字
    文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字
    文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字
    文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字 文字
  </div>
  <div id="dragable" style="width: 100px;height: 100px;background-color: pink;display: inline-block;"></div>
  <script>
    let dragable = document.getElementById('dragable');
    let baseX = 0, baseY = 0;
    dragable.addEventListener('mousedown', function(event){
      let startX = event.clientX, startY = event.clientY;
      let up = (event) => {
        baseX = baseX + event.clientX - startX;
        baseY = baseY + event.clientY - startY;
        // 在mouseup时，清空事件绑定
        document.removeEventListener("mousemove", move);
         document.removeEventListener("mouseup", up);
      };
      let move = (event) => {
        let range = getNearest(event.clientX, event.clientY);
        // insert会判断元素是否在DOM树上，会默认把之前的移除掉
        range.insertNode(dragable);
        // dragable.style.transform = `translate(${baseX + event.clientX - startX}px, ${baseY + event.clientY - startY}px)`
      };
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    })
    let ranges = [];
    // 创建 range 表，存储整个能够插入的缝隙
    let container = document.getElementById('container');
    for(let i = 0; i < container.childNodes[0].textContent.length; i++) {
      let range = new Range();
      range.setStart(container.childNodes[0], i);
      range.setEnd(container.childNodes[0], i);
      ranges.push(range);
    }
    // 在ranges中寻找离某一个point最近的range
    function getNearest(x, y) {
      let min = Infinity, nearest = null;
      for(let range of ranges) {
        let rect = range.getBoundingClientRect();
        let distance = (rect.x - x) ** 2 + (rect.y - y) ** 2 ;
        if(distance < min) {
          nearest = range;
          min = distance;
        }
      }
      return nearest;
    } 
    document.addEventListener('selectstart', e => e.preventDefault());
  </script>
</body>
</html>
```
## 实例总结
1、关于**鼠标事件**的性能优化方案以及原因：
 * 为什么要在在 mousedown 响应 mousemove,mouseup 事件：因为只有鼠标按下去后，监听事件在性能和逻辑上正确，能够确定是开始拖拽事件开始，不然鼠标一移动，就会触发mousemove，性能上不合理。
* 为什么mousemove,mouseup 需要在 document 进行监听，如果绑定在dragable上，一旦进行拖拽会发生拖动中断的问题；在document上监听就会产生捕捉鼠标的效果，即使鼠标移出浏览器范围外，事件也能被捕捉到。
2、insert节点之前为什么不需要先移除之前节点： insert会判断元素是否在DOM树上，会默认把之前的移除掉。


# 本周总结
这周的课程由于时间原因，推迟了一周。在日渐繁忙的工作和生活中，在整个学习的中后期，感觉自己有点落后。每次完成作业都有点形式打卡的感觉，然而推迟一周后，重复把这周视频看了两次，稍微沉下心来学习，能找回之前学习的感觉了。然后关于知识点，第一遍看稍微有点理解，但是需要花更多的时间，去细致了解。
后面的知识和之前的知识，都需要花时间去梳理学习。
希望后面可以再接再厉！！！