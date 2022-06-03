function element() {
  const A1 = { type: 'div', key: 'A1' }
  const B1 = { type: 'div', key: 'B1', return: A1 }
  const B2 = { type: 'div', key: 'B2', return: A1 }
  const C1 = { type: 'div', key: 'C1', return: B1 }
  const C2 = { type: 'div', key: 'C2', return: B1 }
  const C3 = { type: 'div', key: 'C3', return: B2 }
  const C4 = { type: 'div', key: 'C4', return: B2 }

  A1.child = B1
  B1.sibling = B2
  B1.child = C1
  C1.sibling = C2
  B2.child = C3
  C3.sibling = C4
  return A1
}

let rootFiber = element();

function beginWork(Fiber) {
  console.log(`${Fiber.key} start`)
}

const completeUnitWork = (Fiber) => {
  console.log(`${Fiber.key} end`);
}

function performUnitOfWork(Fiber) {
  beginWork(Fiber)
  if (Fiber.child) {
    return Fiber.child
  }
  while (Fiber) {
    completeUnitWork(Fiber)
    if (Fiber.sibling) {
      return Fiber.sibling
    }
    debugger;
    Fiber = Fiber.return
  }
}

const workLoop = (nextUnitOfWork) => {
  while (nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    console.log(nextUnitOfWork && nextUnitOfWork.key)
  }
  if (!nextUnitOfWork) {
    console.log('reconciliation 阶段结束')
  }
}

workLoop(rootFiber)