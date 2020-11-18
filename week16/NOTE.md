# 学习总结
  本周主要内容分为两部分： 手势与动画的结合应用、框架内容完善--- 子节点的渲染。
## 手势动画应用
​    在手势动画应用的内容中，主要是重新整合首先引用手势库，为新创建的节点增加 enableGesture 的手势监听和辨别的操作，然后为节点增加事件监听。其中，事件监听包括（为了精确操作，图片移动的距离精确到像素。）

  1、 pan：通过 pan 事件的监听，实现拖拽图片的功能。

    ```
      this.root.addEventListener("pan", event => {
        let x = event.clientX - event.startX  - ax;
        let current = this[STATE].position - ((x - x % 500) / 500);
        for (const offset of [-1, 0, 1]) {
          let pos = current + offset;
          // 负数转正数
          pos = ((pos % children.length) + children.length) % children.length;
          children[pos].style.transition = 'none';
          children[pos].style.transform = `translateX(${-pos * 500 + offset * 500 + x % 500}px)`;
        }
      });
    ```
​    补充余数运算的一些知识：

>  所谓同余问题，就是给出“一个数除以几个不同的数”的余数，反求这个数，称作同余问题。 首先要对这几个不同的数的最小公倍数心中有数，下面以4、5、6为例，请记住它们的最小公倍数是60。 1、差同减差：用一个数除以几个不同的数，得到的余数，与除数的差相同， 此时反求的这个数，可以选除数的最小公倍数，减去这个相同的差数，称为：“差同减差”。 例：“一个数除以4余1，除以5余2，除以6余3”，因为4-1=5-2=6-3=3，所以取-3，表示为60n-3。 【60后面的“n”请见4、，下同】 2、和同加和：用一个数除以几个不同的数，得到的余数，与除数的和相同， 此时反求的这个数，可以选除数的最小公倍数，加上这个相同的和数，称为：“和同加和”。 例：“一个数除以4余3，除以5余2，除以6余1”，因为4+3=5+2=6+1=7，所以取+7，表示为60n+7。 3、余同取余：用一个数除以几个不同的数，得到的余数相同， 此时反求的这个数，可以选除数的最小公倍数，加上这个相同的余数，称为：“余同取余”。 例：“一个数除以4余1，除以5余1，除以6余1”，因为余数都是1，所以取+1，表示为60n+1。 4、最小公倍加：所选取的数加上除数的最小公倍数的任意整数倍（即上面1、2、3中的60n）都满足条件， 称为：“最小公倍加”，也称为：“公倍数作周期”。

 2、 end：通过 end 事件的监听，对时间线的重置和定时器进行处理。然后通过拖拽的距离计算，通过 Timeline 重新进行轮播动画。

```javascript
   this.root.addEventListener("end", event => {
    timeline.reset();
    timeline.start();
    handler = setInterval(nextPicture, 3000);

    let x = event.clientX - event.startX  - ax;
    let current = this[STATE].position - ((x - x % 500) / 500);

    let direction = Math.round((x % 500) / 500);

    // 通过对 flick 和速度的判断，来计算拖拽的距离
    if(event.isFlick) {
     if(event.velocity > 0) {
       direction = Math.floor((x % 500) / 500);
     } else {
      direction = Math.ceil((x % 500) / 500);
     }
    }
      for (const offset of [-1, 0, 1]) {
      let pos = current + offset;
      // 负数转正数
      pos = ((pos % children.length) + children.length) % children.length;
      children[pos].style.transition = 'none';
      timeline.add(new Animation(children[pos].style, "transform",
        -pos * 500 + offset * 500 + x % 500,
        -pos * 500 + offset * 500 + direction * 500, 
        500, 0, ease, v => `translateX(${v}px)`
      ));
    }

    this[STATE].position = this[STATE].position - ((x - x % 500) / 500) - direction;
    this[STATE].position = ((this[STATE].position % children.length) + children.length) % children.length;
    this.triggerEvent("change", {position: this[STATE].position});
});
```

  3、 tap，通过tap事件的监听触发事件处理器的逻辑，实现组件自定义事件功能（类似于React的事件处理）。

