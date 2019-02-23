import { Injectable } from '@angular/core';

import { RequestHandler } from '../handler/request.handler';
import { NotificationHandler } from '../handler/notification.handler';

@Injectable() export class RecordsService {

  constructor(
    private request: RequestHandler,
    private notificationHandler: NotificationHandler
  ) { }

  private endpoint = '/record'; // URL to web API

  async get(formObj?: any) {
    const url = this.endpoint + '/get';
    const data = formObj || { orderBy: ['rid', 'DESC'], limit: 10 };

    if (typeof data.cashType === 'string') {
      data.cashType = data.cashType * 1;
    }

    const resault = <any[]>await this.request.post(url, data);

    if (resault['success']) {
      resault['data'].forEach(record => {
        const map = {};
        record.tids = record.tids ? record.tids.split(',') : [];
        record.tids.forEach(tid => map[tid] = true);
        record.tidsObjMap = map;
      });
    } else {
      this.notificationHandler.broadcast('error', resault['message']);
    }

    return resault;
  }

  async set(recordObj?: any) {
    const url = this.endpoint + '/set';
    const data = {
      rid: recordObj.rid,
      cashType: recordObj.cashType * 1,
      cid: recordObj.cid,
      value: recordObj.value,
      memo: recordObj.memo,
      date: recordObj.date
    };

    const resault = await this.request.post(url, data);

    if (!resault['success']) {
      this.notificationHandler.broadcast('error', resault['message']);
    } else {
      this.notificationHandler.broadcast('success', 'Updated success!');
    }

    return resault;
  }

  async setType(rid: RecordId, tids: Tid[]) {
    const url = this.endpoint + '/setTypes';
    const data = {
      rid: rid,
      tids_json: tids
    };

    const resault = await this.request.post(url, data);

    if (!resault['success']) {
      this.notificationHandler.broadcast('error', resault['message']);
    }

    return resault;
  }

  async del(recordObj?: any) {
    const url = this.endpoint + '/del';
    const data = {
      rid: recordObj.rid
    };

    const resault = await this.request.post(url, data);

    if (!resault['success']) {
      this.notificationHandler.broadcast('error', resault['message']);
    } else {
      this.notificationHandler.broadcast('success', 'Deleted success!');
    }

    return resault;
  }
}
