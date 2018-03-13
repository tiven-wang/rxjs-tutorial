const Rx = require('@reactivex/rxjs');

// 接收第一个发出值的 observable
const example = Rx.Observable.race(
  // 每1.5秒发出值
  Rx.Observable.interval(1500),
  // 每1秒发出值
  Rx.Observable.interval(1000).mapTo('1s won!'),
  // 每2秒发出值
  Rx.Observable.interval(2000),
  // 每2.5秒发出值
  Rx.Observable.interval(3120)
);
//输出: "1s won!"..."1s won!"...etc
const subscribe = example.subscribe(val => console.log(val));
