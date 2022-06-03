## 理念

### 快速响应

- CPU 的瓶颈（大计算量的操作或设备性能不足）DOM 操作
- IO 的瓶颈（发送请求后，需要等待才能进一步操作）请求前置

JS 可以操作 DOM，GUI 渲染线程与 JS 线程是互斥的。



---



### React15 架构

- Reconciler（协调器）- 负责找出变化的组件
  - 调用函数组件，或 class 组件的 render 方法，将返回的 JSX
  -  转化为虚拟 DOM
  - 将虚拟 DOM 和上次更新时的虚拟 DOM 对比
  - 通过对比找出本次更新中变化的虚拟 DOM
  - 通知 Renderer 将变化的虚拟 DOM 渲染到页面上
- Renderer（渲染器）- 负责将变化的组件渲染到页面上
  - 不同平台有不同的 renderer
  - 每次更新发生时，Renderer 接到 Reconciler 通知，将变化的组件渲染到当前的宿主环境

mount 组件会调用 mountComponent，update 组件会调用 UpdateComponent，这两个方法都会**递归更新**子组件。

#### 递归更新的缺点

由于递归执行，所以一旦开始，中途就无法中断，当层器很深，递归时间超出浏览器屏幕刷新时间，用户交互就会卡顿。

**解决办法**：用**可中断的异步更新**代替**同步的更新**



---



### React16 架构

新增了 **scheduler（调度器）**

- Scheduler（调度器）- 调度任务的优先级，高优任务优先进入 Reconciler
  - 浏览器是否有剩余时间作为任务中断的标准

*requestIdleCallback*

- 浏览器兼容性
- 触发频率不稳定，受很多因素影响。比如当切换 tab 后，之前注册的 requestIdleCallback 触发频率会变得很低
- FPS 只有 20，远低于页面流畅度要求的 60

#### Reconciler

更新工作从递归变成了可中断的循环过程。每次循环都会调用 `shouldYiled` 判断当前是否有剩余时间

```js
/** @noinline */
function workLoopConcurrent() {
  // Perform work until Scheduler asks us to yield
  while (workInProgress !== null && !shouldYield()) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}
```



##### 解决中断更新时 DOM 渲染不完全的问题

reconciler 会为变化的虚拟 DOM 打上增、删、更新的标记。

整个 scheduler 和 reconciler 的工作都在内存中进行，只有所有组件都完成 reconciler 的工作，才会统一交给 renderer。



#### Renderer（渲染器）

根据 Reconciler 为虚拟 DOM 打的标记，同步执行对应的 DOM 操作。



---



### Fiber 架构的心智模型

- 能够把可中断的任务切片处理
- 能够调整优先级，重置并复用任务
- 能够在父元素与子元素之间交错处理，以支持 react 中的布局
- 能够在 render() 中返回多个元素
- 更好地支持错误边界



#### 代数效应

用于将 *副作用* 从 *函数* 调用中分离



#### 代数效应与 Generator

- Generator 具有传染性，使用了 Generator 则上下文其他函数也需要改变
- Generator 执行的中间状态是上下文关联的

```js
function* doWork(A, B, C) {
  var x = doExpensiveWorkA(A);
  yield;
  // 此时 B 组件接收到一个高优更新，由于 generator 执行的中间状态是上下文关联的，所以计算 y 时无法复用之前已经计算出的 x，需要重新计算。
  var y = x + doExpensiveWorkB(B);
  yield;
  var z = y + doExpensiveWorkC(C);
  return z;
}
```



#### 代数效应与 Fiber

React 内部实现的一套更新机制，支持任务不同优先级，可中断与恢复，并且恢复后可复用之前的中间状态。

其中每个任务更新单元为 React Element 对应的 Fiber 节点



----



### Fiber 架构的实现原理



#### Fiber 的含义

