# 寻路
寻路是一种广度优先搜索算法。
## 展开
在地图上，指定起点和终点，找到通往终点的路径：
1、绘制地图
2、可以手绘破坏地图的联通性，可以通过右键清除障碍
3、可以通过按钮保存，再次刷新，地图还在
4、寻路算法
## 地图编辑器
* 100 * 100的格子，可以通过二维数组保存，但是二维数组调用消耗大，所以采用一维数组： 使用数组的 `fill()`方法填充数组
* 使用双层循环访问
* 使用 DOM API创建格子
* 使用同余的特性，找到格子的位置： `100 * y + x`
* 通过背景色来区分是否有墙
* 使用  `mousemove` 事件来绘制墙
* 右键清除
``` 
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>寻路算法</title>
</head>
<body>
  <style>
    .cell{
      display: inline-block;
      line-height:7px;
      width: 6px;
      height: 6px;
      background-color:gray;
      border-bottom: 1px solid white;
      border-right: 1px solid white;
      vertical-align: middle;
    }
    #container {
      width: 701px;
    }
  </style>
  <div id="container"></div>
  <button onclick="localStorage['map'] = JSON.stringfy(map)">save</button>
  <script>
    let map = localStorage["map"] ? JSON.parse(localStorage["map"]) : Array(10000).fill(0);

    let container = document.getElementById("container");
    for(let y = 0; y < 100; y++) {
      for(let x = 0; x < 100; x++) {
        let cell = document.createElement("div");
        cell.classList.add("cell");
        // 找到在地图对应的位置，用一维数组绘制二维矩阵
        if(map[100 * y + x] === 1){
          cell.style.backgroundColor = "black";
        }
        cell.addEventListener("mousemove", () => {
          if(mousedown) {
            if(clear) {
              cell.style.backgroundColor = "";
              map[100 * y + x] = 0;
            } else {
              cell.style.backgroundColor = "black";
              map[100 * y + x] = 1;
            }
          }
        })
        container.appendChild(cell);
      }
    }

    let mousedown = false;
    let clear = false;
    document.addEventListener("mousedown", e => {
      mousedown = true;
      clear = (e.width === 3);
    });
    document.addEventListener("mouseup", () => mousedown = false);
    document.addEventListener("contextmenu", e => e.preventDefault());
  </script>
</body>
</html>
```
## 广度优先搜索
1、什么是广度优先搜索？
广度优先搜索 --- BFS（Breadth First Search）也称为宽度优先搜索，属于一种盲目搜寻法，目的是系统地展开并检查图中的所有节点，以找寻结果。换句话说，它并不考虑结果的可能位置，彻底地搜索整张图，直到找到结果为止。也就是把能够到达的点加到集合的过程。
2、具体实现：
* 使用队列的先进先出方法使用
* 使用 JavaScript 的数组实现：push 和 shift --- 队列、pop和unshift --- 队列； push 和 pop || shift 和 unshift 形成栈
* 把起点周围的点不断加入队列，直到队列为空
```
  // 3个参数：地图、起点、终点
    function path(map, start, end) {
      // 先进先出
      var queue = [start];

      // 入队
      function insert(x, y) {
        // 鼠标操作超出范围直接返回
        if(x < 0 || x >= 100 || y < 0 || y >= 100) {
          return;
        }
        // 如果已经绘制，也直接返回
        if(map[y * 100 + x]){
          return;
        }
        // 如果找到新的节点，增加标记
        map[y * 100 + x] = 2;
        // 点入队
        queue.push([x, y]);
      }
      while(queue.length) {
        // shift、pop 广度优先，push、pop 深度优先搜索
        let [x, y] = queue.shift();
        // 如果找到end节点，则直接返回
        if(x === end[0] && y === end[1]) {
          return true;
        }
        insert(x-1, y);
        insert(x, y - 1);
        insert(x+1, y);
        insert(x, y + 1);
      }
      return false;
    }
```
## 通过异步编程可视化寻路算法
1、使用 async、await 实现可调试
2、使用背景色，标明路径
3、使用前驱节点，标明已经到达的地方
4、如果找到end节点，从后往前找前置节点
5、找到前置节点，存到地图
```
function sleep(t) {
      return new Promise((resolve, reject) => {
        setTimeout(resolve, t);
      })
    }

    // 3个参数：地图、起点、终点
    async function findPath(map, start, end) {
      let table = Object.create(map);
      // 先进先出
      var queue = [start];

      async function insert(x, y, pre) {
        // 鼠标操作超出范围直接返回
        if (x < 0 || x >= 100 || y < 0 || y >= 100) {
          return;
        }
        // 如果已经绘制，也直接返回
        if (table[y * 100 + x]) {
          return;
        }
        // await sleep(30);
        container.children[y * 100 + x].style.backgroundColor = "lightgreen";

        map[y * 100 + x] = 2;
        // 使用前驱节点，标明已经到达的地方
        table[y * 100 + x] = pre;
        queue.push([x, y]);
      }
      while (queue.length) {
        // shift、pop 广度优先，push、pop 深度优先搜索
        let [x, y] = queue.shift();
        // 如果找到end节点，则从尾节点往回一个个找自己前置节点
        if (x === end[0] && y === end[1]) {
         let path = [];
        while(x !== start[0] || y !== start[1]) {
           path.push(map[y * 100 + x]);
           // 解构语法
           [x, y] = table[y * 100 + x];
           await sleep(30);
           container.children[y * 100 + x].style.backgroudColor = "red";
        }
        return path;
        }
        await insert(x - 1, y, [x, y]);
        await insert(x, y - 1, [x, y]);
        await insert(x + 1, y, [x, y]);
        await insert(x, y + 1, [x, y]);

        // 斜向
        await insert(x - 1, y - 1, [x, y]);
        await insert(x + 1, y - 1, [x, y]);
        await insert(x - 1, y + 1, [x, y]);
        await insert(x + 1, y + 1, [x, y]);
      }
      return null;
    }
```
## 启发式寻路一
使用函数去扩散点的优先级，有目的的寻路。
只要启发式函数的估值一定小于起点到终点的路径，那就是找到最佳路径的启发式寻路，叫做 A*。找不到最佳路径的启发式寻路则是 A。 A* 是 A寻路的一个特例。
1、优化数据解构： 一个有优先级的队列
2、自定义数据结构： 排好序的，可以使用堆（最佳）
```
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>寻路算法</title>
</head>

<body>
  <style>
    .cell {
      display: inline-block;
      line-height: 7px;
      width: 6px;
      height: 6px;
      background-color: gray;
      border-bottom: 1px solid white;
      border-right: 1px solid white;
      vertical-align: middle;
    }

    #container {
      width: 701px;
    }
  </style>
  <div id="container"></div>
  <button onclick="localStorage['map'] = JSON.stringify(map)">save</button>
  <script>
    class Sorted {
      // 参考数组的sort方法的compare能力
      constructor(data, compare) {
        this.data = data.slice();
        this.compare = compare || ((a, b) => a -b) ;
      }
      take() {
        if(!this.data.length) {
          return;
        }
        let min = this.data[0];
        let minIndex = 0;

        for(let i = 1; i < this.data.length; i++){
          if(this.compare(this.data[1], min) < 0) {
            min = this.data[i];
            minIndex = i;
          }
        }
        // 不使用splice操作的原因---操作可能需要O(N)
        this.data[minIndex] = this.data[this.data.length - 1];
        this.data.pop();
        return min;
      }
      give(y) {
        this.data.push(v);
      }
    }

    let map = localStorage["map"] ? JSON.parse(localStorage["map"]) : Array(10000).fill(0);

    let container = document.getElementById("container");
    for (let y = 0; y < 100; y++) {
      for (let x = 0; x < 100; x++) {
        let cell = document.createElement("div");
        cell.classList.add("cell");
        // 找到在地图对应的位置，用一维数组绘制二维矩阵
        if (map[100 * y + x] === 1) {
          cell.style.backgroundColor = "black";
        }
        cell.addEventListener("mousemove", () => {
          if (mousedown) {
            if (clear) {
              cell.style.backgroundColor = "";
              map[100 * y + x] = 0;
            } else {
              cell.style.backgroundColor = "black";
              map[100 * y + x] = 1;
            }
          }
        })
        container.appendChild(cell);
      }
    }

    let mousedown = false;
    let clear = false;
    document.addEventListener("mousedown", e => {
      mousedown = true;
      clear = (e.width === 3);
    });
    document.addEventListener("mouseup", () => mousedown = false);
    document.addEventListener("contextmenu", e => e.preventDefault());

    function sleep(t) {
      return new Promise((resolve, reject) => {
        setTimeout(resolve, t);
      })
    }

    // 3个参数：地图、起点、终点
    async function findPath(map, start, end) {
      let table = Object.create(map);
      // 先进先出
      var queue = [start];

      async function insert(x, y, pre) {
        // 鼠标操作超出范围直接返回
        if (x < 0 || x >= 100 || y < 0 || y >= 100) {
          return;
        }
        // 如果已经绘制，也直接返回
        if (table[y * 100 + x]) {
          return;
        }
        // await sleep(30);
        container.children[y * 100 + x].style.backgroundColor = "lightgreen";
        map[y * 100 + x] = 2;
        table[y * 100 + x] = pre;
        queue.push([x, y]);
      }
      while (queue.length) {
        // shift、pop 广度优先，push、pop 深度优先搜索
        let [x, y] = queue.shift();
        // 如果找到end节点，则从尾节点往回一个个找自己前置节点
        if (x === end[0] && y === end[1]) {
          let path = [];
          while (x !== start[0] || y !== start[1]) {
            path.push(map[y * 100 + x]);
            [x, y] = table[y * 100 + x];
            await sleep(30);
            container.children[y * 100 + x].style.backgroudColor = "red";
          }
          return path;
        }
        await insert(x - 1, y, [x, y]);
        await insert(x, y - 1, [x, y]);
        await insert(x + 1, y, [x, y]);
        await insert(x, y + 1, [x, y]);

        // 斜向
        await insert(x - 1, y - 1, [x, y]);
        await insert(x + 1, y - 1, [x, y]);
        await insert(x - 1, y + 1, [x, y]);
        await insert(x + 1, y + 1, [x, y]);
      }
      return null;
    }
  </script>
</body>

</html>
```
## 启发式寻路二 --- 优化数据结构（待优化）
1、优化数据结构： 使用二叉堆
2、二叉堆：
二叉堆是一种特殊的堆，二叉堆是完全二元树（二叉树）或者是近似完全二元树（二叉树）。二叉堆有两种：最大堆和最小堆。最大堆：父结点的键值总是大于或等于任何一个子节点的键值；最小堆：父结点的键值总是小于或等于任何一个子节点的键值。
```
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>寻路算法</title>
</head>

<body>
  <style>
    .cell {
      display: inline-block;
      line-height: 7px;
      width: 6px;
      height: 6px;
      background-color: gray;
      border-bottom: 1px solid white;
      border-right: 1px solid white;
      vertical-align: middle;
    }

    #container {
      width: 701px;
    }
  </style>
  <div id="container"></div>
  <button onclick="localStorage['map'] = JSON.stringify(map)">save</button>
  <script>
    // TODO优化数据结构，二叉堆
    class Sorted {
      // 参考数组的sort方法的compare能力
      constructor(data, compare) {
        this.data = data.slice();
        this.compare = compare || ((a, b) => a - b);
      }
      take() {
        if (!this.data.length) {
          return;
        }
       let i = 0;
       while(i < this.data.length) {
        if(i * 2 + 1 >= this.data.length){
           break;
         }
        if(i * 2 + 2 >= this.data.length){
          this.data[i] = this.data[i * 2 + 1];
          i = i * 2 + 1;
          break;
         }
        if(this.compare(this.data[i * 2 + 1], this.data[i * 2 + 2]) < 0) {
           this.data[i] = this.data[i * 2 + 1];
           i = i * 2 + 1;
        } else {
          this.data[i] = this.data[i * 2 + 2];
          i = i * 2 + 2;
        }
      }
      if(i < this.data.length - 1){
        this.insertAt(i, this.data.pop());
      } else {
        this.data.pop();
      }
      return min;
    }
    insertAt(i, v) {
      this.data[i] = v;
      while (i > 0 && this.compare(v, this.data[Math.floor((i - 1) / 2)]) < 0) {
        this.data[i] = this.data[Math.floor((i-1)/2)];
        this.data[(Math.floor(i-1)/2)] = v;
        i = Math.floor((i - 1)/2);
      }
    }
    insert(v){
      this.insertAt(this.data.length, v);
    }
    get length() {
      return this.data.length;
    }
  }

    let map = localStorage["map"] ? JSON.parse(localStorage["map"]) : Array(10000).fill(0);

    let container = document.getElementById("container");
    for (let y = 0; y < 100; y++) {
      for (let x = 0; x < 100; x++) {
        let cell = document.createElement("div");
        cell.classList.add("cell");
        // 找到在地图对应的位置，用一维数组绘制二维矩阵
        if (map[100 * y + x] === 1) {
          cell.style.backgroundColor = "black";
        }
        cell.addEventListener("mousemove", () => {
          if (mousedown) {
            if (clear) {
              cell.style.backgroundColor = "";
              map[100 * y + x] = 0;
            } else {
              cell.style.backgroundColor = "black";
              map[100 * y + x] = 1;
            }
          }
        })
        container.appendChild(cell);
      }
    }

    let mousedown = false;
    let clear = false;
    document.addEventListener("mousedown", e => {
      mousedown = true;
      clear = (e.width === 3);
    });
    document.addEventListener("mouseup", () => mousedown = false);
    document.addEventListener("contextmenu", e => e.preventDefault());

    function sleep(t) {
      return new Promise((resolve, reject) => {
        setTimeout(resolve, t);
      })
    }

    // 3个参数：地图、起点、终点
    async function findPath(map, start, end) {
      let table = new Sorted([start], (a, b) => distance(a) - distance(b));
      // 先进先出
      var queue = [start];

      async function insert(x, y, pre) {
        // 鼠标操作超出范围直接返回
        if (x < 0 || x >= 100 || y < 0 || y >= 100) {
          return;
        }
        // TODO: 优化点1
        // 如果已经绘制，也直接返回
        if (table[y * 100 + x]) {
          return;
        }
        // await sleep(30);
        container.children[y * 100 + x].style.backgroundColor = "lightgreen";
        map[y * 100 + x] = 2;
        // TODO: 优化点2
        table[y * 100 + x] = pre;
        queue.push([x, y]);
      }
      
      function distance(point) {
        return (point[0] - end[0]) ** 2 + (point[1] - end[1] ** 2);
      }

      while (queue.length) {
        // shift、pop 广度优先，push、pop 深度优先搜索
        let [x, y] = queue.shift();
        // 如果找到end节点，则从尾节点往回一个个找自己前置节点
        if (x === end[0] && y === end[1]) {
          let path = [];
          while (x !== start[0] || y !== start[1]) {
            path.push(map[y * 100 + x]);
            [x, y] = table[y * 100 + x];
            await sleep(30);
            container.children[y * 100 + x].style.backgroudColor = "red";
          }
          return path;
        }
        await insert(x - 1, y, [x, y]);
        await insert(x, y - 1, [x, y]);
        await insert(x + 1, y, [x, y]);
        await insert(x, y + 1, [x, y]);

        // 斜向
        await insert(x - 1, y - 1, [x, y]);
        await insert(x + 1, y - 1, [x, y]);
        await insert(x - 1, y + 1, [x, y]);
        await insert(x + 1, y + 1, [x, y]);
      }
      return null;
    }
  </script>
</body>

</html>
```


