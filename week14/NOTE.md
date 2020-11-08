# 手势与动画
## 初步建立动画和时间线
基础动画能力就是每帧去执行某个事件的事件，其中一秒有1000毫秒，而人眼可以识别动画最高的帧率是60帧，所以一般会用16秒去处理一帧。在 JavaScript 中有3种常见处理帧的方案：
1、setInterval --- 浏览器不一定会在16秒执行，而且会产生积压，不管前面一个setInterval有没有执行完，都会执行下一个
```
  setInterval(() => {}, 16);
```
2、setTimeout ---- 只执行一次，需要使用函数名来重复使用
```
  let time = （） => setTimeout(() => {}, 16);
```
3、requestAnimationFrame --- 与浏览器帧率相关
```
let tick = （） =>  {
  let handler = requestAnimationFrame(tick);
  canselAnimationFrame(handler); // 避免资源浪费
};
```
**TimeLine** 的设计：
时间线是为了控制动画执行的过程和状态。
1、constructor --- 定义状态管理以及动画队列，开始时间
  ANIMATIONS 是一个动画队列：
  ```
 const ANIMATIONS = Symbol("animations");
  constructor() {
    this[TICK] = () => {
      requestAnimationFrame(this[TICK]);
    }
  }
  ```
2、start -- 执行动画
在 start 函数中编写 this[TICK] 的逻辑来执行动画。
`tick 需要作为一个私有变量，所以使用常量来保存（Symbol 可以保证key不重复）。将 TICK 在 start 函数中执行，虽然每次都要创建变量，但是可以直接访问 startTime。`
```
 start() {
    if(this.state !== 'Inited') {
      return;
    }
    this.state = "started";
    let startTime = Date.now();
    this[PAUSE_TIME] = 0;
    this[TICK] = () => {
      let now = Date.now();
      for (const animation of this[ANIMATIONS]) {
        let t;
        if(this[START_TIME].get(animation) < startTime) {
          t = now - startTime - this[PAUSE_TIME] - animation.delay;
        } else {
          t = this[START_TIME].get(animation) - this[PAUSE_TIME] - animation.delay;
        }
        let t  = t;
        if(animation.duration < t) {
          this[ANIMATIONS].delete(animation);
          // 避免超出范围
          t  = animation.duration;
        }
        // 如果 t 为负，说明动画没有开始
        if(t > 0){
          animation.receiveTime(t);
        }
      }
      this[TICK_HANDLER] = requestAnimationFrame(this[TICK]);
    }
    this[TICK]();
  }
```
3、rate -- 暂时不做
4、pause --- 暂停
暂停使用cancelAnimationFrame取消requestAnimationFrame，并更新暂停开始时间。
```
  pause() {
    if(this.state !== 'started') {
      return;
    }
    this.state = "paused";
    this[PAUSE_START] = Date.now();
    cancelAnimationFrame(this[TICK_HANDLER]);
  }
```
5、resume --- 唤起
唤起重新执行需要记录暂停动画的时间，并计算出暂停的间隔，再次启动更新时间差。
```
resume() {
  if(this.state !== 'paused') {
    return;
  }
  this.state = "started";
  // 暂停事件
  this[PAUSE_TIME] += Date.now() - this[PAUSE_START];
  this[TICK]();
}
```
6、reset --- 重新执行
重新执行函数内部需要把所有的值恢复默认值。
```
 reset() {
    this.state = "inited";
    this.pause();
    // let startTime = Date.now();
    this[PAUSE_TIME] = 0;
    this[PAUSE_START] = null;
    this[ANIMATIONS] = new Set();
    this[START_TIME] = new Map();
    this[TICK_HANDLER] = null;
  }
```
7、add --- 将动画加进动画队列
add 方法主要是外部调用，在内部逻辑中更新 this[ANIMATIONS],this[START_TIME]。
```
add(animation, startTime) {
    // 参数数量不足时，给addTime一个默认值
    if(arguments.length < 2) {
      startTime = Date.now();
    }
    this[ANIMATIONS].add(animation);
    this[START_TIME].set(animation, Date.now())
  }
```
**Animation** 的设计：
`Animation 属于属性动画，通过程序来改变属性来达到动画的效果。而动画还有帧动画，一般通过切换图片来达到动画的效果。`
动画类提供动画属性的赋值操作，接收 对象，属性，开始值，结束值，动画时间，延迟时间，动画函数，动画属性(transform等) 等参数。
1、constructor
2、 receiveTime --- 执行的函数，接收时间作为参数，为元素添加动画属性
```
// 属性动画
// timingFunction，template 默认值为 linear
// 防止报错
export class Animation {
  constructor(object,property, startValue, endValue, duration, delay, timingFunction = linear, template = linear) {
    this.object = object;
    this.property = property;
    this.startValue = startValue;
    this.endValue = endValue;
    this.duration = duration;
    this.timingFunction = timingFunction;
    this.delay = delay;
    this.template = template;
  }
  receiveTime(time) {
    let range = (this.endValue - this.startValue);
    // timingFunction 是一个0到1的time，返回的是一个0到1的进度的函数
    let progress = timingFunction(time / this.duration);
    this.object[this.property] = this.template(this.startValue + range * progress);
  }
}
```
而在Animation中又涉及到动画的函数，其中有三次贝塞尔曲线，由C++ 代码直接改写过来
```
// linear 是一个1:1不变的值
export let linear = v => v;

// 三次贝塞尔曲线
export function cubicBezier(p1x, p1y, p2x, p2y) {
  const ZERO_LIMIT = 1e-6;

  const ax = 3 * p1x - 3 * p2x + 1;
  const bx = 3 * p2x - 6 * p1x;
  const cx = 3 * p1x;

  const ay = 3 * p1y - 3 * p2y + 1;
  const by = 3 * p2y - 6 * p1y;
  const cy = 3 * p1y;

  function sampleCurveDerivativeX(t) {
    return (3 * ax * t + 2 * bx) * t + cx;
  }

  function sampleCurveX(t) {
    return ((ax * t + bx) * t + cx) * t;
  }

  function sampleCurveY(t) {
    return ((ay * t + by) * t + cy) * t;
  }

  function solveCurveX(x) {
    let t2 = x;
    let derivative;
    let x2;

    for (let i = 0; i < 8; i++) {
      x2 = sampleCurveX(t2) - x;
      if (Math.abs(x2) < ZERO_LIMIT) {
        return t2;
      }
      derivative = sampleCurveDerivativeX(t2);
      if (Math.abs(derivative) < ZERO_LIMIT) {
        break;
      }
      t2 -= x2 / derivative;
    }

    let t1 = 1;
    let t0 = 0;

    t2 = x;
    while (t1 > t0) {
      x2 = sampleCurveX(t2) - x;
      if (Math.abs(x2) < ZERO_LIMIT) {
        return t2;
      }
      if (x2 > 0) {
        t1 = t2;
      } else {
        t0 = t2;
      }
      t2 = (t1 + t0) / 2;
    }

    return t2;
  }

  function solve(x) {
    return sampleCurveY(solveCurveX(x));
  }

  return solve;

}

export let ease = cubicBezier(.25,.1,.25,1);
export let easeIn = cubicBezier(.42,0,1,1);
export let easeOut = cubicBezier(0,0,.58,1);
export let easeInOut = cubicBezier(.42,0,.58,1);
```
## 完整代码
```

import { linear } from "./ease";

const TICK = Symbol("tick");
const TICK_HANDLER = Symbol("tick-hanlder");
const ANIMATIONS = Symbol("animations");
const START_TIME = Symbol("start-time");
const PAUSE_START = Symbol("pause-start");
const PAUSE_TIME = Symbol("pause-time");



export class TimeLine{
  constructor() {
    this.state = 'inited';
    this[ANIMATIONS] = new Set();
    this[START_TIME] = new Map();
  }
  start() {
    if(this.state !== 'Inited') {
      return;
    }
    this.state = "started";
    let startTime = Date.now();
    this[PAUSE_TIME] = 0;
    this[TICK] = () => {
      let now = Date.now();
      for (const animation of this[ANIMATIONS]) {
        let t;
        if(this[START_TIME].get(animation) < startTime) {
          t = now - startTime - this[PAUSE_TIME] - animation.delay;
        } else {
          t = this[START_TIME].get(animation) - this[PAUSE_TIME] - animation.delay;
        }
        let t  = t;
        if(animation.duration < t) {
          this[ANIMATIONS].delete(animation);
          // 避免超出范围
          t  = animation.duration;
        }
        // 如果 t 为负，说明动画没有开始
        if(t > 0){
          animation.receiveTime(t);
        }
      }
      this[TICK_HANDLER] = requestAnimationFrame(this[TICK]);
    }
    this[TICK]();
  }
  pause() {
    if(this.state !== 'started') {
      return;
    }
    this.state = "paused";
    this[PAUSE_START] = Date.now();
    cancelAnimationFrame(this[TICK_HANDLER]);
  }
  resume() {
    if(this.state !== 'paused') {
      return;
    }
    this.state = "started";
    // 暂停事件
    this[PAUSE_TIME] += Date.now() - this[PAUSE_START];
    this[TICK]();
  }
  reset() {
    this.state = "inited";
    this.pause();
    // let startTime = Date.now();
    this[PAUSE_TIME] = 0;
    this[PAUSE_START] = null;
    this[ANIMATIONS] = new Set();
    this[START_TIME] = new Map();
    this[TICK_HANDLER] = null;
  }
  add(animation, startTime) {
    // 参数数量不足时，给addTime一个默认值
    if(arguments.length < 2) {
      startTime = Date.now();
    }
    this[ANIMATIONS].add(animation);
    this[START_TIME].set(animation, Date.now())
  }
}

// 属性动画
// timingFunction 默认值为 linear
export class Animation {
  constructor(object,property, startValue, endValue, duration, delay, timingFunction = linear, template = linear) {
    this.object = object;
    this.property = property;
    this.startValue = startValue;
    this.endValue = endValue;
    this.duration = duration;
    this.timingFunction = timingFunction;
    this.delay = delay;
    this.template = template;
  }
  receiveTime(time) {
    let range = (this.endValue - this.startValue);
    // timingFunction 是一个0到1的time，返回的是一个0到1的进度的函数
    let progress = timingFunction(time / this.duration);
    this.object[this.property] = this.template(this.startValue + range * progress);
  }
}
```
## tips
增加状态可以使流程更清晰，对性能优化也有一定作用。