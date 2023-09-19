/**
 * |---------------------------|
 * |期望输出（原生Promise输出）：|
 * |---------------------------|
 *
 * AggregateError: All promises were rejected
 * AggregateError: All promises were rejected
 * 很快完成
 */

// const Promise = require('../Promise');

Promise.any([]).catch(e => {
  console.log(e);
});

const pErr = new Promise((resolve, reject) => {
  reject("总是失败");
});

const pSlow = new Promise((resolve, reject) => {
  setTimeout(resolve, 500, "最终完成");
});

const pFast = new Promise((resolve, reject) => {
  setTimeout(resolve, 100, "很快完成");
});

Promise.any([pErr, pSlow, pFast]).then((value) => {
  console.log(value);
})

const pErr1 = new Promise((resolve, reject) => {
  reject("总是失败");
});

const pErr2 = new Promise((resolve, reject) => {
  reject("总是失败");
});

const pErr3 = new Promise((resolve, reject) => {
  reject("总是失败");
});

Promise.any([pErr1, pErr2, pErr3]).catch(e => {
  console.log(e);
})