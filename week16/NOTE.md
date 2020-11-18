# 学习总结
  本周主要内容分为两部分： 手势与动画的结合应用、框架内容完善--- 子节点的渲染。
## 手势动画应用
  在手势动画应用的内容中，首先引用手势库，为新创建的节点增加 enableGesture 的手势监听和辨别的操作，然后为节点增加事件监听。其中，事件监听包括：
  1、 pan：通过 pan 事件的监听，实现

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

 2、 end

```javascript
   this.root.addEventListener("end", event => {
    timeline.reset();
    timeline.start();
    handler = setInterval(nextPicture, 3000);

    let x = event.clientX - event.startX  - ax;
    let current = this[STATE].position - ((x - x % 500) / 500);

    let direction = Math.round((x % 500) / 500);

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

  3、 pan
  4、 pan
  5、 pan
在处理事件监听之后，将图片轮播的逻辑抽取出来，方便后续的拖拽、点击和结束拖拽后，关闭和重启图片轮播。

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
