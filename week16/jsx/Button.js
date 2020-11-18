import  { Component, createElement, STATE, ATTRIBUTE } from './framework.js';
import { enableGesture } from "./gesture/gesture";


export { STATE, ATTRIBUTE } from "./framework.js";

export class Button extends Component{
  constructor() {
    super();
  }

  render(){
    this.childContainer =  (<div />);
    this.root = (<div>{this.childContainer}</div>).render();
    return this.root;
  }
  appendChild(child) {
    if(!this.childContainer) {
      this.render(); 
    }
    this.childContainer.appendChild(child);
  }
}