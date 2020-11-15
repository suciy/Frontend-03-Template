// 解耦
// 1、listen => 2、recognize => 3、dispatch

// new Listenr(new Recognizer(dispatch))
export class Listenr {
  constructor(element, recognizer) {

    let contexts = new Map();

    // 全局变量，判断是否正在监听，解决mouseup被多绑定一次导致end报错的问题
    let isListeningMouse = false;

    // 鼠标拖拽事件，一般在左键发生，因此在start做处理：判断左键是否按下
    element.addEventListener("mousedown", event => {
    // event.button是数字0---左键，1,2---右键,3,4,5，代表的是按下的是哪个键

    // 避免 Object 对象的原始属性
    let context = Object.create(null);
    contexts.set("mouse" + event.button, context);
    recognizer.start(event, context);

    // 古早时期，mousemove 不区分按键，button值用来区分不准确
    // 古早时期 但是 mousemove 的event有buttons ，buttons采用掩码（二进制）代表
    // 古早时期 0b11111---全部按下， 0b00001---左键，0b00010---中键，0b00011---中键和左键同时按下，
    // 现在新版浏览器button值和buttons是一样的
    let mousemove = (event) => {
      contexts.get("mouse" + event.button);
      recognizer.move(event, context);
    }

    // 两个按键同时按下时end会报错， 跑错原因在于
    // 在mousedown时，同时监听mousemove，mouseup两个，mousemove，mouseup实际上被多绑定了一次
  let mouseup = (event) => {
    // mouseup 被重复调用
    let context = contexts.get("mouse" + event.button);
    recognizer.end(event, context);

    // delete 要在 end 之后，不然context会为空
    contexts.delete(event.identifier);

    // TODO
    if(event.button === 0) {
      isListeningMouse = true;
      document.removeEventListener("mousemove", mousemove);
      document.removeEventListener("mouseup", mouseup);
    }
   
    }
    if(!isListeningMouse) {
      document.addEventListener("mousemove", mousemove);
      document.addEventListener("mouseup", mouseup);
    }
  
  });
  // touch 事件一旦触发，就一定会触发move。touch和move一定触发在一个元素
  // touch 事件的 changedTouches 数组获取clientX
  // identifier 是唯一标识符去追踪move的点
  element.addEventListener("touchstart", event => {
    // 触屏角度可能有多个touch
    for (const touch of event.changedTouches) {
        let context = Object.create(null);
        contexts.set(touch.identifier, context);
        recognizer.start(touch, context);
      }
   });
  element.addEventListener("touchmove", event => {
    for (const touch of event.changedTouches) {
      let context = contexts.get(touch.identifier);
      recognizer.move(touch, context);
    }
  });
  element.addEventListener("touchend", event => {
    for (const touch of event.changedTouches) {
      let context = contexts.get(touch.identifier);
      recognizer.end(touch, context);
      // 触发end事件之后，删除context
      contexts.delete(touch.identifier);
    }
  });
  // touchcancel 表示手指touch的点的序列是以异常结束的，或者系统类操作都会打断，比如alert
  element.addEventListener("touchcancel", event => {
    for (const touch of event.changedTouches) {
      let context = contexts.get(touch.identifier);
      recognizer.cancel(touch, context);
      // 触发cancel事件之后，删除context
      contexts.delete(touch.identifier);
    }
  });
  }
}

