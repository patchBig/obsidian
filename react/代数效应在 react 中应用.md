## 代数效应在 react 中应用

类似 useState、useReducer、useRef 这样的 hooks，我们不需要关注 functionComponent 的 state 在 Hook 中是如何保存的，react 会为我们处理。

### 代数效应与 Generator

协调器 Reconciler 重构的一大目的是：将老的 **同步更新** 的架构变为 **异步可中断更新**

Generator 只考虑“单一优先级任务的中断和继续”是很好的实现异步可中断更新。

### 代数效应与 Fiber

React 内部实现的一套状态更新机制。其支持任务不同优先级，可中断与恢复，并且恢复后可以复用之前的中间状态。

其中每个任务更新单元为 React Element 对应的 Fiber 节点。

## Fiber 架构的实现原理

Fiber 来取代 React 16 虚拟 DOM  这一称呼。

### Fiber 的含义

- React 15 的 Reconciler 采用递归的方式执行，数据保存在递归调用栈中，所以被称为 stack Reconciler；

  React 16 的 Reconciler 基于 Fiber 节点 实现，被称为 Fiber Reconciler。

- 作为静态的数据结构，每个 Fiber 节点对应一个 React Element，保存该组件的类型、对应 DOM 节点等信息。

- 作为动态的工作单元来说，每个 Fiber 节点保存了本次更新中该组件改变的状态，要执行的工作

- 作为架构节点来说，多个 Fiber 节点依赖 `return` (指向父级 Fiber 节点)、`child` (指向子 Fiber 节点)  、`sibling` (指向右边某一个兄弟 Fiber 节点)

父级指针叫做 return 而不是 parent 或者 father，因为作为一个工作单元，return 指节点执行完 complete 后会返回的下一个节点。子 Fiber 节点及其兄弟节点完成工作后会返回其父级节点。

## Fiber 架构的工作原理

**双缓存**：在内存中构建并直接替换的技术

React 使用双缓存来完成 Fiber 树的构建与替换 - 对应 DOM 树的创建与更新。

### 双缓存 Fiber 树

当前屏幕上显示内容对应的 Fiber 树称为 current Fiber 树，正在内存中构建的 Fiber 树称为 workInProgress Fiber 树。它们通过 alternate 属性连接。

workInProgress Fiber 树构建完成交给 Render 渲染在页面上后，应用根节点的 current 指针指向 workInProgress Fiber  树，此时 workInProgress Fiber 树就变为 current Fiber 树。

### mount 和 update 时

workInProgress Fiber 的创建可以复用 current Fiber 树对应的节点数据。是否复用的过程就是 Diff 算法。

## 总结

- Reconciler 工作阶段被称为 render 阶段，因为该阶段会调用组件的 render 方法
- Renderer 工作阶段被称为 commit 阶段，把 render 阶段提交的信息渲染在页面上
- render 和 commit 阶段统称为 work，即 React 在工作中。如果任务在 Scheduler 内调度，就不属于 work。

## render 阶段

```js
// performSyncWorkOnRoot 会调用该方法
function workLoopSync() {
  // workInProgress：当前已创建的 workInProgress fiber
  while (workInProgress !== null) {
    // 创建下一个 Fiber 节点并赋值给 workInProgress，并将 workInProgress 与已创建的 Fiber 节点连接起来构成 Fiber 树
    performUnitOfWork(workInProgress)
  }
}

// performConcurrentWorkOnRoot会调用该方法
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}
```

他们唯一区别是是否调用 `shouldYield`。如果当前浏览器帧没有剩余时间，shouldYield 会中止循环，直到浏览器有空闲时间后再继续遍历。
