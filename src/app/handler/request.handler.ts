import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import * as _ from 'lodash';

import { i18n } from '../i18n/i18n';

import { ConfigHandler } from './config.handler';
import { CryptHandler } from './crypt.handler';

const buildResObj = (arg0?, arg1?, arg2?) => {
  const obj = {
    success: null,
    code: null,
    message: null,
    data: null
  };

  obj.success = arg0 === 200;
  obj.code = arg0;

  if (arg2 === undefined) {
    if (typeof arg1 === 'string') {
      obj.message = arg1;
      obj.data = null;
    } else {
      obj.message = '';
      obj.data = arg1;
    }
  } else {
    obj.message = arg1;
    obj.data = arg2;
  }

  return obj;
};

@Injectable() export class RequestHandler {
  private encrypt;
  private authTokenBase;

  constructor(
    public http: Http,
    private config: ConfigHandler,
    private cryptHandler: CryptHandler
  ) {
    this.encrypt = cryptHandler.encrypt;
  }

  headers = new Headers({
    'Content-Type': 'application/json'
  });

  async post(path: string, formObj: any = {}) {
    const data = _.cloneDeep(formObj);
    const salt = Date.now().toString();

    data['db'] = (formObj && formObj['db']) || this.config.get('database');

    if (!data['db'] && path.indexOf('/profile') === -1 && path.indexOf('/db/dbList') === -1 && path.indexOf('/auth') === -1) {
      console.error('[NO_DB_SELECT]', path, formObj);
      return { code: '401', message: 'NO_DB_SELECT', success: false, data: null };
    }

    this.headers.set('Auth-Salt', salt);
    this.headers.set('Auth-Token', this.encrypt(this.authTokenBase + salt));

    // <any[]> predefine resolve return value type
    return new Promise<any>((resolve, reject) => {
      this.http.post(this.config.get('server_domain') + path, JSON.stringify(data), { headers: this.headers })
        .subscribe(
          responseData => resolve(buildResObj(responseData.status, responseData.json())),
          error => {
            let _msg;
            try {
              _msg = i18n('ajax', error.json()['message']) || error.json()['message'];
            } catch (e) {
              _msg = error;
            }
            resolve(buildResObj(error.status, _msg));
          }
        );
    });
  }

  downloadFile(fileName, data) {
    const blob = new Blob([data], { type: 'multipart/form-data' });
    const url = window.URL.createObjectURL(data);
    const a = document.createElement('a');

    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  async download(path: string, formObj: {}) {
    const salt = Date.now().toString();

    formObj['db'] = formObj['db'] || this.config.get('database');

    return new Promise((resolve, reject) => {
      const xhttp = new XMLHttpRequest();
      xhttp.open('POST', this.config.get('server_domain') + path, true);
      xhttp.responseType = 'blob';
      xhttp.onreadystatechange = () => {
        if (xhttp.readyState === 4) {
          if (xhttp.status === 200) {
            this.downloadFile(xhttp.getResponseHeader('x-filename'), xhttp.response);
          }

          let _res;
          try {
            const _msg = JSON.parse(xhttp.response)['message'];
            _res = i18n('ajax', _msg) || _msg;
          } catch (e) {
            _res = xhttp.response;
          }

          resolve(buildResObj(xhttp.status, _res));
        }
      };

      xhttp.setRequestHeader('Auth-UID', this.headers.get('Auth-UID'));
      xhttp.setRequestHeader('Auth-Salt', salt);
      xhttp.setRequestHeader('Auth-Token', this.encrypt(this.authTokenBase + salt));
      xhttp.setRequestHeader('Content-Type', 'application/json');

      xhttp.send(JSON.stringify(formObj));
    });
  }

  async upload(path: string, formObj: {}) {
    const salt = Date.now().toString();
    const formData = new FormData();

    return new Promise((resolve, reject) => {
      const xhttp = new XMLHttpRequest();

      xhttp.upload.addEventListener('progress', evt => {
        if (evt.lengthComputable) {
          console.log('Upload progress: ', evt.loaded + '/' + evt.total);
        }
      }, false);

      xhttp.addEventListener('load', () => {
        let res;
        try {
          const msg = JSON.parse(xhttp.response)['message'];
          res = i18n('ajax', msg) || msg;
        } catch (e) {
          res = xhttp.response;
        }

        resolve(buildResObj(xhttp.status, res));
      }, false);

      xhttp.open('POST', this.config.get('server_domain') + path, true);
      xhttp.setRequestHeader('Auth-UID', this.headers.get('Auth-UID'));
      xhttp.setRequestHeader('Auth-Salt', salt);
      xhttp.setRequestHeader('Auth-Token', this.encrypt(this.authTokenBase + salt));
      xhttp.onload = function (e) { };

      Object.keys(formObj)
        .forEach(key => {
          formData.append(key, formObj[key]);
        });

      xhttp.send(formData); // multipart/form-data
    });
  }


  async login(path: string, formObj: any = {}) {
    const postData = {};
    const salt = Date.now();
    formObj = _.cloneDeep(formObj);

    postData['acc'] = formObj['acc'];
    postData['salt'] = salt;
    postData['token'] = this.encrypt(this.encrypt(formObj['pwd']) + salt);
    postData['keep'] = formObj['keep'];

    // <any[]> predefine resolve return value type
    return new Promise<any>((resolve, reject) => {
      this.http.post(this.config.get('server_domain') + path, JSON.stringify(postData), { headers: this.headers })
        .subscribe(
          responseData => {
            const responseJson = responseData.json();
            const uid = responseJson['uid'];

            this.authTokenBase = this.encrypt(salt + this.encrypt(formObj['pwd']));

            if (formObj['keep']) {
              localStorage.setItem('token', uid + ',' + this.encrypt(salt + salt + this.encrypt(formObj['pwd'])));
            } else {
              localStorage.removeItem('token');
            }

            this.headers.set('Auth-UID', responseJson['uid']);

            resolve(buildResObj(responseData.status, responseJson));
          }, error => {
            let msg;
            try {
              msg = i18n('ajax', error.json()['message']) || error.json()['message'];
            } catch (e) {
              msg = error;
            }

            resolve(buildResObj(error.status, msg));
          });
    });
  }

  async loginByToken(path: string, formObj: any = {}) {
    const postData = {};
    const salt = Date.now();
    formObj = _.cloneDeep(formObj);

    postData['uid'] = formObj['uid'];
    postData['salt'] = salt;
    postData['token'] = this.encrypt(formObj['token'] + salt);


    // <any[]> predefine resolve return value type
    return new Promise<any>((resolve, reject) => {
      this.http.post(this.config.get('server_domain') + path, JSON.stringify(postData), { headers: this.headers })
        .subscribe(
          reponseData => {
            const reponseJson = reponseData.json();
            const uid = reponseJson['uid'];

            this.authTokenBase = this.encrypt(salt + formObj['token']);
            localStorage.setItem('token', uid + ',' + this.encrypt(salt + salt + formObj['token']));

            this.headers.set('Auth-UID', reponseJson['uid']);

            resolve(buildResObj(reponseData.status, reponseJson));
          }, error => {
            let _msg;
            try {
              _msg = i18n('ajax', error.json()['message']) || error.json()['message'];
            } catch (e) {
              _msg = error;
            }
            resolve(buildResObj(error.status, _msg));
          });
    });
  }

}
