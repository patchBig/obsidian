Type & key

- Fiber 的 type 和 key 与 React 元素的作用相同。fiber 的 type 描述了它对应的组件，对于复合组件，type 是函数或类组件本身。对于原生标签（div，span 等），type 是一个字符串。随着 type 的不同，在 reconciliation 期间使用 key 来确定 fiber 是否可以重新使用

stateNode

- stateNode 保存对组件的类实例，DOM 节点或与 fiber 节点关联的其他 React 元素类型的引用。一般来说，可以认为这个属性用于保存与 fiber 相关的本地状态。

child & sibling & return

- child 属性指向此节点的第一个子节点
- Sibling  属性指向此节点的下一个兄弟接地那
- return 属性指向此节点的父节点，即当前节点处理完毕后，应该向谁提交自己的成果。如果 fiber 具有多个子 fiber，则每个子 fiber 的 return fiber 是 parent。
- 所有 fiber 节点都通过以下属性：child，sibling 和 return 来构成一个 fiber node 的linked list

其它属性还有 memoizedState（创建输出的 fiber 的状态）、pendingProps（将要改变的 props）、memoizedProps（上次渲染创建输出的 props）、pendingWorkPriority（定义 fiber 工作优先级）



## Fiber 执行原理

从根节点开始渲染和调度的过程可以分为两个阶段：render 阶段、commit 阶段

- render 阶段：这个阶段是可中断的，会找出所有节点的变更
- commit 阶段：这个阶段是不可中断的，会执行所有的变更

### render 阶段

此阶段会找出所有节点的变更，如节点新增、删除、属性变更等，这些变更 react 统称为副作用（Effect）。此阶段会构建一棵 fiber tree，以虚拟 DOM 节点为维度对任务进行拆分，即一个虚拟 DOM 节点对应一个任务，最后产出的结果是 effect list，从中可以知道哪些节点变更、增加以及删除了。



#### 收集 Effect list

收集所有节点的变更产出 effect list，注意其中只包含了需要变更的节点。通过每个节点更新结束时向上归并 effect list 来收集任务结果，最后更节点的 effect list 里就记录了包括了所有需要变更的结果。



