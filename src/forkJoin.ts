import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';

import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/zip';
import 'rxjs/add/observable/forkJoin';

let obs = [1,2,3];
Observable.forkJoin(obs.map((n)=>Observable.create((observer)=>{
  observer.next(1);
  // observer.complete();
}).mergeMap(()=>Observable.create((observer)=> {
  observer.next(2);
  observer.complete();
}))))
  .subscribe((res)=>console.log(res),err=>console.error(err));
