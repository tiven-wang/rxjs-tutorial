import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/range';
import 'rxjs/add/observable/timer';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/zip';

Observable.of('token')
  .subscribe(t=>console.log(t));

let maxRetries = 3;
queryLeftTicket('2018-03-05', 'TBP', 'JGK')
  .retryWhen(error$ =>
    error$
      .do((err)=> console.error(err))
      .mergeMap(err=> {
        if(err === 1) {
          return Observable.timer(1000);
        }else if(err === 2) {
          return Observable.throw(err);
        }
        return Observable.throw(err);
      })
  )
  .catch((err)=>{
    console.error("Catch:"+err);
    console.log('发现错误，该怎么办呢');
    return Observable.of({result:[]});
  })
  .subscribe((data:any)=> console.log(data), (err:string)=> console.log("Err:"+err));

function queryLeftTicket(trainDate: string, fromStation: string, toStation: string): Observable<any> {
  let i = 0;
  return Observable.create((observer: Observer<any>)=> {
    if(++i === 1) {
      observer.error(i);
    }
    if(++i === 2) {
      observer.error(i);
    }
    if(++i === 3) {
      observer.next(i);
    }
    if(++i === 4) {
      observer.next(i);
    }
  });
}
