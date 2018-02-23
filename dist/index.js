"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Rx = require("@reactivex/rxjs");
var ob = Rx.Observable.of(1, 2, 3);
ob.subscribe(function (n) { return console.log(n); });
