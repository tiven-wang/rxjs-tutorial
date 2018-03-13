import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import 'rxjs/add/observable/bindCallback';

var observableCallbackable = Observable.bindCallback<Array<any>>(callbackable, (error, response, body)=> {
  if(error) throw error;
  if(response.statusCode !== 200) throw response.statusMessage;
  return body;
});

function callbackable(address: string, options: any, cb:(error: string|null, response:string|null, body: string)=>Array<any>) {
  cb('errorr', null, 'Hello world');
}

observableCallbackable(1, {})
  .subscribe((body)=> {
    console.log(body);
  },err=>console.error(err))
