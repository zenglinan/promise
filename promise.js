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
      if (this.state === 'fulfilled') {
        try {
          resolve(onfulfilled(this.value))  // 将回调的返回结果 resolve 给下一个 then
        } catch (e) { // 发生错误时，将错误 reject 到下一个 then 的失败回调
          reject(e)
        }
      } else if (this.state === 'rejected') {
        try {
          resolve(onrejected(this.reson))
        } catch (e) {
          reject(e)
        }
      } else if (this.state === 'pending') { // 订阅 resolve reject 的回调
        this.resolveCallbacks.push(() => {
          try{
            resolve(onfulfilled())          
          } catch (e){
            reject(e)
          }
        })
        this.rejectCallbacks.push(() => {
          try{
            resolve(onrejected())
          } catch (e){
            reject(e)
          }
        })
      }
    })
    return promise2  // then 返回一个新的 promise
  }
}
