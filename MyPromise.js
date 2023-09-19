/**
 * @see https://promisesaplus.com/ Promises/A+规范（英文版）
 * @see https://promisesaplus.com.cn/ Promises/A+规范（中文版）
 */
class MyPromise {
  // promise三种状态
  static PENDING = 'pending';
  static FUFILLED = 'fulfilled';
  static REJECTED = 'rejected';

  constructor(exector) {
    // 初始化状态、结果
    this.state = MyPromise.PENDING;
    this.result = undefined;

    /**
     * Promises/A+：2.2.6.
     * then方法可以在同一个promise上多次调用
     */
    this.onFulfilledCallbacks = [];  // 存储onFulfilled回调的队列
    this.onRejectedCallbacks = [];  // 存储onRejected回调的队列

    const resolve = value => {
      this.changeState(MyPromise.FUFILLED, value, this.onFulfilledCallbacks);
    }
    const reject = reason => {
      this.changeState(MyPromise.REJECTED, reason, this.onRejectedCallbacks);
    }

    try {
      exector(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  /**
   * 转换promise的状态
   * @param {string} state 转换后promise的状态
   * @param {*} result 转换后promise的结果
   * @param {Array} callbacks 存储待执行回调的队列
   */
  changeState(state, result, callbacks) {
    /**
     * Promises/A+：2.1. Promise状态
     * 只有状态为pending才可以转换
     */
    if (this.state === MyPromise.PENDING) {
      this.state = state;
      this.result = result;
      /**
       * Promises/A+：2.2.6.1.
       * 如果/当promise被实现时，所有相应的onFulfilled回调函数必须按照它们发起then调用的顺序执行
       */
      /**
       * Promises/A+：2.2.6.2.
       * 如果/当promise被拒绝时，所有相应的onRejected回调函数必须按照它们发起then调用的顺序执行
       */
      callbacks.forEach(callback => callback());
    }
  }

  /**
   * 将函数func加入微任务队列中执行
   * @param {function} 待加入微任务队列中执行的函数
   */
  runMicrotask(func) {
    // node环境
    if (typeof process === 'object' && typeof process.nextTick === 'function') {
      process.nextTick(func);
    }
    // 浏览器环境
    else if (typeof MutationObserver === 'function') {
      const observer = new MutationObserver(func);
      const targetNode = document.createTextNode('1');
      observer.observe(targetNode, {
        characterData: true
      });
      targetNode.data = '2';  // 手动调用observe()将func放入微任务队
    }
    // 其他
    else {
      setTimeout(func);  // 定时器模拟
    }
  }

  /**
   * Promises/A+：2.2. then方法
   * promise必须提供一个then方法以访问其当前或最终的值或原因
   * 一个promise的then方法接受两个参数：
   */
  then(onFulfilled, onRejected) {
    const promise2 = new MyPromise((resolve, reject) => {
      // 执行onFulfilled
      const runOnFulfilled = () => {
        /**
         * Promises/A+：2.2.4.
         * onFulfilled或onRejected不能在执行上下文堆栈中只包含平台代码之前调用
         */
        this.runMicrotask(() => {
          try {
            if (typeof onFulfilled !== 'function') {
              /**
               * Promises/A+：2.2.7.3.
               * 如果onFulfilled不是一个函数且promise1被实现，则promise2必须以与promise1相同的值被实现
               */
              resolve(this.result);
            }
            /**
             * Promises/A+：2.2.2.
             * 如果onFulfilled是一个函数
             */
            else {
              /**
               * Promises/A+：2.2.2.1.
               * 它必须在promise实现后调用，并以promise的值作为其第一个参数
               */
              const x = onFulfilled(this.result);
              /**
               * Promises/A+：2.2.7.1
               * 如果onFulfilled或onRejected返回一个值x，则运行Promise Resolution Procedure [[Resolve]](promise2, x)
               */
              this.promiseResolve(promise2, x, resolve, reject);
            }
          } catch (error) {
            /**
             * Promises/A+：2.2.7.
             * 如果onFulfilled或onRejected抛出异常e，则promise2必须以e作为原因被拒绝
             */
            reject(error);
          }
        })
      }
      // 执行onRejected
      const runOnRejected = () => {
        /**
         * Promises/A+：2.2.4.
         * onFulfilled或onRejected不能在执行上下文堆栈中只包含平台代码之前调用
         */
        this.runMicrotask(() => {
          try {
            if (typeof onRejected !== 'function') {
              /**
               * Promises/A+：2.2.7.4.
               * 如果onRejected不是一个函数且promise1被拒绝，则promise2必须以与promise1相同的原因被拒绝
               */
              reject(this.result);
            }
            /**
             * Promises/A+：2.2.3.
             * 如果onRejected是一个函数
             */
            else {
              /**
               * Promises/A+：2.2.3.1.
               * 它必须在promise被拒绝后调用，并以promise的原因作为其第一个参数
               */
              const x = onRejected(this.result);
              /**
               * Promises/A+：2.2.7.1
               * 如果onFulfilled或onRejected返回一个值x，则运行Promise Resolution Procedure [[Resolve]](promise2, x)
               */
              this.promiseResolve(promise2, x, resolve, reject);
            }
          } catch (error) {
            /**
             * Promises/A+：2.2.7.
             * 如果onFulfilled或onRejected抛出异常e，则promise2必须以e作为原因被拒绝
             */
            reject(error);
          }
        })
      }

      switch (this.state) {
        case MyPromise.FUFILLED:
          runOnFulfilled();
          break;
        case MyPromise.REJECTED:
          runOnRejected();
          break;
        case MyPromise.PENDING:
          this.onFulfilledCallbacks.push(() => {
            runOnFulfilled();
          });
          this.onRejectedCallbacks.push(() => {
            runOnRejected();
          });
        default:
          break;
      }
    });

    /**
     * Promises/A+：2.2.7.
     * then方法必须返回一个promise
     */
    return promise2;
  }

  /**
   * Promises/A+：2.3. Promise解决过程
   * Promise解决过程是一个抽象操作，接受一个promise和一个值作为输入，我们将其表示为[[Resolve]](promise, x)。
   * 如果x是一个thenable，它尝试使promise采用x的状态，假设x至少在某种程度上像一个promise。
   * 否则，它使用值x来实现promise。
   * 对thenable的处理允许promise实现进行互操作，只要它们暴露符合Promises/A+的then方法。
   * 它还允许Promises/A+实现通过合理的then方法来“吸收”不符合规范的实现。
   */
  promiseResolve(promise2, x, resolve, reject) {
    /**
     * Promises/A+：2.3.1.
     * 如果promise2和x引用同一个对象，则以TypeError为原因拒绝promise2
     */
    if (promise2 === x) {
      throw new TypeError(`“${promise2}” 与 “${x}” 引用同一个对象，这将陷入递归的死循环`);
    }

    /**
     * Promises/A+：2.3.2.
     * 如果x是一个promise，采用其状态
     */
    if (x instanceof MyPromise) {
      /**
       * Promises/A+：2.3.2.1.
       * 如果x处于待定状态，则promise2必须保持待定状态，直到x被实现或拒绝
       */
      /**
       * Promises/A+：2.3.2.2.
       * 如果/当x被实现时，用相同的值实现promise2
       */
      /**
       * Promises/A+：2.3.2.3.
       * 如果/当x被拒绝时，用相同的原因拒绝promise2
       */
      x.then(y => {
        this.promiseResolve(promise2, y, resolve, reject)
      }, reject)
    }

    /**
     * Promises/A+：2.3.3.
     * 否则，如果x是一个对象或函数
     */
    else if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
      /**
       * Promises/A+：2.3.3.1.
       * 让then为x.then
       */
      let then;
      try {
        then = x.then;
      } catch (error) {
        /**
         * Promises/A+：2.3.3.2.
         * 如果获取属性x.then导致抛出异常e，则以e为原因拒绝promise2
         */
        return reject(error);
      }
      /**
       * Promises/A+：2.3.3.3.
       * 如果then是一个函数，则以x作为this，第一个参数为resolvePromise，第二个参数为rejectPromise调用它
       */
      if (typeof then === 'function') {
        let isCalled = false;  // 判断resolvePromise或rejectPromise是否被调用
        try {
          const resolvePromise = y => {
            /**
             * Promises/A+：2.3.3.3.3.
             * 如果resolvePromise和rejectPromise都被调用，或者对同一个参数进行多次调用，则第一次调用优先，任何后续调用都将被忽略
             */
            if (!isCalled) {
              isCalled = true;
              /**
               * Promises/A+：2.3.3.3.1.
               * 如果/当resolvePromise被调用并传入值y，运行[[Resolve]](promise2, y)
               */
              this.promiseResolve(promise2, y, resolve, reject);
            }
          }
          const rejectPromise = r => {
            /**
             * Promises/A+：2.3.3.3.3.
             * 如果resolvePromise和rejectPromise都被调用，或者对同一个参数进行多次调用，则第一次调用优先，任何后续调用都将被忽略
             */
            if (!isCalled) {
              isCalled = true;
              /**
               * Promises/A+：2.3.3.3.2.
               * 如果/当rejectPromise被调用并传入原因r，以r拒绝promise2
               */
              reject(r);
            }
          }
          then.call(x, resolvePromise, rejectPromise);
        } catch (error) {
          /**
           * Promises/A+：2.3.3.3.4.
           * 如果调用then导致抛出异常e
           */
          if (isCalled) {
            /**
             * Promises/A+：2.3.3.3.4.1.
             * 如果已经调用了resolvePromise或rejectPromise，则忽略它
             */
            return;
          } else {
            isCalled = true;
            /**
             * Promises/A+：2.3.3.3.4.2.
             * 否则，以e为原因拒绝promise
             */
            reject(error);
          }
        }
      }
      /**
       * Promises/A+：2.3.3.4.
       * 如果then不是一个函数，则以x来实现promise
       */
      else {
        resolve(x);
      }
    }
    /**
     * Promises/A+：2.3.4.
     * 如果x不是对象或函数，则用x来实现promise
     */
    else {
      return resolve(x);
    }
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch Promise.prototype.catch()的MDN中文文档
   * 注册一个在 promise 被拒绝时调用的函数
   * @param {function} onRejected 一个在此 Promise 对象被拒绝时异步执行的函数
   * @return {promise} 一个新的 Promise
   */
  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  /**
 * @see https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally Promise.prototype.finally()的MDN中文文档
 * 注册一个在 promise 敲定（兑现或拒绝）时调用的函数
 * @param {function} onFinally 一个当 promise 敲定时异步执行的函数
 * @return {promise} 等效的 Promise
 */
  finally(onFinally) {
    return this.then(onFinally, onFinally);
  }
}

/**
 * @see https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve Promise.resolve()的MDN中文文档
 * 将给定的值转换为一个 Promise
 * @param {*} value 要被该 Promise 对象解决的参数，也可以是一个 Promise 对象或一个 thenable 对象
 * @return {promise} 一个由给定值解决的 Promise，或者如果该值为一个 Promise 对象，则返回该对象
 */
MyPromise.resolve = value => {
  // 如果该值本身就是一个 Promise，那么该 Promise 将被返回
  if (value instanceof MyPromise) {
    return value;
  }

  // 如果该值是一个 thenable 对象，Promise.resolve() 将调用其 then() 方法及其两个回调函数
  if (value !== null && (typeof value === 'object' || typeof value === 'function') && 'then' in value) {
    if (typeof value.then === 'function') {
      return new MyPromise((resolve, reject) => {
        value.then(resolve, reject);
      })
    }
  }

  // 否则，返回的 Promise 将会以该值兑现
  return new MyPromise(resolve => {
    resolve(value);
  })
}

/**
 * @see https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/reject Promise.reject()的MDN中文文档
 * 返回一个被拒绝的 Promise 对象
 * @param {*} reason 该 Promise 对象被拒绝的原因
 * @return {promise} 一个已拒绝（rejected）的 Promise，拒绝原因为给定的参数
 */
MyPromise.reject = reason => {
  return new MyPromise((_, reject) => {
    reject(reason);
  })
}

/**
 * 判断一个值是否为一个可迭代对象
 * @param {*} value 待判断的值
 * @return {boolean} 是否为一个可迭代对象
 */
const isIterable = value => value !== null && typeof value[Symbol.iterator] === 'function';

/**
 * @see https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/all Promise.all()的MDN中文文档
 * 是 promise 并发方法之一。它可用于聚合多个 Promise 的结果。通常在有多个相关的异步任务并且整个代码依赖于这些任务成功完成时使用，我们希望在代码执行继续之前完成所有任务
 * @param {iterable} iterable 一个可迭代对象，例如 Array 或 String
 * @return {promise} 一个 Promise
 */
MyPromise.all = iterable => {
  return new MyPromise((resolve, reject) => {
    if (isIterable(iterable)) {
      const length = iterable.length;

      // 传入的是一个空的可迭代对象，返回的 Promise 将被兑现
      if (length === 0) {
        return resolve(iterable);
      }

      const result = [];

      iterable.forEach((item, index) => {
        // 使用MyPromise.resolve()对于参数是否为promise的判断逻辑
        MyPromise.resolve(item).then(
          value => {
            result[index] = value;
            // 当所有输入的 Promise 都被兑现时，返回的 Promise 也将被兑现，并返回一个包含所有兑现值的数组
            index === length - 1 && resolve(result);
          },
          reason => {
            // 如果输入的任何 Promise 被拒绝，则返回的 Promise 将被拒绝，并带有第一个被拒绝的原因
            reject(reason);
          }
        )
      })
    }
    // 如果参数不是一个可迭代对象
    else {
      return reject(new TypeError(`参数 “${iterable}” 不是一个可迭代对象`));
    }
  })
}

/**
 * @see https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled Promise.allSettled()的MDN中文文档
 * 是 promise 并发方法之一。在你有多个不依赖于彼此成功完成的异步任务时，或者你总是想知道每个 promise 的结果时，使用 Promise.allSettled()
 * @param {iterable} iterable 一个以 promise 组成的可迭代对象（例如 Array）对象
 * @return {promise} 一个 Promise
 */
MyPromise.allSettled = iterable => {
  return new MyPromise((resolve, reject) => {
    if (isIterable(iterable)) {
      const length = iterable.length;

      // 如果传入的 iterable 为空的话，返回的 Promise 将被兑现
      if (length === 0) {
        return resolve(iterable);
      }

      const result = [];

      iterable.forEach((item, index) => {
        // 使用MyPromise.resolve()对于参数是否为promise的判断逻辑
        MyPromise.resolve(item).then(
          // status：一个字符串，要么是 "fulfilled"，要么是 "rejected"，表示 promise 的最终状态
          value => {
            result[index] = {
              status: MyPromise.FUFILLED,
              value,  // value：仅当 status 为 "fulfilled"，才存在。promise 兑现的值
            };
          },
          reason => {
            result[index] = {
              status: MyPromise.REJECTED,
              reason,  // reason：仅当 status 为 "rejected"，才存在，promsie 拒绝的原因
            };
          }
        ).finally(() => {
          // 当给定的 iterable 中所有 promise 已经敲定时（要么已兑现，要么已拒绝）。兑现的值是一个对象数组，其中的对象按照 iterable 中传递的 promise 的顺序，描述每一个 promise 的结果，无论完成顺序如何。
          index === length - 1 && resolve(result);
        })
      })
    }
    // 如果参数不是一个可迭代对象
    else {
      return reject(new TypeError(`参数 “${iterable}” 不是一个可迭代对象`));
    }
  })
}

/**
 * @see https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/any Promise.any()的MDN中文文档
 * 是 Promise 并发方法之一。该方法对于返回第一个兑现的 Promise 非常有用。一旦有一个 Promise 兑现，它就会立即返回，因此不会等待其他 Promise 完成
 * @param {iterable} iterable 一个 promise 的可迭代对象（例如一个数组）
 * @return {promise} 一个 Promise
 */
MyPromise.any = iterable => {
  return new MyPromise((resolve, reject) => {
    if (isIterable(iterable)) {
      const length = iterable.length;

      // 传递了空的可迭代对象时，它会以一个包含拒绝原因数组的 AggregateError 拒绝
      if (length === 0) {
        return reject(new AggregateError('所有promise都被拒绝'));
      }

      const errors = [];

      iterable.forEach((item, index) => {
        // 使用MyPromise.resolve()对于参数是否为promise的判断逻辑
        MyPromise.resolve(item).then(
          // 当给定的 iterable 中的任何一个 Promise 被兑现时，返回的 Promise 就会被兑现。其兑现值是第一个兑现的 Promise 的兑现值
          value => {
            resolve(value);
          },
          // 当给定的 iterable 中的所有 Promise 都被拒绝时。拒绝原因是一个 AggregateError，其 errors 属性包含一个拒绝原因数组。无论完成顺序如何，这些错误都是按照传入的 Promise 的顺序排序。如果传递的 iterable 是非空的，但不包含待定的 Promise，则返回的 Promise 仍然是异步拒绝的（而不是同步拒绝的）
          reason => {
            errors[index] = reason;
            index === length - 1 && reject(new AggregateError(errors));
          }
        )
      })
    }
    // 如果参数不是一个可迭代对象
    else {
      return reject(new TypeError(`参数 “${iterable}” 不是一个可迭代对象`));
    }
  })
}

/**
 * @see https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/race Promise.race()的MDN中文文档
 * 是 Promise 并发方法之一。当你想要第一个异步任务完成时，但不关心它的最终状态（即它既可以成功也可以失败）时，它就非常有用
 * @param {iterable} iterable 一个 promise 可迭代对象（例如数组）
 * @return {promise} 一个 Promise，会以 iterable 中第一个敲定的 promise 的状态异步敲定
 */
MyPromise.race = iterable => {
  return new MyPromise((resolve, reject) => {
    if (isIterable(iterable)) {
      const length = iterable.length;

      // 传递了空的可迭代对象时，返回的 promise 将永远等待
      if (length > 0) {
        iterable.forEach(item => {
          // 使用MyPromise.resolve()对于参数是否为promise的判断逻辑
          MyPromise.resolve(item).then(resolve, reject);
        })
      }
    }
    // 如果参数不是一个可迭代对象
    else {
      return reject(new TypeError(`参数 “${iterable}” 不是一个可迭代对象`));
    }
  })
}





/**
 * |-------------------------------------------------------------------------|
 * | 使用Promises/A+官方的测试工具 promises-aplus-tests 来对 MyPromise 进行测试 |
 * |-------------------------------------------------------------------------|
 * 1. 安装 promises-aplus-tests：
 *      npm install promises-aplus-tests -D
 *
 * 2. 使用 CommonJS 对外暴露 MyPromise 类：
 *      module.exports = MyPromise;
 *
 * 3. 实现静态方法 deferred：
 *      要给 MyPromise 上实现一个静态方法deferred()，该方法要返回一个包含{ promise, resolve, reject }的对象：
 *        (1). promise 是一个处于pending状态的 Promsie
 *        (2). resolve(value) 用value解决上面那个promise
 *        (3). reject(reason) 用reason拒绝上面那个promise
 *
 * 4. 配置 package.json：
 *      {
 *        "devDependencies": {
 *          "promises-aplus-tests": "^2.1.2"
 *        },
 *        "scripts": {
 *          "test": "promises-aplus-tests MyPromise"
 *        }
 *      }
 *
 * 5. 执行测试命令：
 *      npm run test
 */

MyPromise.deferred = function () {
  const result = {};
  result.promise = new MyPromise((resolve, reject) => {
    result.resolve = resolve;
    result.reject = reject;
  });
  return result;
}

module.exports = MyPromise