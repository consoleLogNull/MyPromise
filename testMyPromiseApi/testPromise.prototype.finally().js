/**
 * |---------------------------|
 * |期望输出（原生Promise输出）：|
 * |---------------------------|
 *
 * 1
 * finally
 *
 */

const MyPromise = require('../MyPromise');

let p1 = new MyPromise(function (resolve, reject) {
  resolve(1)
}).then(function (value) {
  console.log(value);
}).catch(function (e) {
  console.log(e);
}).finally(function () {
  console.log('finally');
});