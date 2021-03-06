import { Injectable } from '@angular/core';

const memoryCache = {};

class CacheEle<T> {
  status = -1; // -1 notReady, 0 async progress, 1 ready
  legacy = false;
  waitingQue = [];
  data: T = null;
  constructor() { }
}

@Injectable() export class CacheHandler {
  constructor() { }

  async wipe(name: string) {
    const cache = memoryCache[name];

    if (cache) {
      cache['legacy'] = true;
      delete memoryCache[name];
    }
  }

  // if_not_exist_will_create_async_later: if not ready, return cache inmmediatly and set status to 'aync'
  async get<T>(name: string, if_not_exist_will_create_async_later?: boolean) {
    const cache = memoryCache[name] = memoryCache[name] || new CacheEle<T>();
    switch (cache.status) {
      case -1:
        if (if_not_exist_will_create_async_later) {
          cache.status = 0;
        }
        break;
      case 0:
        return new Promise(resolve => {
          cache['waitingQue'].push(resolve);
        });
    }
    return Promise.resolve(cache);
  }

  set<T>(name: string, data: T) {
    const cache = memoryCache[name] = memoryCache[name] || new CacheEle<T>();
    cache['legacy'] = false;
    cache['status'] = 1;
    cache['data'] = data;

    cache['waitingQue'].forEach(func => func(cache));
    cache['waitingQue'] = [];
  }

  regAsyncReq<T>(name: string) {
    const cache = memoryCache[name] = memoryCache[name] || new CacheEle<T>();
    cache['status'] = 0;

    return data => {
      this.set(name, data);
      return cache;
    };
  }
}
