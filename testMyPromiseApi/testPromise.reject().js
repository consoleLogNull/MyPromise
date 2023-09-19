/**
 * |---------------------------|
 * |期望输出（原生Promise输出）：|
 * |---------------------------|
 *
 * Error: fail
 *
 */

const MyPromise = require('../MyPromise')

MyPromise.reject(new Error('fail')).then(function () {
}, function (error) {
  console.error(error);
});