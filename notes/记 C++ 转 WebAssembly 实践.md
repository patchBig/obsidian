## 背景

WebAssembly——它又称作 wasm。为什么有这样的实践？因为 wasm 运行速度比 JS 快，想要极致的用户体验？Sorry，仅仅是一次技术需求罢了。

目的是将算法同学基于 MNN 实现姿态识别的 SDK、动作计数的 C++ 代码转译成 wasm，使其在前端通过摄像头达到姿态识别、动作计数功能，实现跨端功能，相比于客户端，帮助业务快速进行迭代。

## wasm

### 是什么？

wasm 设计之初也不是为了手写代码，它为多种低级源语言提供编译目标，如 C/C++、C# 和 Rust 代码，在浏览器中以接近原生的性能运行。暴露出的 wasm 函数供 JavaScript 调用，获得性能提升。

它是一种类似于汇编的低级语言，具有严谨的二进制格式，是一种**虚拟指令集架构**（*virtual instruction set architecture, virtual ISA*）。wasm 能在非浏览器、JS 环境中执行，完全不依赖 web 环境，所以能在嵌入式系统、物联网等其它环境中应用。


https://sdk.nnsdao.com/docs/tutorial-wasms/wasm-intro
