const { match } = require("assert");
const css = require("css");

let currentToken = null;
let currentAttribute = null;

let stack = [{type: "document", children: []}];

let currentTextNode = null;


function emit(token){
  if (token.type === 'text') return;
  let top = stacks[stack.length - 1]; // 获取栈底元素

  if (token.type === 'startTag'){
    let element = {
      type: "element",
      children: [],
      attributes: []
    };

    element.tagName = token.tagName;

    for (const p in token) {
      if (p !== "type" && p !== "tagName") {
        element.attributes.push({
          name: p,
          value: token[p]
        })
      }
    }
    computeCSS(element);

    top.children.push(element);
    element.parent = top;

    if (!token.isSelfClosing){
      stack.push(element)
      currentTextNode = null;
    }
  }else if(token.type === "endTag"){
    if (top.tagName !== token.tagName){
      throw new Error("Tag start end doesn't match!")
    } else {
      // +++++++++++遇到style标签时，执行添加CSS规则的操作+++++++++++++++++ //
      if (top.tagName === "style"){
        addCSSRules(top.children[0].content);
      }
      stack.pop();
    }
    currentTextNode = null;
  } else if (token.type === "text"){
    if (currentTextNode === null){
      currentTextNode = {
        type: "text",
        content: ""
      }
      top.children.push(currentTextNode);
    }
    currentTextNode.content += token.content;
  }
}

// 加入一个新函数，addCSSRules，暂时把CSS规则暂存到一个数组
let rules = [];
function addCSSRules(text){
  let ast = css.parse(text);
  console.log(JSON.stringify(ast, null, "    "));
  rules.push(...ast.stylesheet.rules);
}

function match(element, selector) {
  if(!selector || !element.attributes) {
    return false;
  }
  if (selector.charAt(0) === "#"){
    let attr = element.attributes.filter(attr => attr.name === 'id')[0];
    if (attr && attr.value === selector.replace("#", '')){
      return true;
    }
  } else if(selector.charAt(0) === "."){
    let attr = element.attributes.filter(attr => attr.name === 'class')[0];
    if (attr && attr.value === selector.replace(".", '')){
      return true;
    }
  } else {
    if (element.tagName === selector) {
      return true;
    }
  }
  return false;
}

function specificity(selector){
  // 第0位对应行内样式，第1位对应ID选择器，第2位对应类选择器，第三位对应标签选择器
  let p = [0, 0, 0, 0];
  let selectorParts = selector.split(" ");
  for(let part of selectorParts){
    if (part.charAt(0) === "#"){
      p[1] += 1;
    } else if(part.charAt(0) === "."){
      p[2] += 1;
    } else {
      p[3] += 1;
    }
  }
  return p;
}


function compare(sp1, sp2){
  if (sp1[0] - sp2[0]) return sp1[0] - sp2[0];
  if (sp1[1] - sp2[1]) return sp1[1] - sp2[1];
  if (sp1[2] - sp2[2]) return sp1[2] - sp2[2];
  return sp1[3] - sp2[3];
}

function computeCSS(ele){
  // 必须知道元素的所有元素的父元素才能判断元素与规则是否匹配
  let elements = stack.slice().reverse();
  if (!element.computedStyle) {
    element.computedStyle = {};

    for(let rule of rules) {
      let selectorParts = rule.selectors[0].split(" ").reverse();

      if (!match(ele, selectorParts[0])) {
        continue;
      }
      let matched = false;
      var j = 1;
      for(var i = 0; i < elements.length; i++){
        if (match(ele, selectorParts[j])) {
          j++;
        }
      }
      if (j >= selectorParts.length){
        matched = true;
      }
      if(matched) {
        let sp = specificity(rule.selector[0]);
        let computedStyle = ele.computedStyle;
        for(let declaration of rule.declarations) {
          if(!computedStyle[declaration.property]) {
            computedStyle[declaration.property] = {};
          }
          if(!computedStyle[declaration.property]) {
            computedStyle[declaration.property].value = declaration
            computedStyle[declaration.property].specificity = sp;
          } else if (compare(computedStyle[declaration.property].specificity, sp) < 0) {
            computedStyle[declaration.property].value = declaration
            computedStyle[declaration.property].specificity = sp;
          }
        }
      }
    }
  }
}


