// promise 失败只有三种可能，一种是发生错误，一种是返回了一个失败的 promise，一种是主动 reject

// const promise = new MyPromise((resolve, reject) => {
//   setTimeout(() => {
//     resolve('成功')
//   }, 0)
// })

// promise.then((value) => {
//   console.log('success', value)  
// }, (reson) => {
//   console.log('fail', reson)
// })

// 实现功能：
// 1. 实现 promise 基本结构和三种状态切换
// 2. 实现基本的 then 方法，根据状态判断执行的回调
// 3. 当 executor 发生异常时，进行捕获并 reject
// 4. 如果 then 执行时，仍未执行 resolve 或 reject，先把回调函数存起来，当 resolve 或 reject 执行时，再执行回调
// 5. 每个 then 返回一个新的 promise，将每个 then 回调的 返回值/发生的错误 传递给下一个 then
// 6. 将 then 中 return 的结果传给下一个 then，注意返回值可能依然是一个 promise，要用 resolvePromise 方法进行处理

class MyPromise {
  constructor(executor) {
    this.value = '' // resolve 的值
    this.reson = '' // reject 的值
    this.state = 'pending' // 当前 Promise 的状态
    this.resolveCallbacks = [] // 存放异步 resolve 的回调
    this.rejectCallbacks = [] // 存放异步 reject 的回调
    const resolve = (value) => { // 写成箭头函数，保证 this
      if (this.state === 'pending') { // 只有 pedding 态可修改，并且不可逆
        this.state = 'fulfilled'
        this.value = value
        this.resolveCallbacks.forEach(fn => fn(value)) // 执行 resolve 回调
      }
    }
    const reject = (reson) => {
      if (this.state === 'pending') {
        this.state = 'rejected'
        this.reson = reson
        this.rejectCallbacks.forEach(fn => fn(reson)) // 执行 reject 回调
      }
    }
    try {
      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }
  then(onfulfilled, onrejected) { // 根据 promise 状态执行对应回调
    const promise2 = new Promise((resolve, reject) => {
      // 同步
      if (this.state === 'fulfilled') {
        setTimeout(() => { // 为了保证 resolvePromise 执行时，里面的 promise2 已经初始化了
          try { // 发生错误时，将错误 reject 到下一个 then 的失败回调
            const x = onfulfilled(this.value)
            resolvePromise(promise2, x, resolve, reject)  // 处理返回的结果 x，传递给下一个 then
          } catch (e) {
            reject(e)
          }
        }, 0)

      } else if (this.state === 'rejected') {
        setTimeout(() => {
          try {
            const x = onrejected(this.reson)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      }

      // 异步，此时还没有 resolve reject
      else if (this.state === 'pending') { // 订阅 resolve reject 的回调
        this.resolveCallbacks.push(() => {
          try {
            const x = onfulfilled(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
        this.rejectCallbacks.push(() => {
          try {
            const x = onrejected(this.reson)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      }
    })
    return promise2 // then 返回一个新的 promise
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  // 判断 x，如果是一般值直接 resolve，如果是一个 promise，要等待 promise resolve 或 reject
  if (promise2 === x) {
    return new TypeError('循环引用！')
  } else if (typeof x === 'function' || (typeof x === 'object' && x !== null)) {  // x 是对象或函数，可能是一个 promise
    try {
      const then = x.then
      if (typeof then === 'function') { // x 有 then 方法，说明是一个 promise
        then.call(x, y => { // 将 x 这个 promise 的执行结果通过 "传进来的resolve" resolve 出去
          resolvePromise(promise2, y, resolve, reject)  // 注意：此时的 y 可能还是一个 promise，所以需要递归调用 resolvePromise，直到解析出一个非 promise 值
        }, r => {
          reject(r)
        })
      }else { // 没有 then 说明不是 promise，直接 resolve
        resolve(x)
      }
    } catch (e) {
      reject(e)
    }
  } else { // 其他值，直接 resolve
    resolve(x)
  }
}