```javascript
  this.root.addEventListener("tap", event => {
      this.triggerEvent("click", {
        position: this[STATE].position,
        data: this[ATTRIBUTE].src[this[STATE].position]
      });
    });

```

而在框架文件中，需要增加触发事件处理，并将事件的首字母大写，与DOM事件流的事件区分：

```javascript

	triggerEvent(type, args) {
  // 转化为首字母大写
  const upperType = type.replace(/^[\s\S]$/, s => s.toUpperCase());

  // 将参数传递在 event 的 detail 属性中
  this[ATTRIBUTE]["on"+upperType] = (new CustomEvent(type, { detail: args }));

 }
```

  4、 start，在点击开始后，暂停轮播，清除定时器，并更新拖动速度。

```javascript
this.root.addEventListener("start", event => {
      timeline.pause();
      clearInterval(handler);
      if(Date.now() - t < 1500) {
        let progress  = (Date.now() - t) / 1500;
        ax = ease(progress) * 500 - 500;
      } else {
        ax = 0;
      }
     
    });
    
```

在处理事件监听之后，将图片轮播的逻辑抽取出来，方便后续的拖拽、点击和结束拖拽后，关闭和重启图片轮播。通过 Timeline 的 start 方法创建 Animation 动画，对当前图片和下一张的图片起始值，终止值进行计算赋值。

```javascript
		let nextPicture = () => {  
      // 希望某个值在1到N之间循环，让值对N取余
      let nextPosition = (this[STATE].position + 1) % children.length;

      let current = children[this[STATE].position];
      let next = children[nextPosition];
      // 使用 t 保存动画开始的时间
      t =  Date.now();
      timeline.add(new Animation(current.style, "transform",
       - this[STATE].position * 500,-500 - this[STATE].position * 500, 1500, 0, ease, v => `translateX(${v}px)`
       ));
       timeline.add(new Animation(next.style, "transform",
       500 - nextPosition * 500, - nextPosition * 500, 1500, 0, ease, v => `translateX(${v}px)`
       ));
      
       this[STATE].position = nextPosition;
       this.triggerEvent("change", {position: this[STATE].position});
    }
```

为了方便使用库的人对当前展示的图片进行一些处理，我们需要增加一些状态，暴露给外部使用。为了保护内部数据不重复，采用了 Symbol 命名。而在 Carousel 中，直接引用常量来进行状态管理。

```javascript
// framework.js
export const STATE = Symbol("state");
export const ATTRIBUTE = Symbol("attribute");
// Carousel.js
import  { Component, STATE, ATTRIBUTE } from './framework.js';
```

## 子节点的渲染

​		**子节点**（children）有两种类型，文本节点和 Template 节点。为了实现对这两个类型的子节点渲染，我们需要对 createElement 方法进行一定的修改。通过抽象子节点渲染模块逻辑，遍历子节点，然后对子节点的类型进行判断来区分文本子节点和模板类型子节点。如果是模板类型子节点，则递归处理，否则 TextWrapper 包裹子节点渲染。

``` javascript
export function createElement(type, attributes, ...children){
  let element;
  if(typeof  type === "string") {
    element = new ElementWrapper(type);
  } else {
    element = new type;
  }
  for (const name in attributes) {
    element.setAttribute(name, attributes[name]);
  }
  let processChildren = (children) => {
    for (const child of children) {
      if ((typeof child === 'object') && (child instanceof Array)) {
        processChildren(child);
        continue;
      }
      if(typeof child === 'string') {
        child = new TextWrapper(child);
      }
      element.appendChild(child);
    }
  }
  processChildren(children);
  return element;
}
```

而在 TextWrapper、ElementWrapper  类中，通过继承 Component 类，达到组件渲染的目的。

```javascript
class ElementWrapper extends Component{
  constructor(type) {
    super();
    this.root = document.createElement(type);
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value)
  }
}
class TextWrapper extends Component{
  constructor(content) {
    super();
    this.root = document.createTextNode(content);
  }
}
```

## 总结和思考

​	这周课程最重要的内容就是完善组件，对组件状态值处理以及Symbol的应用。其中组件的事件处理，可以透视出 React 框架对于事件的处理，而 createElement 类也可以扩展到 React 源码中。