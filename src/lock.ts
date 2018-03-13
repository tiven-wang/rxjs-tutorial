import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';

import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/zip';

class Lock {
  // 请求锁队列
  private lockAcquire = new Subject<Observer<void>>();
  // 释放锁队列
  private lockRelease = new Subject();

  constructor() {
    this.lockAcquire
      .zip(this.lockRelease)
      .subscribe(([acquirer, released])=> {
        acquirer.next();
        acquirer.complete();
      });

    // 初始化时先 release 一个释放锁事件
    this.release();
  }

  public acquire(): Observable<void> {
    return Observable.create((observer: Observer<void>) => {
      this.lockAcquire.next(observer);
    });
  }

  public release() {
    this.lockRelease.next();
  }
}

let lock = new Lock();

lockAndProcess('1');
lockAndProcess('2');
lockAndProcess('3');
lockAndProcess('4');

function lockAndProcess(val: string) {
  lock.acquire()
    .mergeMap(()=>asyncProcess(val))
    .subscribe(()=> {
      console.log(`My work ${val} is done`);
    },err=>{
      console.error(err);
    },()=> {
      console.log('releasing lock');
      console.log();
      lock.release();
    });
}

function asyncProcess(val: string): Observable<string> {
  return Observable.create((observer: Observer<string>)=> {
    console.log('got lock and processing');
    console.log('waiting 2 seconds ...');
    setTimeout(()=> {
      observer.next('answer '+val);
      observer.complete();
    }, 2000);
  });
}


// class Lock {
//   private locked = false;
//   private queue: Array<{callback: Function, released: Function}> = [];
//   public acquire(callback: (done: Function)=>void, released: (err)=>void) {
//     this.queue.push({callback, released});
//     if(!this.locked) {
//       this.exec(this.queue.shift());
//     }
//   }
//
//   private exec(lockReq: {callback: Function, released: Function}) {
//     this.locked = true;
//     lockReq.callback(()=> {
//       this.locked = false;
//       lockReq.released(null);
//       if(this.queue.length > 0) {
//         this.exec(this.queue.shift());
//       }
//     });
//   }
// }
//
// let lock = new Lock();
// lock.acquire((done)=> {
//   console.log('got lock 1');
//   setTimeout(()=>done(), 2000);
// }, (err)=>console.log('released 1'));
//
// lock.acquire((done)=> {
//   console.log('got lock 2');
//   setTimeout(()=>done(), 3000);
// }, (err)=>console.log('released 2'));
//
// lock.acquire((done)=> {
//   console.log('got lock 3');
//   setTimeout(()=>done(), 2000);
// }, (err)=>console.log('released 3'));
