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

import request = require('request');
import querystring = require('querystring');

// Observable.fromPromise(queryLeftTicket('2018-03-02', 'TBP', 'JGK'))
//   .subscribe(data=> console.log(data), err=>console.error(err));


/**
try {
  Observable.create((observer: Observer<any>)=> {
    // observer.error("错误信息");
    // throw "异常信息1";
    observer.next(1);
  })
  .map(val=> val+1)
  .map(val=> {throw "异常信息2"})
  .catch((err:string)=>{console.log('Catch:'+err); throw err;})
  .subscribe((data:any)=> console.log(data.result[0]), (err:string)=> setTimeout(()=>console.log("Err:"+err)));
}catch(err) {
  console.log("Exception:"+err)
}
console.log("After");
*/
//Output:
/**
Catch:异常信息2
After
Err:异常信息2
*/

/**
queryLeftTicket('2018-03-01', 'TBP', 'JGK')
  .catch((err)=>{
    console.log('发现错误，该怎么办呢');
    return Observable.of({result:[]});
  })
  .subscribe((data:any)=> console.log(data.result[0]), (err:string)=> setTimeout(()=>console.log("Err:"+err)));

console.log("After");
*/

/**
queryLeftTicket(new Date(new Date()-1000*60*60*24).toJSON().slice(0,10), 'TBP', 'JGK')
  .retry(3)
  .catch((err)=>{
    console.log('发现错误，该怎么办呢');
    return Observable.of({result:[]});
  })
  .subscribe((data:any)=> console.log(data.result[0]), (err:string)=> console.log("Err:"+err));
*/

/**
const maxRetries = 3;

queryLeftTicket(new Date(new Date()-1000*60*60*24).toJSON().slice(0,10), 'TBP', 'JGK')
  .retryWhen(error$ =>
      error$.delay(2000)
        .scan((errorCount, err)=> {
          if(errorCount >= maxRetries) {
            throw err;
          }
          return errorCount + 1;
        }, 0)
  )
  .catch((err)=>{
    console.error(err);
    console.log('发现错误，该怎么办呢');
    return Observable.of({result:[]});
  })
  .subscribe((data:any)=> console.log(data.result[0]), (err:string)=> console.log("Err:"+err));
*/

/**
const maxRetries = 3;

queryLeftTicket(new Date(new Date()-1000*60*60*24).toJSON().slice(0,10), 'TBP', 'JGK')
  .retryWhen(error$ =>
      Observable.range(0, maxRetries+1)
        .zip(error$)
        .mergeMap(([i, err])=> {
          if(i === maxRetries) {
            return Observable.throw(err);
          }
          return Observable.timer(i * 1000)
                  .do(()=> console.log(`Retrying after ${i} second(s)...`))
        })
  )
  .catch((err)=>{
    console.error(err);
    console.log('发现错误，该怎么办呢');
    return Observable.of({result:[]});
  })
  .subscribe((data:any)=> console.log(data.result[0]), (err:string)=> console.log("Err:"+err));
*/

const maxRetries = 4;

Observable.range(0, maxRetries)
  .map(val=>val*val)
  .subscribe((data:any)=> console.log(data), (err:string)=> console.log("Err:"+err));


// Observable.of(1, 2, 3)
//   .map(val=>['2018-03-01', 'TBP', 'JGK'])
//   .mergeMap(([trainDate, fromStation, toStation])=>queryLeftTicket(trainDate, fromStation, toStation))
// // .switchMap(([trainDate, fromStation, toStation])=>queryLeftTicket([trainDate, fromStation, toStation]))
//   .subscribe(data=> console.log(data.result[0]), err=> console.log(err));

function queryLeftTicket(trainDate: string, fromStation: string, toStation: string): Observable<any> {

  var query = {
    "leftTicketDTO.train_date": trainDate
    ,"leftTicketDTO.from_station": fromStation
    ,"leftTicketDTO.to_station": toStation
    ,"purpose_codes": "ADULT"
  }

  var param = querystring.stringify(query);

  var url = "https://kyfw.12306.cn/otn/leftTicket/queryZ?"+param;

  return Observable.create((observer: Observer<any>)=> {
    console.log("request leftTicket...")
    request(url, (error, response, body)=> {
      if(error) return observer.error(error.toString());

      if(response.statusCode === 200) {
        if(!body) {
          return observer.error("系统返回无数据");
        }
        if(body.indexOf("请您重试一下") > 0) {
          return observer.error("系统繁忙!");
        }else {
          try {
            var data = JSON.parse(body).data;
          }catch(err) {
            return observer.error(err);
          }
          // Resolved
          observer.next(data);
        }
      }else {
        return observer.error(response.statusCode);
      }
    });
  });
}

/**
function queryLeftTicket(trainDate: string, fromStation: string, toStation: string): Promise<any> {

  var query = {
    "leftTicketDTO.train_date": trainDate
    ,"leftTicketDTO.from_station": fromStation
    ,"leftTicketDTO.to_station": toStation
    ,"purpose_codes": "ADULT"
  }

  var param = querystring.stringify(query);

  var url = "https://kyfw.12306.cn/otn/leftTicket/queryZ?"+param;

  return new Promise((resolve, reject)=> {
    request(url, (error, response, body)=> {
      if(error) return reject(error.toString());

      if(response.statusCode === 200) {
        if(!body) {
          return reject("系统返回无数据");
        }
        if(body.indexOf("请您重试一下") > 0) {
          return reject("系统繁忙!");
        }else {
          try {
            var data = JSON.parse(body).data;
          }catch(err) {
            return reject(err);
          }
          // Resolved
          return resolve(data);
        }
      }else {
        reject(response.statusCode);
      }
    });
  });
}
*/
