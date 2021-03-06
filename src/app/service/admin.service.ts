import { Injectable } from '@angular/core';

import { ConfigHandler } from '../handler/config.handler';
import { RequestHandler } from '../handler/request.handler';
import { CryptHandler } from '../handler/crypt.handler';
import { NotificationHandler } from '../handler/notification.handler';

export interface SetUserFormData {
  target_uid: Uid;
  newPwd?: string;
  status?: Status;
  permission?: Permission;
  token?: string;
}

@Injectable() export class AdminServer {
  private endpoint = '/admin';
  private encrypt: (str: string) => string;

  constructor(
    private config: ConfigHandler,
    private request: RequestHandler,
    private cryptHandler: CryptHandler,
    private notificationHandler: NotificationHandler
  ) {
    this.encrypt = cryptHandler.encrypt;
  }

  async getUserList(): Promise<ReturnObject<UserDataForAdmin[]>> {

    const url = this.endpoint + '/userList';
    const data = {};

    const resault = await this.request.post<UserDataForAdmin[]>(url, data);

    if (!resault['success']) {
      this.notificationHandler.broadcast('error', resault['message']);
    }

    return resault;
  }

  async setUser(formObj: SetUserFormData): Promise<ReturnObject<UserDataForAdmin>> {
    const url = this.endpoint + '/setUser';
    const data = formObj;

    if (data['newPwd']) {
      data['token'] = this.encrypt(data['newPwd']);
      delete data['newPwd'];
    }

    const resault = await this.request.post<UserDataForAdmin>(url, data);

    if (!resault['success']) {
      this.notificationHandler.broadcast('error', resault['message']);
    } else {
      this.notificationHandler.broadcast('success', 'Update success!');
    }

    return resault;
  }
}
