# React 生命周期变化

 

**原生命周期**

<img src="https://user-gold-cdn.xitu.io/2019/11/26/16ea6f5e9424c2a2"> 



componentWillReceiveProps => shouldComponentUpdate => componentWillUpdate => render => componentDidUpdate



**新生命周期**

<img src="https://user-gold-cdn.xitu.io/2019/11/26/16ea6f368bc2fd14?imageslim">



getDerivedStateFromProps => shouldComponentUpdate => render => getSnapshotBeforeUpdate => componentDidUpdate.



在 v17 将删除 `componentWillMount`, `componentWillReceiveProps` 和 `componentWillUpdate`, 只有带有 `UNSAFE_` 前缀新的生命周期方法可以使用。



**static getDerivedStateFromProps**

`static getDerivedStateFromProps(newProps, preState)`

是一个静态方法，父组件传入 newProps 和当前组件的 preState 比较，判断时候需要返回新 state，返回值对象用作更新 state，如果不需要则返回 null

```jsx
import * as React from "react";
class App extends React.Component{
	constructor(props){
		super(props);
		this.state={
			childDown:1,
			num:0
		}
	}
	static getDerivedStateFromProps(props,state){
	    if(props.isDown === state.childDown){
	        return {
	            num:state.childDown
	        }
	    }
	    return null 
	}
	render(){
        return(
            <div>1</div>
        )
    }
}
```



**shouldComponentUpdate**

`shouldComponentUpdate(props, state)`

在已挂载的组件，当 `props` 或 `state` 发生变化时，会在渲染前调用。

根据父组件的 `props` 和当前的 `state` 进行对比，返回 `true/false`。决定是否触发后续 `UNSAFE_componentWillUpdate()`, `render()` 和 `componentDidUpdate()`

React 可能将 `shouldComponentUpdate()` 认为不严格的指令，即使 `state` 为 `false`，也有可能导致组件重新渲染。



```jsx
import * as React from "react";
class App extends React.Component {
  state = { isWill: false };

  shouldComponentUpdate(props, state){ 
       if(props.val !== state.val){
           console.log("shouldComponentUpdate");
           return true
       }
   }
   render(){
        return(
            <div>1</div>
        )
    }
}

```



---

参考文章：

[React.Component](https://react.docschina.org/docs/react-component.html)

[React 的生命周期变化](https://juejin.cn/post/6844904005152276487#heading-7)

