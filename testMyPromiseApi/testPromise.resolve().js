/**
 * |---------------------------|
 * |期望输出（原生Promise输出）：|
 * |---------------------------|
 *
 * true
 * 123
 * Resolving
 * TypeError: Throwing
 * p1 :>> Promise { 'Resolving' }
 *
 */
const MyPromise = require('../MyPromise');

const promise1 = MyPromise.resolve(123);

promise1.then((value) => {
  console.log(value);
});

var p1 = MyPromise.resolve({
  then: function (onFulfill) {
    onFulfill("Resolving");
  }
});
console.log(p1 instanceof MyPromise)

setTimeout(() => {
  console.log('p1 :>> ', p1);
}, 1000);

p1.then(function (v) {
  console.log(v);
}, function (e) {
});

var thenable = {
  then: function (resolve) {
    throw new TypeError("Throwing");
    resolve("Resolving");
  }
};

var p2 = MyPromise.resolve(thenable);
p2.then(function (v) {
}, function (e) {
  console.log(e);
});