export class Recognizer {
  constructor(dispatcher) {
    this.dispatcher = dispatcher;
  }
  // 是否存储为全局变量：在鼠标左右键下，全局变量的形式是错误的
  // let hanlder;
  // let startX, startY;
  // let  isPan = false, isTap = true, isPress = false; 
  // 不使用全局，则使用 context 来区分
  start(point, context){
    context.startX = point.clientX, context.startY = point.clientY;
    // 采用存储一段时间之内的点，用来计算速度和平均和
    context.points = [
      {
        t: Date.now(),
        x: point.clientX,
        y: point.clientY,
      }
    ];

    hanlder = setTimeout(() => {
      context.isPan = false;
      context.isPress = false; 
      context.isTap = true;
      // 避免多次clear，clearTimeout(null) 会静默的处理掉
      context.hanlder = null;
      // pressstart， 鼓励使用者监听press，少见情况下使用 press
      this.dispatcher.dispatch('press', {});
    }, 500);
  }
  move(point, context){
    // 10px 逻辑
    let dx = point.clientX - context.startX, dy = point.clientY - context.startY;

    // 通过判断 dx ** 2 + dy ** 2 是不是小于100，因为开根号比较慢
    if(!context.isPan && (dx ** 2 + dy ** 2 > 100)) {
      context.isTap = false; 
      context.isPress = true;
      context.isPan = true;
      context.isVertical  = Math.abs(dx) < Math.abs(dy);
      // panStart 是存在数据
      this.dispatcher.dispatch('panstart', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
         // 区分上下滑动还是左右滑动
        isVertical: context.isVertical
      });
      clearTimeout(hanlder);
    }

    if(context.isPan) {
      this.dispatcher.dispatch('pan', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
         // 区分上下滑动还是左右滑动
        isVertical: context.isVertical
      });
    }
    // 计算半秒的速度
    context.points = context.points.filter(point => Date.now() - point.t < 500 );
    context.points.push(
      {
        t: Date.now(),
        x: point.clientX,
        y: point.clientY,
      }
      );

  }
  end(point, context) {
    context.isVertical  = Math.abs(dx) < Math.abs(dy);
    if(context.isTap) {
      this.dispatcher.dispatch("tap", {});
      clearTimeout(hanlder);
    }
    if(context.isPan) {
      this.dispatcher.dispatch('panend', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
         // 区分上下滑动还是左右滑动
        isVertical: context.isVertical
      });
    }
    if(context.isPress) {
      // press没有参数，长按不需要参数，只要知道按的目标
      this.dispatcher.dispatch("pressend", {});
      clearTimeout(hanlder);
    }
    context.points = context.points.filter(point => Date.now() - point.t < 500 );

    let d, v;
    if(!context.points.length) {
      v = 0;
    } else {
      // 移动的距离
      d = Math.sqrt((point.clientX -  context.points[0].x) ** 2 + 
      ( point.clientY -  context.points[0].y )** 2);
      // 离开时的速度
      v = d / (Date.now() - context.points[0].t);

      
      // 速度为1.5像素每毫秒就比较快
      if(v > 1.5) {
        this.dispatcher.dispatch('flick', {
          startX: context.startX,
          startY: context.startY,
          clientX: point.clientX,
          clientY: point.clientY,
           // 区分上下滑动还是左右滑动
          isVertical: context.isVertical,
          isFlick: context.isFlick,
          velocity: v // 速度
        });
        context.isFlick = true;
      } else {
        context.isFlick = false;
      }
      if(context.isPan) {
        this.dispatcher.dispatch('panend', {
          startX: context.startX,
          startY: context.startY,
          clientX: point.clientX,
          clientY: point.clientY,
           // 区分上下滑动还是左右滑动
          isVertical: context.isVertical,
          isFlick: context.isFlick
        });
      }
    }

  
  }
  cancel(point, context) {
    // cancel 可以对pan，press进行取消，只关注持续性
    this.dispatcher.dispatch("cancel")
    clearTimeout(context.hanlder);
  }

}

export class Dispatcher{
  constructor(element) {
    this.element = element;
  }
  dispatch(type, properties) {
    //  new CustomEvent(type)
    let event = new Event(type);
  
    for(let name in properties) {
      event[name] = properties[name];
    }
    this.element.dispatchEvent(event);
  }
}

export function enaleGesture(element) {
  new Listenr(element, new Recognizer(new Dispatcher(element)))
}