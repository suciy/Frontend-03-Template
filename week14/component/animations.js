
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