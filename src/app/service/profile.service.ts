import { Injectable } from '@angular/core';

import { ConfigHandler } from '../handler/config.handler';
import { RequestHandler } from '../handler/request.handler';
import { CacheHandler } from '../handler/cache.handler';
import { CryptHandler } from '../handler/crypt.handler';
import { NotificationHandler } from '../handler/notification.handler';

import profileMap from './profile.map.json';

export interface SetProfileFormData {
  name: string;
  mail: string;
  breakpoint: string; // The number of day to auto generate the snapshot
  pwd?: string; // original password
  pwd2?: string; // new password
}

interface ProfileMapStructure {
  status: {
    [statusCode in Status]: string
  };

  permission: {
    [permissionCode in Permission]: string
  };
}

@Injectable() export class ProfileService {
  private endpoint_db = '/db';
  private endpoint_profile = '/profile';
  private encrypt: (str: string) => string;

  constructor(
    private config: ConfigHandler,
    private cacheHandler: CacheHandler,
    private request: RequestHandler,
    private cryptHandler: CryptHandler,
    private notificationHandler: NotificationHandler
  ) {
    this.encrypt = cryptHandler.encrypt;
  }

  getConfig(): Config {
    return this.config.get();
  }

  async updateConfigProfile(): Promise<void> {
    const urlProfile = this.endpoint_profile + '/get';
    const resaultProfile = await this.request.post(urlProfile);
    let userProfile;

    if (!resaultProfile['success']) {
      this.notificationHandler.broadcast('error', resaultProfile['message']);
      return;
    }

    userProfile = resaultProfile['data']['user'][0];

    if (userProfile['status'] >= 20) {
      const urlDbList = this.endpoint_db + '/dbList';
      const resaultDbList = await this.request.post(urlDbList);

      if (!resaultDbList['success']) {
        this.notificationHandler.broadcast('error', resaultDbList['message']);
        return;
      }

      userProfile['dbList'] = resaultDbList['data']['dbList'];
    }

    this.config.setUserProfile(userProfile);
  }

  async getBreakpointDbList(database: string): Promise<ReturnObject<string[]>> {
    const url = this.endpoint_db + '/breakpoint/list';
    const data = {
      db: database
    };

    const resault = await this.request.post<string[]>(url, data);

    if (!resault['success']) {
      this.notificationHandler.broadcast('error', resault['message']);
    }

    return resault;
  }

  async delBreakpointDb(database: string, breakpoint: string): Promise<ReturnObject<null>> {
    const url = this.endpoint_db + '/breakpoint/del';
    const data = {
      db: database,
      breakpoint: breakpoint
    };

    const resault = await this.request.post<null>(url, data);

    if (!resault['success']) {
      this.notificationHandler.broadcast('error', resault['message']);
    } else {
      this.notificationHandler.broadcast('success', 'Deleted success!');
    }

    return resault;
  }

  async createDB(dbName: string, mainCurrenciesType: CurrencyType): Promise<ReturnObject<SimpleMessageResponse>> {
    const url = this.endpoint_db + '/create';
    const data = {
      db: dbName,
      mainCurrenciesType: mainCurrenciesType
    };

    const resault = await this.request.post<SimpleMessageResponse>(url, data);

    if (!resault['success']) {
      this.notificationHandler.broadcast('error', resault['message']);
      return resault;
    }

    await this.updateConfigProfile();

    this.notificationHandler.broadcast('success', 'Created success!');

    return resault;
  }

  async uploadDB(dbName: string, file: File): Promise<ReturnObject<SimpleMessageResponse>> {
    const url = this.endpoint_db + '/upload';
    const data = {
      name: dbName,
      file: file
    };

    const resault = await this.request.upload(url, data);

    if (resault['success']) {
      this.notificationHandler.broadcast('success', 'Upload success!');
      await this.updateConfigProfile();
    } else {
      this.notificationHandler.broadcast('error', resault['message']);
    }

    return resault;
  }

  async delDB(dbName: string): Promise<ReturnObject<SimpleMessageResponse>> {
    const url = this.endpoint_db + '/del';
    const data = {
      db: dbName
    };

    const resault = await this.request.post<SimpleMessageResponse>(url, data);

    await this.updateConfigProfile();

    if (resault['success'] && dbName === this.config.get('database')) {
      this.config.set('database', '');
      this.setActiveDb('');
    }

    if (!resault['success']) {
      this.notificationHandler.broadcast('error', resault['message']);
    } else {
      this.notificationHandler.broadcast('success', 'Updated success!');
    }

    return resault;
  }

  wipeCache(): void {
    this.cacheHandler.wipe('currency');
    this.cacheHandler.wipe('currency.map');
    this.cacheHandler.wipe('type');
    this.cacheHandler.wipe('type.flatmap');
  }

  setActiveDb(dbName: string): void {
    localStorage.setItem(this.config.get('uid') + '.db', dbName);

    this.config.set('database', dbName);

    this.wipeCache();
  }

  async downloadDb(dbName: string, breakpoint?: string): Promise<ReturnObject<Blob>> {
    const url = this.endpoint_db + '/download';

    const data = {};
    data['db'] = dbName;

    if (breakpoint) {
      data['breakpoint'] = breakpoint;
    }

    const resault = await this.request.download(url, data);

    return resault;
  }

  async renameDb(dbName: string, newDbName: string): Promise<ReturnObject<SimpleMessageResponse>> {
    const url = this.endpoint_db + '/rename';

    const data = {};
    data['db'] = dbName;
    data['newDbName'] = newDbName;

    const resault = await this.request.post<SimpleMessageResponse>(url, data);

    await this.updateConfigProfile();

    if (resault['success'] && dbName === this.config.get('database')) {
      this.config.set('database', newDbName);
      this.setActiveDb(newDbName);
    }

    if (!resault['success']) {
      this.notificationHandler.broadcast('error', resault['message']);
    } else {
      this.notificationHandler.broadcast('success', 'Updated success!');
    }

    return resault;
  }

  async set(formObj: SetProfileFormData): Promise<ReturnObject<SimpleMessageResponse>> {
    const url = this.endpoint_profile + '/set';
    const currentProfile = this.config.get('user');

    const data = {};

    ['breakpoint', 'mail', 'name'].forEach(key => {
      if (currentProfile[key] !== formObj[key]) {
        data[key] = formObj[key];
      }
    });

    if (formObj['pwd'] && formObj['pwd2']) {
      data['token'] = this.encrypt(this.encrypt(formObj['pwd']));
      data['token2'] = this.encrypt(formObj['pwd2']);
    }

    if (Object.keys(data).length) {
      const resault = await this.request.post<SimpleMessageResponse>(url, data);

      if (!resault['success']) {
        this.notificationHandler.broadcast('error', resault['message']);
        return;
      }

      if (data['token']) {
        location.href = '';
      } else {
        this.notificationHandler.broadcast('success', 'Updated success!');
        await this.updateConfigProfile();
        return resault;
      }

    }
  }

  getProfileMap(): ProfileMapStructure {
    return profileMap;
  }
}
