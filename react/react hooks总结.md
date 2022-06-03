## useEffect 渲染

假设第一次渲染的时候 props 是 {id: 10}，第二次渲染的时候是 {id: 20}。你可能会认为发生下面这些事情：

- React 清除了 {id: 10} 的 effect
- React 渲染了 {id: 20} 的 UI
- React 运行了 {id: 20} 的 effect

(事实并不是这样)



React 只会在渲染绘制后运行 effects。这使得你的应用更流畅因为大多数 effects 并不会阻塞屏幕的更新。Effect 的清除同样被延迟了。上一次的 effect 会在**重新渲染后被清除**：

- React 渲染了 {id: 20} 的 UI
- 浏览器绘制，在屏幕上看到 {id: 20} 的 UI
- React 清除 {id: 10} 的 effect
- React 运行 {id: 20} 的 effect

React 会保证 dispatch 在组件的声明周期内保持不变。

useReducer 解耦来自 Actions 的更新。

到处使用 useCallback 是件 ugly 的事情。当我们需要将函数传递下去并且函数会在子组件的 effect 中被调用的时候，useCallback 是很好的技巧且非常好用。

----

## useRef

If you create a ref using createRef in a functional component, React will create a new instance of the ref on every re-render instead of keeping it between renders.

- A ref created with useRef will be created only when the component has been mounted and preserved for the full lifecycle
- Refs can be used for accessing DOM nodes or React elements, and for storing mutable variable variable (like with instance variables in class components)
- Updating a ref is a side effect so it should be done only inside a useEffect (or useLayoutEffect) or inside an event handler.

