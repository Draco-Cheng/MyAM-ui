import { Injectable } from '@angular/core';

import * as _ from 'lodash';

import defaultConf from '../config.json';

let config: Config = defaultConf;

@Injectable() export class ConfigHandler {

  get(name?): string | Config {
    return name ? config[name] : config;
  }

  set(name: string, data: any): void {
    const newConfig = _.cloneDeep(config);
    newConfig[name] = typeof data === 'object' ? _.cloneDeep(data) : data;

    config['legacy'] = true;
    config = newConfig;
  }

  setUserProfile(userProfile: UserDataForConfig): void {
    this.set('user', userProfile);
    this.set('uid', userProfile['uid']);
    this.set('isLogin', true);

    const uid = userProfile['uid'];
    const dbList = userProfile['dbList'];

    if (dbList.length) {
      const localSaveDB = localStorage.getItem(uid + '.db');

      if (localSaveDB && dbList.indexOf(localSaveDB) !== -1) {
        this.set('database', localSaveDB);
      } else {
        this.set('database', dbList[0]);
        localStorage.setItem(uid + '.db', dbList[0]);
      }
    }
  }
}
