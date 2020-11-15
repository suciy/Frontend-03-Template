// 获取元素容器，代表HTML元素
let element = document.documentElement;
element.addEventListener("mousedown", event => {
  start(event);
  let mousemove = (event) => {
    move(event);
  }
  let mouseup = (event) => {
    end(event);
    element.removeEventListener("mousemove", mousemove);
    element.removeEventListener("mouseup", mouseup);
  }
  element.addEventListener("mousemove", mousemove);
  element.addEventListener("mouseup", mouseup);
});

// touch 事件一旦触发，就一定会触发move。touch和move一定触发在一个元素
// touch 事件的 changedTouches 数组获取clientX
// identifier 是唯一标识符去追踪move的点
element.addEventListener("touchstart", event => {
  for (const touch of event.changedTouches) {
    start(touch);
  }
});
element.addEventListener("touchmove", event => {
  for (const touch of event.changedTouches) {
    move(touch);
  }
});
element.addEventListener("touchend", event => {
  for (const touch of event.changedTouches) {
    end(touch);
  }
});
// touchcancel 表示手指touch的点的序列是以异常结束的，或者系统类操作都会打断，比如alert
element.addEventListener("touchcancel", event => {
  for (const touch of event.changedTouches) {
    cancel(touch);
  }
});

let hanlder;
let startX, startY;
let  isPan = false, isTap = true, isPress = false; 

let start = (point) => {
  startX = point.clientX, startY = point.clientY;
  

  hanlder = setTimeout(() => {
    isPan = false;
    isPress = false; 
    isTap = true;
    // 避免多次clear，clearTimeout(null) 会静默的处理掉
    hanlder = null;
    // pressstart， 鼓励使用者监听press，少见情况下使用 press
    console.log("press");
  }, 500);
}
let move = (point) => {
  // 10px 逻辑
  let dx = point.clientX - startX, dy = point.clientY - startY;
  console.log(dx, dy);
  // 通过判断 dx ** 2 + dy ** 2 是不是小于100，因为开根号比较慢
  if(!isPan && (dx ** 2 + dy ** 2 > 100)) {
    isTap = false; 
    isPress = true;
    isPan = true;
    console.log("panStart");
    clearTimeout(hanlder);
  }

  if(isPan) {
    console.log("pan");
  }

}
let end = (point) => {
  if(isTap) {
    console.log("tap");
    clearTimeout(hanlder);
  }
  if(isPan) {
    console.log("panend");
  }
  if(isPress) {
    console.log("pressend");
    clearTimeout(hanlder);
  }
}
let cancel = (point) => {
  clearTimeout(hanlder);
}
