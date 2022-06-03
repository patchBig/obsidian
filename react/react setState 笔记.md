

1. 将 setState 传入的 partialState 参数存储当前组件实例的 state 暂存队列中
2. 判断当前 React 是否处于批量更新状态，如果是，将当前组件加入待更新的组件队列中
3. 如果未处于批量更新状态，将批量更新状态标识设置为 true，用事务再次调用前一步方法，保证当前组件加入到了待更新组件队列中
4. 调用事务的 waper 方法，遍历待更新组件队列依次执行更新
5. 执行生命周期 componentWillReceiveProps
6. 将组件的 state 暂存队列中的 state 进行合并，获得最终要更新的 state 对象，并将队列置为空
7. 执行生命周期 componentShouldUpdate，根据返回值判断是否要继续更新
8. 执行生命周期 componentWillUpdate
9. 执行真正的更新，render
10. 执行生命周期 componentDidUpdate



### 1、钩子函数和合成事件中

react 仍然处于它的更新机制中时，isBatchingUpdate 为 true。

无论调用多少次 setState，都不会执行更新，而是将要更新的 state 存入 _pendingStateQueue，将要更新的组件存入 dirtyComponent

当上一次更新机制执行完毕，以生命周期为例，所有组件，即最顶层组件 didMount 后会将 isBatchingUpdate 设置为 false，这时执行之前积累的 setState