1. 作为架构来说，之前 React 15 的 Reconciler 采用递归的方式执行，数据保存在递归调用栈中，所以被称为 stack Reconciler。React 16 的 Reconciler 基于 Fiber 节点实现，被称为 Fiber Reconciler
2. 作为静态的数据结构来说，每个 Fiber 节点对应一个 React element，保存了该组件的类型（函数组件/类组件/原生组件）、对应 DOM 节点等信息。
3. 作为动态的工作单元来说，每个 Fiber 节点保存了本次更新中该组件的改变的状态、要执行的工作（删除、插入、更新）



---



### Fiber 架构的工作原理



#### “双缓存”

在内存中绘制当前帧动画，绘制完毕后直接用当前帧替换上一帧画面，由于省去了两帧替换间的计算时间，不会出现从白屏到出现画面的闪烁情况。

这种**在内存中构建并直接替换**的技术叫做*双缓存*



#### 双缓存 Fiber 树

在 react 中最多会同时存在两棵 Fiber 树。当前屏幕上显示的内容对应的 Fiber 树称为 current Fiber 树，正在内存中构建的 Fiber 树称为 workInProgress Fiber 树。它们的 Fiber 节点通过 alternate 属性连接。

```js
currentFiber.alternate = workInProgressFiber;
workInProgressFiber.alternate = currentFiber;
```



当 workInProgressFiber 树构建完成交给 Renderer 渲染在页面上后，应用根节点的 current 指针指向 workInProgressFiber 树，此时 workInProgressFiber 树就变为 currentFiber 树。



#### mount 时

1. 首次执行 ReactDOM.render 会创建 fiberRootNode 和 rootFiber、其中 fiberRootNode 是整个应用的根节点，rootFiber 是 <App/> 所在组件的根节点。

之所以要区分 fiberRootNode 与 rootFiber，是因为在应用中我们可以多次调用 ReactDOM.render 渲染不同的组件树，他们会拥有不同 rootFiber。但整个应用的根节点只有一个，那就是 fiberRootNode。



---



### 深入理解 jsx

JSX 会被编译为 `React.createElement` , `React.createElement` 最终会调用 `ReactElement` 方法返回一个包含组件数据的对象，该对象有个参数 `$$typeof: REACT_ELEMENT_TYPE` 标记了该对象是个 `React Element`。

```js
export function createElement(type, config, children) {
  let propName;

  const props = {};

  let key = null;
  let ref = null;
  let self = null;
  let source = null;

  if (config != null) {
    // 将 config 处理后赋值给 props
    // ...省略
  }

  const childrenLength = arguments.length - 2;
  // 处理 children，会被赋值给props.children
  // ...省略

  // 处理 defaultProps
  // ...省略

  return ReactElement(
    type,
    key,
    ref,
    self,
    source,
    ReactCurrentOwner.current,
    props,
  );
}

const ReactElement = function(type, key, ref, self, source, owner, props) {
  const element = {
    // 标记这是个 React Element
    $$typeof: REACT_ELEMENT_TYPE,

    type: type,
    key: key,
    ref: ref,
    props: props,
    _owner: owner,
  };

  return element;
};
```



验证合法 React Element 的全局 API `React.isValidElement`

```js
export function isValidElement(object) {
  return (
    typeof object === 'object' &&
    object !== null &&
    object.$$typeof === REACT_ELEMENT_TYPE
  );
}
```



React 通过 ClassComponent 实例原型上的 isReactComponent 变量判断是否是 ClassComponent.

```js
ClassComponent.prototype.isReactComponent = {};
```



```jsx
class AppClass extends React.Component {
  render() {
    return <p>didi</p>
  }
}
console.log('这是ClassComponent：', AppClass.prototype.isReactComponent);
console.log('这是Element：', <AppClass />);

function AppFunc() {
  return <p>didi</p>;
}
console.log('这是FunctionComponent：', AppFunc);
console.log('这是Element：', <AppFunc />);
```











