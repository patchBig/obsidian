## 01 | 基础篇

### window.requestAnimationFrame

接受一个回调函数作为参数，该回调函数讲会在下一次浏览器尝试重新绘制当前帧动画时被调用。

```js
const step = (timestamp) => {
	if (!start) start = timestamp;
	let progress = timestamp - start;
	element.style.left = Math.min(progress / 10, 200) + 'px';
	if (progress < 2000) {
		window.requestAnimationFrame(step);
	}
}
window.requestAnimationFrame(step);
```

### 原码、反码和补码

"-10"
对于原码来说，最高位会被用来当做符号位。该位为 "0" 表示正数，"1" 表示负数
使用 1 字节（8 位）大小有符号整数类型变量存储该数字

原码：
`1000 1010`

反码:
`1111 0101`

补码:
`1111 0110`

```js
// 10 - 3 => 10 + (-3) => -n 等价于 (0 - n)

// 10
0000 1010

// -3 => 原码 => 反码 => 补码
0000 0011
1111 1100
1111 1101

// 最后溢出一位
1000 0111 => 7
```

## 02 | 历史篇

### JavaScript 的弱类型

在实际编码过程中，我们不需要为每个变量指定对应类型。变量具体类型的推导过程，会被推迟到代码的时机运行时再进行。

### NaCI、PNaCI 到 ASM.js

1. 源码中都使用了类型明确的变量
2. 应用中拥有独立的运行时环境，并且与原有的 JavaScript 运行时环境分离
3. 支持将原有的 C/C++ 应用通过某种方式转换到基于这些技术的实现，并可以直接运行在浏览器中

### TS => JS 和 WASM

生成 AST、生成 IR、Lowering、优化编译器、Profiling、生成机器码。但是对于 WASM，进需要”生成机器码“这一步基本就够了，大部分优化在静态编译时就已经完成了，引擎只需要对照 Wasm 的 ISA 翻译成目标机器的 ISA 就可以了，基本上只是一个汇编器的作用，而且目前也不需要静态链接。

## 03 | WebAssembly

WebAssembly 是一种基于堆栈式虚拟机的二进制指令集。Wasm 被设计成为一种编程语言的可移植的编译目标，并且可以通过将其部署在 web 平台上，以便为客户端及服务端应用程序提供服务。

### ISV 和 V-ISV

通常来说，对于可以应用在注入 i386、X86-64 等实际存在的物理系统架构上的指令集，一般称之为 ISA（Instruction Set Architecture）。另一种在虚拟架构体系中的指令集，我们通常称之为 V-ISA，也就是 Virtual（虚拟）的 ISA

## 04 | webassembly 模块的基本组成结构

### Section 概览

![[Pasted image 20221023160312.png]]

### Type Section

存放和”类型“相关的东西，这里的类型主要指”函数类型“

### Start Section

可以为模块指定在其初始化过程完成后，需要首先被宿主环境执行的函数
”初始化完成后“：模块实例内部的线性内存和 Table，已经通过相应的 Data Section 和 Element Section 填充好相应的数据，但导出函数还无法被宿主环境调用的这个时刻。

对于 Start Section 来说，一个 WASM 模块只能拥有一个 Start Section，也就是只能调用一个函数，并且调用的函数也不能拥有任何参数，同时也不能有任何的返回值。

### Import Section 和 Export Section

![[Pasted image 20221023163309.png]]

为什么要设计 import Section？就是希望能够在 WASM 模块之间、以及 WASM 模块与宿主环境之间共享代码和数据。

### Function Section 和 Code Section

![[Pasted image 20221023164411.png]]

Function Section 中存放了这个模块中所有函数对应的函数类型信息。
在 WASM 标准中，所有模块内使用到的函数都会通过整型的 indicies 来进行索引并调用

Type Section 存放 wasm 模块使用的所有函数类型（签名）
Function Section 存放模块内每个函数对应的函数类型，即具体的函数与类型对应关系
Code Section 存放的则是每个函数的具体定义，也就是实现部分

![[Pasted image 20221023170202.png]]

## 05 | 二进制编码

### 字节序

![[Pasted image 20221029144326.png]]

用于组成该数字值的最低有效数字位与最高有效数字为，分别称为这个数据的
“最低有效位（LSB）”和“最高有效位（MSB）”

## 08 | API

### WASM 浏览器加载流程

![[Pasted image 20221101094023.png]]

1. Fetch 阶段，将被使用到的 Wasm 二进制模块从网络上的某个位置通过 HTTP 请求的方式加载到浏览器中
2. Compile 阶段，将二进制代码编译为可执行的平台相关代码和数据结构，可以在 Worker 线程中进行分发，以让 Worker 线程使用这些模块，防止主线程被阻塞
3. Instantiate 阶段，将 Wasm 模块规定需要从外界宿主环境中导入的资源，导入到正在实例化中的模块，以完成最后的实例化过程
4. Call 阶段，直接通过上一阶段生成的动态 Wasm 模块对象，来调用从 Wasm 模块内导出方法。

### Wasm JavaScript API

#### 模块对象

- Compile 编译 -> WebAssembly.Module
- Instantiate 实例化 -> WebAssembly.Instance

#### 导入对象

Web 浏览器作为 Wasm 模块运行时的一个宿主环境，通过 JavaScript 提供了可以被导入到 Wasm 模块中使用的数据类型

