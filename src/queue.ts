import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';

import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/zip';
import 'rxjs/add/operator/do';

class Queue {
  // 任务事件队列
  private taskQueue = new Subject<Observer<void>>();
  // 任务完成事件队列
  private taskCompleteQueue = new Subject<void>();

  constructor() {
    this.taskQueue
      .zip(this.taskCompleteQueue)
      .subscribe(([taskObserver, taskComplete])=> {
        taskObserver.next();
        taskObserver.complete();
      });

    // 初始化时先 release 一个任务完成事件
    this.completeTask();
  }

  public addTask(task: ()=>Observable<void>): Observable<void> {

    return Observable.create((observer: Observer<void>) => {
        this.taskQueue.next(observer);
      })
      .mergeMap(()=>task())
      .subscribe(
        ()=>{},
        (err)=>console.error(err),
        ()=>this.completeTask());
  }

  public completeTask() {
    this.taskCompleteQueue.next()
  }
}

let queue = new Queue();

processTask('1');
processTask('2');
processTask('3');
processTask('4');

function processTask(val: string) {
  queue.addTask(()=> {
    console.log(`task ${val} starting`);
    return asyncProcess(val).do(()=>console.log(`Task ${val} is done`));
  });
}

function asyncProcess(val: string): Observable<void> {
  return Observable.create((observer: Observer<void>)=> {
    console.log('waiting 2 seconds ...');
    setTimeout(()=> {
      observer.next();
      observer.complete();
    }, 2000);
  });
}
