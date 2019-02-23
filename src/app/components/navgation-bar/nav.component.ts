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
  private __meta = {};
  public __isInit;

  public user: UserDataForConfig;
  public isLogin: boolean;
  public database: string;
  public pageTitle = 'MyAM';

  constructor(
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    this.getConfig();
    this.__isInit = true;
  }

  async __checkDataUpToDate(): Promise<void> {
    if (this.__meta['config']['legacy']) {
      this.getConfig();
    }
  }

  getConfig(): void {
    const config: Config = this.__meta['config'] = this.profileService.getConfig();
    this.user = config['user'];
    this.isLogin = config['isLogin'];
    this.database = config['database'];
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    location.href = '';
  }
}
