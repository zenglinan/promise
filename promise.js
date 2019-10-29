// const promise = new MyPromise((resolve, reject) => {
//   throw Error('发生异常！')
//   reject('123')
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

class MyPromise{
  constructor(executor){
    this.value = ''  // resolve 的值
    this.reson = ''  // reject 的值
    this.state = 'pending'  // 当前 Promise 的状态
    const resolve = (value) => {  // 写成箭头函数，保证 this
      if(this.state === 'pending'){  // 只有 pedding 态可修改，并且不可逆
        this.state = 'fulfilled'
        this.value = value
      }
    }
    const reject = (reson) => {
      if(this.state === 'pending'){
        this.state = 'rejected'
        this.reson = reson
      }
    }
    try {
      executor(resolve, reject)
    } catch (e){
      reject(e)
    }
  }
  then(onfulfilled, onrejected){  // 根据 promise 状态执行对应回调
    if(this.state === 'fulfilled'){
      onfulfilled(this.value)
    }else if(this.state === 'rejected'){
      onrejected(this.reson)
    }
  }
}
