import { Injectable } from '@angular/core';

import { RequestHandler } from '../handler/request.handler';
import { ConfigHandler } from '../handler/config.handler';
import { NotificationHandler } from '../handler/notification.handler';
import { CryptHandler } from '../handler/crypt.handler';

import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';

export interface LoginFormData {
  acc: string;
  pwd: string;
  keep: boolean;
}

export interface RegistFormData {
  name: string;
  account: string;
  pwd: string;
  mail: string;
  token?: string;
}

@Injectable() export class AuthService {

  private endpoint = '/auth';

  private encrypt: (str: string) => string;

  constructor(
    private router: Router,
    private config: ConfigHandler,
    private request: RequestHandler,
    private cryptHandler: CryptHandler,
    private notificationHandler: NotificationHandler
  ) {
    this.encrypt = cryptHandler.encrypt;
  }


  async login(formObj: LoginFormData): Promise<void> {
    const url = this.endpoint + '/login';
    console.log('[AuthService] login:', formObj['acc']);

    const res = await this.request.login(url, formObj);

    if (res['success']) {
      await this.config.setUserProfile(res['data']);
      this.router.navigate(res['data']['dbList'].length ? ['/dashboard'] : ['/profile']);
    } else {
      this.notificationHandler.broadcast('error', 'Login Fail!');
    }
  }

  async loginByToken(): Promise<boolean> {
    const url = this.endpoint + '/login';
    const loginInfo = localStorage.getItem('token').split(',');
    const res = await this.request.loginByToken(url, { uid: loginInfo[0], token: loginInfo[1] });

    if (res['success']) {
      await this.config.setUserProfile(res['data']);
      !res['data']['dbList'].length && this.router.navigate(['/profile']);
    }

    return !!res['success'];
  }

  async logout(): Promise<void> {
    const url = this.endpoint + '/logout';
    console.log('[AuthService] logout');

    const res = await this.request.post(url);

    if (res) {
      localStorage.removeItem('token');
    }
  }

  async register(formObject: RegistFormData): Promise<ReturnObject<any>> {
    const url = this.endpoint + '/register';

    const data = {};

    data['name'] = formObject['name'];
    data['account'] = formObject['account'];
    data['token'] = this.encrypt(formObject['pwd']);
    data['mail'] = formObject['mail'];

    console.log('[AuthService] register');

    const resault = await this.request.post(url, data);

    if (!resault['success']) {
      this.notificationHandler.broadcast('error', resault['message']);
    } else {
      this.notificationHandler.broadcast('success', 'Register account success!');
      this.router.navigate(['/login']);
    }

    return resault;
  }

}

@Injectable() export class AuthGuard implements CanActivate {
  private endpoint = '/auth';

  constructor(
    private router: Router,
    private config: ConfigHandler,
    private request: RequestHandler,
    private authService: AuthService,
    private notificationHandler: NotificationHandler
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    console.log('AuthGuard#canActivate called');
    return new Promise(async (resolve: Function) => {

      if (this.config.get('isLogin')) {
        return resolve(true);
      }

      if (localStorage.getItem('token') && await this.authService.loginByToken()) {
        return resolve(true);
      }

      localStorage.removeItem('token');

      this.router.navigate(['/login']);
      resolve(false);

    });
  }
}
