/**
 * |---------------------------|
 * |期望输出（原生Promise输出）：|
 * |---------------------------|
 *
 * Success
 * Success
 * Error: test
 * oh, no!
 * after a catch the chain is restored
 * oh, no!
 * after a catch the chain is restored
 *
 */

const MyPromise = require('../MyPromise');

var p1 = new MyPromise(function (resolve, reject) {
  resolve('Success');
});

p1.then(function (value) {
  console.log(value);
  throw 'oh, no!';
}).catch(function (e) {
  console.log(e);
}).then(function () {
  console.log('after a catch the chain is restored');
}, function () {
  console.log('Not fired due to the catch');
});

p1.then(function (value) {
  console.log(value);
  return Promise.reject('oh, no!');
}).catch(function (e) {
  console.log(e);
}).then(function () {
  console.log('after a catch the chain is restored');
}, function () {
  console.log('Not fired due to the catch');
});

const p2 = new MyPromise(function (resolve, reject) {
  throw new Error('test');
});
p2.catch(function (error) {
  console.log(error);
});