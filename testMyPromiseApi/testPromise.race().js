/**
 * |---------------------------|
 * |期望输出（原生Promise输出）：|
 * |---------------------------|
 *
 * p1 :>>  10
 * p2 :>>  Promise { 1 }
 * p3 :>>  Promise { <pending> }
 * p4 :>>  已解决的Promise
 * p5 :>>  two
 */

const MyPromise = require('../MyPromise');

let p2 = MyPromise.race([1, 3, 4]);
setTimeout(() => {
  console.log('p2 :>> ', p2);
});

let p3 = MyPromise.race([]);
setTimeout(() => {
  console.log('p3 :>> ', p3);
});

const p11 = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 500, 'one');
});

const p22 = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 100, 'two');
});

MyPromise.race([p11, p22, 10]).then((value) => {
  console.log('p1 :>> ', value);
});

let p12 = MyPromise.resolve('已解决的Promise')
setTimeout(() => {
  MyPromise.race([p12, p22, 10]).then((value) => {
    console.log('p4 :>> ', value);
  });
});

const p13 = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 500, 'one');
});

const p14 = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 100, 'two');
});

MyPromise.race([p13, p14]).then((value) => {
  console.log('p5 :>> ', value);
});