import  { Component } from './framework';


export class Carousel extends Component{
  constructor() {
    super();
    this.attributes = Object.create(null);
  }
  setAttribute(name, value) {
    this.attributes[name] = value;
  }
  render(){
    this.root = document.createElement("div");
    this.root.classList.add('.carousel');
    for (const record of this.attributes.src) {
      let child = document.createElement('div');
      child.style.backgroundImage = `url(${record})`;
      this.root.appendChild(child);
    }
    
    let position = 0;

    this.root.addEventListener("mousedown", event => {
      let startX = event.clientX;
      let move = event => {
        let x = event.clientX - startX;
        // 当前在屏幕上的元素,可以保留值的符号
        let current = position - ((x - x % 500) / 500);
        let children = this.root.children;

        for (const offset of [-1, 0, 1]) {
          let pos = current + offset;
          // 负数转正数
          pos = (pos + children.length) % children.length;
          children[pos].style.transition = 'none';
          children[pos].style.transform = `translateX(${-pos * 500 + offset * 500 + x % 500}px)`;
        }
      }
      let up = event => {
        let x = event.clientX - startX;
        position = position - Math.round( x / 500);
        // 滚动方向
        for (const offset of [0, -Math.sign(Math.round( x / 500) - x + 250 * Math.sign(x))]) {
          let pos = position + offset;
          // 负数转正数
          pos = (pos + children.length) % children.length;
          children[pos].style.transition = 'none';
          children[pos].style.transform = `translateX(${-pos * 500 + offset * 500 }px)`;
        }
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      }
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    });

    // let currentIndex  = 0;
    // setInterval(() => {
    //   let children = this.root.children;
    //   // 希望某个值在1到N之间循环，让值对N取余
    //   let nextIndex = (currentIndex + 1) % children.length;
        
    //   let current = children[currentIndex];
    //   let next = children[nextIndex];
      
    //   next.style.transition = 'none';
    //   next.style.transform = `translateX(-${100 - nextIndex * 100}%)`;

    //   setTimeout(() => {
    //     next.style.transition = '';
    //     next.style.transform = `translateX(-${-100 - currentIndex * 100}%)`;
    //     next.style.transform = `translateX(-${-nextIndex * 100}%)`;

    //     currentIndex = nextIndex;
    //   }, 16);
    // }, 3000);
    return this.root;
  }
  mountTo(parent){
    parent.appendChild(this.render());
  }
}