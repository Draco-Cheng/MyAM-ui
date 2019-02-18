import { Component, OnInit } from '@angular/core';

import { ProfileService } from '../../service/profile.service';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.template.html',
  styleUrls: ['./nav.style.less'],
  providers: [
    ProfileService,
    AuthService
  ]
})
export class NavComponent implements OnInit {
  private name = 'MyAM';
  private __meta = {};
  public __isInit;

  private user;
  private isLogin;
  private database;

  constructor(
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.getConfig();
    this.__isInit = true;
  }

  async __checkDataUpToDate() {
    if (this.__meta['config']['legacy']) {
      this.getConfig();
    }
  }

  getConfig() {
    const config = this.__meta['config'] = this.profileService.getConfig();
    this.user = config['user'];
    this.isLogin = config['isLogin'];
    this.database = config['database'];
  }

  async logout() {
    await this.authService.logout();
    location.href = '';
  }
}
