/**
 * |---------------------------|
 * |期望输出（原生Promise输出）：|
 * |---------------------------|
 *
 * reject
 * all fulfilled :>>  [ 3, 'then函数', 42 ]
 * [ 3, 42, 'foo' ]
 */

const MyPromise = require('../MyPromise');

const promise1 = MyPromise.resolve(3);
const promise2 = 42;
const promise3 = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 100, 'foo');
});

MyPromise.all([promise1, promise2, promise3]).then((values) => {
  console.log(values);
});

const p1 = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 1000, 'one');
});
const p2 = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 2000, 'two');
});
const p3 = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 3000, 'three');
});
const p4 = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 4000, 'four');
});
const p5 = new MyPromise((resolve, reject) => {
  reject('reject');
});

MyPromise.all([p1, p2, p3, p4, p5]).then(values => {
  console.log(values);
}, reason => {
  console.log(reason)
});

const p6 = MyPromise.resolve(3);
const p7 = {
  then: function (onFulfill) {
    onFulfill('then函数');
  }
}
const p8 = 42;

MyPromise.all([p6, p7, p8]).then(result => {
  console.log('all fulfilled :>> ', result);
}, reason => {
  console.log('all rejected :>> ', reason);
})