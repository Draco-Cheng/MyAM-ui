import { Injectable } from '@angular/core';

import defaultConf from '../config.json';

let config = defaultConf;

function cloneObj(obj) {
  return JSON.parse(JSON.stringify(obj));
}

@Injectable() export class ConfigHandler {

  get(name ? ) {
    return name ? config[name] : config;
  }

  set(name, data) {
    const newConfig = cloneObj(config);
    newConfig[name] = typeof data === 'object' ? cloneObj(data) : data;

    config['legacy'] = true;
    config = newConfig;
  }

  setUserProfile(userProfile) {
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
