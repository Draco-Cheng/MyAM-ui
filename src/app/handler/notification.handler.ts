import { Injectable } from '@angular/core';

type Callback = (tpye: NotificationType, msg: string) => void;

const callbackPool = {};

@Injectable() export class NotificationHandler {
  constructor() { }

  broadcast(type: NotificationType, msg: string): void {
    const _keys = Object.keys(callbackPool);
    console.log('[NotificationHandler] Broadcast to ' + _keys.length + ' clients, msg: [' + type + '] ' + msg);
    _keys.forEach(key => callbackPool[key](type, msg));
  }

  registCallback(callback: Callback): TimeStamp {
    const time = Date.now();
    callbackPool[time] = callback;
    return time;
  }

  unregistCallback(id: string) {
    delete callbackPool[id];
  }
}
