import { Injectable } from '@angular/core';

const callbackPool = {};

@Injectable() export class NotificationHandler {
  constructor() {}

  broadcast(type: string, msg: string) {
    const _keys = Object.keys(callbackPool);

    console.log('[NotificationHandler] Broadcast to ' + _keys.length + ' clients, msg: [' + type + '] ' + msg);

    _keys.forEach(key => callbackPool[key](type, msg));
  }

  registCallback(callback: Function) {
    const time = Date.now();
    callbackPool[time] = callback;
    return time;
  }

  unregistCallback(id) {
    delete callbackPool[id];
  }
}
