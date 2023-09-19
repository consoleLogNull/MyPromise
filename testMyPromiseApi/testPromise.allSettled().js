/**
 * |---------------------------|
 * |期望输出（原生Promise输出）：|
 * |---------------------------|
 *
 * []
 * { status: 'fulfilled', value: 3 }
 * { status: 'fulfilled', value: 1 }
 * { status: 'fulfilled', value: 3 }
 * { status: 'rejected', reason: 'foo' }
 */

const MyPromise = require('../MyPromise');

const promise1 = MyPromise.resolve(3);
const promise2 = 1;
const promises = [promise1, promise2];

MyPromise.allSettled(promises).
  then((results) => results.forEach((result) => console.log(result)));

setTimeout(() => {
  const p1 = MyPromise.resolve(3);
  const p2 = new MyPromise((resolve, reject) => setTimeout(reject, 100, 'foo'));
  const ps = [p1, p2];

  MyPromise.allSettled(ps).
    then((results) => results.forEach((result) => console.log(result)));
}, 1000);

MyPromise.allSettled([]).then((results) => console.log(results))