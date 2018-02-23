import Rx = require('@reactivex/rxjs');

let ob: Rx.Observable<number> = Rx.Observable.of(1,2,3);

ob.subscribe(n=>console.log(n));