// 利用Symbol唯一性，生成结束符，强迫一些节点结束
const EOF = Symbol("EOF"); // EOF: End Of File

function data(c){
  if(c === '<') {
    return tagOpen;
  } else if (c === EOF){
    emit({
      type: "EOF"
    })
    return;
  } else {
    emit({
      type: "text",
      content: c
    })
    return data;
  }
}

function tagOpen(c){
  if (c === '/') {
    return endTagOpen;
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: 'startTag',
      tagName: ''
    }
    return tagName(c);
  } else {
    return;
  }
}

function endTagOpen(c){
  if (c.match(/^[a-zA-Z]$/)){
    currentToken = {
      type: "endTag",
      content: ""
    }
    return tageName(c)
  } else if (c === EOF){

  } else {

  }
}

function tageName(c){
  if(c.match(/^[\t\n\f ]$/)) { // 标签的属性
    return beforeAttributeName;
  } else if (c === '/') { // 自闭合标签
    return selfClosingStartTag;
  } else if (c.match(/^[a-zA-Z]$/)){
    currentToken.tagName += c;
  }else if (c === ">"){ // 标签开始结束，返回文本节点
    emit(currentToken);
    return data;
  } else {
    return tagName;
  }
}

function beforeAttributeName(c){
  if(c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if(c === '/' || c === '>' || c === EOF){
    return afterAttributeName(c);
  } else if(c === '='){
    return beforeAttributeName;
  } else {
    currentAttribute = {
      name: "",
      value: ""
    }
    return attributeName(c);
  }
}

function attributeName(c){
  if (c.match(/^[\t\n\f ]$/) || c === '/' || c === EOF) {
    return afterAttributeName(c);
  } else if (c === "="){
    return beforeAttributeValue;
  }else if (c === '\u0000'){

  } else if (c === '\"' ||  c === "'" || c === "<"){

  } else {
    currentAttribute.name += c;
    return attributeName;
  }

}

function beforeAttributeValue(c){
  if (c.match(/^[\t\n\f ]$/) || c === '/' || c === '>' || c === EOF) {
    return beforeAttributeValue;
  } else if (c === "\""){
    return dobuleQuotedAttributeValue;
  }else if (c === '\''){
    return singleQuotedAttributeValue;
  } else if (c === ">"){

  } else {
    return UnquotedAttributeValue;
  }
}

function dobuleQuotedAttributeValue(c){
  if (c === "\""){
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterAttributeValue;
  } else if (c === "\u0000") {

  } else if (c === EOF){

  } else {
    currentAttribute.value += c;
    return dobuleQuotedAttributeValue;
  }
}

function singleQuotedAttributeValue(c){
  if (c === "\'"){
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterAttributeValue;
  } else if (c === "\u0000") {

  } else if (c === EOF){

  } else {
    currentAttribute.value += c;
    return singleQuotedAttributeValue;
  }
}

function UnquotedAttributeValue(c){
  if (c.match(/^[\t\n\f ]$/)) {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return beforeAttributeName;
  } else if(c === "/"){
    currentToken[currentAttribute.name] = currentAttribute.value;
    return selfClosingStartTag;
  } else if (c === ">"){
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c === "\u0000"){

  } else if(c === "\"" || c === "'" || c === "<" || c === "="){

  } else if (c === "EOF") {

  } else {
    currentAttribute.value += c;
    return UnquotedAttributeValue;
  }
}

function afterAttributeName(c){
  if (c.match(/^[\t\n\f ]$/)) {
    return afterAttributeName;
  } else if (c === "/"){
    return selfClosingStartTag;
  }else if (c === '='){
    return beforeAttributeValue;
  } else if (c === ">"){
    currentAttribute[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else  if(c === EOF){
    
  } else {
    currentToken[currentAttribute.name] = currentAttribute.value;
    currentAttribute = {
      name: "",
      value: ""
    }
    return attributeName(c);
  }
}

function selfClosingStartTag(c){
  if(c === ">"){
    currentTokem.isSelfClosing = true;
    return data;
  } else if(c === "EOF") {

  } else {

  }
}

module.exports.parseHTML = function parseHTML(html) {
  let state = data;
  for (let c of html){
    state = state(c);
  }
  state = state(EOF);
}