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
export const STATE = Symbol("state");
export const ATTRIBUTE = Symbol("attribute");

export class Component{
  constructor(type) {
    this[ATTRIBUTE] = Object.create(null);
    this[STATE] = Object.create(null);
  }
  setAttribute(name, value) {
    this[ATTRIBUTE][name] =  value;
  }
  appendChild(child) {
    child.mountTo(this.root);
  }
  mountTo(parentNode) {
    if(!this.root) {
      this.render();
    }
    parentNode.appendChild(this.root);
  }
  triggerEvent(type, args) {
    const upperType = type.replace(/^[\s\S]$/, s => s.toUpperCase());
    this[ATTRIBUTE]["on"+upperType] = (new CustomEvent(type, { detail: args }));
  }
  render() {
    return this.root;
  }
}

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